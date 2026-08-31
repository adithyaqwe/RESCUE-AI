export interface PriorityResult {
  score: number;
  category: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export const calculatePriorityScore = (
  description: string,
  type: string,
  severityFromAI: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  victimsCount: number
): PriorityResult => {
  let score = 0;
  const desc = description.toLowerCase();

  // 1. Severity Base Score
  if (severityFromAI === 'CRITICAL') score += 40;
  else if (severityFromAI === 'HIGH') score += 30;
  else if (severityFromAI === 'MEDIUM') score += 20;
  else if (severityFromAI === 'LOW') score += 10;

  // 2. Unconscious person (+30)
  if (desc.includes('unconscious') || desc.includes('unresponsive') || desc.includes('passed out') || desc.includes('fainted') || desc.includes('not breathing')) {
    score += 30;
  }

  // 3. Multiple victims (+20)
  if (victimsCount > 1 || desc.includes('multiple') || desc.includes('people injured') || desc.includes('victims')) {
    score += 20;
  }

  // 4. Fire (+20)
  if (type.toLowerCase() === 'fire' || desc.includes('fire') || desc.includes('smoke') || desc.includes('explosion') || desc.includes('burning')) {
    score += 20;
  }

  // 5. Location isolated (+10)
  if (desc.includes('isolated') || desc.includes('remote') || desc.includes('highway') || desc.includes('expressway') || desc.includes('woods') || desc.includes('forest') || desc.includes('rural')) {
    score += 10;
  }

  // Determine final category based on score boundaries
  let category: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (score >= 80) {
    category = 'CRITICAL';
  } else if (score >= 60) {
    category = 'HIGH';
  } else if (score >= 30) {
    category = 'MEDIUM';
  } else {
    category = 'LOW';
  }

  return { score, category };
};
