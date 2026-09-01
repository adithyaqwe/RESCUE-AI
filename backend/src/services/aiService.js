import axios from 'axios';

// Fallback rule-based classifier if Gemini is not configured or fails
const fallbackClassifier = (description) => {
  const desc = (description || '').toLowerCase();
  let type = 'Medical';
  let severity = 'MEDIUM';
  let victimsCount = 1;
  let immediateAction = 'Send medical responders';
  let recommendedResponseTime = '15 minutes';
  let requiredServices = ['Ambulance'];

  if (desc.includes('fire') || desc.includes('smoke') || desc.includes('explosion')) {
    type = 'Fire';
    requiredServices = ['Fire', 'Police'];
    immediateAction = 'Evacuate area and extinguish fire';
    recommendedResponseTime = '10 minutes';
  } else if (desc.includes('accident') || desc.includes('crash') || desc.includes('collision')) {
    type = 'Accident';
    requiredServices = ['Ambulance', 'Police'];
    immediateAction = 'Secure scene and assist injured';
    recommendedResponseTime = '8 minutes';
  } else if (desc.includes('crime') || desc.includes('robbery') || desc.includes('fight') || desc.includes('theft')) {
    type = 'Crime';
    requiredServices = ['Police'];
    immediateAction = 'Dispatch police patrol';
    recommendedResponseTime = '10 minutes';
  }

  // Parse victims count
  const numbers = desc.match(/\d+/);
  if (numbers) {
    victimsCount = parseInt(numbers[0], 10);
  } else if (desc.includes('two') || desc.includes('couple')) {
    victimsCount = 2;
  } else if (desc.includes('multiple') || desc.includes('several') || desc.includes('many')) {
    victimsCount = 3;
  }

  // Determine severity based on key words
  if (desc.includes('unconscious') || desc.includes('dead') || desc.includes('breathing') || desc.includes('critical') || desc.includes('explosion')) {
    severity = 'CRITICAL';
    recommendedResponseTime = '5 minutes';
  } else if (desc.includes('severe') || desc.includes('broken bone') || desc.includes('bleeding')) {
    severity = 'HIGH';
    recommendedResponseTime = '10 minutes';
  }

  // Ensure medical/ambulance is required if victims are present or severe conditions exist
  if (victimsCount > 0 && !requiredServices.includes('Ambulance') && !requiredServices.includes('Medical')) {
    requiredServices.push('Ambulance');
  }

  return {
    type,
    severity,
    victimsCount,
    immediateAction,
    recommendedResponseTime,
    requiredServices,
    confidence: 0.75,
    reasoning: 'Rule-based local fallback heuristic classification.'
  };
};

export const classifyIncident = async (description) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.log('Gemini API key not configured, using fallback rule-based classifier.');
    return fallbackClassifier(description);
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are an AI dispatcher for a professional emergency response system. Analyze the following emergency report and classify it. Output ONLY a valid JSON object matching the requested schema.

Emergency Report:
"${description}"`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              type: { type: 'STRING', description: 'Category of the emergency, e.g. Accident, Fire, Crime, Medical' },
              severity: { type: 'STRING', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
              victimsCount: { type: 'INTEGER', description: 'Number of people injured or affected' },
              immediateAction: { type: 'STRING', description: 'First step critical instruction for dispatcher' },
              recommendedResponseTime: { type: 'STRING', description: 'e.g. < 5 minutes, < 10 minutes' },
              requiredServices: {
                type: 'ARRAY',
                items: { type: 'STRING', enum: ['Ambulance', 'Police', 'Fire', 'Medical'] }
              },
              confidence: { type: 'NUMBER', description: 'Confidence score from 0.0 to 1.0' },
              reasoning: { type: 'STRING', description: 'Brief 1-2 sentence reasoning for these selections' }
            },
            required: ['type', 'severity', 'victimsCount', 'immediateAction', 'recommendedResponseTime', 'requiredServices', 'confidence', 'reasoning']
          }
        }
      }
    );

    const jsonText = response.data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return fallbackClassifier(description);
  }
};
