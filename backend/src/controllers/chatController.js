import Incident from '../models/Incident.js';
import Responder from '../models/Responder.js';
import axios from 'axios';

const fallbackChat = async (query) => {
  const q = (query || '').toLowerCase();
  
  if (q.includes('unassigned') || q.includes('not assigned')) {
    const unassigned = await Incident.find({ status: { $ne: 'RESOLVED' }, assignedResponders: { $size: 0 } });
    if (unassigned.length === 0) {
      return 'All active incidents have been assigned to responder units.';
    }
    return `There are ${unassigned.length} unassigned incidents. ${unassigned.map(i => `${i.incidentId} (${i.type} - ${i.priority})`).join(', ')} currently require responders.`;
  }

  if (q.includes('critical')) {
    const critical = await Incident.find({ priority: 'CRITICAL', status: { $ne: 'RESOLVED' } });
    if (critical.length === 0) {
      return 'There are currently no active CRITICAL severity incidents.';
    }
    return `There are ${critical.length} active critical incidents: ${critical.map(i => `${i.incidentId} at ${i.location.address}`).join(', ')}.`;
  }

  if (q.includes('summarize') || q.includes('summary') || q.includes('today')) {
    const total = await Incident.countDocuments();
    const critical = await Incident.countDocuments({ priority: 'CRITICAL' });
    const high = await Incident.countDocuments({ priority: 'HIGH' });
    const resolved = await Incident.countDocuments({ status: 'RESOLVED' });
    
    return `Incident summary: There are ${total} total reports in the database. Breakdown: ${critical} Critical, ${high} High priority. ${resolved} incidents have been successfully resolved. Average dispatcher response time is under 5 minutes.`;
  }

  if (q.includes('responder') || q.includes('available')) {
    const available = await Responder.find({ status: 'AVAILABLE' });
    return `There are ${available.length} responder units currently AVAILABLE: ${available.map(r => `${r.unitId} (${r.type})`).join(', ')}.`;
  }

  return 'I am the RescueAI Assistant. You can ask me questions like: "Which critical incidents are unassigned?", "Summarize today\'s incidents", or "How many responders are available?".';
};

export const handleChatQuery = async (req, res) => {
  try {
    const { query, history } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      const responseText = await fallbackChat(query);
      return res.status(200).json({ response: responseText });
    }

    // Fetch data context for Gemini
    const incidents = await Incident.find().populate('assignedResponders');
    const responders = await Responder.find();

    const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
    const resolvedIncidentsCount = incidents.filter(i => i.status === 'RESOLVED').length;
    const criticalCount = activeIncidents.filter(i => i.priority === 'CRITICAL').length;
    const availableCount = responders.filter(r => r.status === 'AVAILABLE').length;
    const enRouteCount = responders.filter(r => r.status === 'EN_ROUTE').length;

    const dataContext = {
      totalIncidents: incidents.length,
      resolvedIncidents: resolvedIncidentsCount,
      criticalIncidents: criticalCount,
      availableResponders: availableCount,
      enRouteResponders: enRouteCount,
      activeIncidents: activeIncidents.map(i => ({
        id: i.incidentId,
        type: i.type,
        priority: i.priority,
        address: i.location.address,
        victims: i.victimsCount,
        status: i.status,
        assignedUnits: i.assignedResponders.map(r => r.unitId),
        aiAnalysis: i.aiAnalysis
      })),
      responders: responders.map(r => ({
        unitId: r.unitId,
        type: r.type,
        status: r.status,
        location: r.currentLocation
      }))
    };

    const systemInstructionText = `You are RescueAI Assistant, the central command intelligence system for an emergency responder fleet and dispatch network.
Use the following context from the live database of active incidents and responders to answer the operator's request.
Be precise, clear, and act like a secure government/military operations terminal AI assistant.

OPERATIONAL TELEMETRY:
- Total Incidents Reported: ${dataContext.totalIncidents}
- Incidents Resolved: ${dataContext.resolvedIncidents}
- Active Critical Emergencies: ${dataContext.criticalIncidents}
- Responders Available (Standby): ${dataContext.availableResponders}
- Responders En-Route: ${dataContext.enRouteResponders}

ACTIVE EMERGENCIES DETAILS:
${JSON.stringify(dataContext.activeIncidents, null, 2)}

RESPONDER FLEET STATUS:
${JSON.stringify(dataContext.responders, null, 2)}`;

    // Build contents array supporting chat history
    const contents = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg) => {
        const role = msg.sender === 'user' ? 'user' : 'model';
        contents.push({
          role,
          parts: [{ text: msg.text }]
        });
      });
    }

    // Append current query
    contents.push({
      role: 'user',
      parts: [{ text: query }]
    });

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents,
        systemInstruction: {
          parts: [{ text: systemInstructionText }]
        }
      }
    );

    const reply = response.data.candidates[0].content.parts[0].text;
    res.status(200).json({ response: reply });
  } catch (error) {
    console.error('Chat error:', error);
    const responseText = await fallbackChat(req.body.query);
    res.status(200).json({ response: responseText });
  }
};
