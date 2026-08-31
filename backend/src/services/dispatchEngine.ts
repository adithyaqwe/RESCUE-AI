import Responder, { IResponder } from '../models/Responder';

// Calculate distance between two coordinates in km
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(1));
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export interface DispatchRecommendation {
  responder: IResponder;
  distance: number;
  eta: number; // in minutes (assuming 40 km/h average speed)
  reason: string;
}

export const findNearestResponders = async (
  lat: number,
  lng: number,
  requiredTypes: string[]
): Promise<DispatchRecommendation[]> => {
  const recommendations: DispatchRecommendation[] = [];

  for (const type of requiredTypes) {
    // Find all available responders of the required type
    const availableResponders = await Responder.find({
      type: type as any,
      status: 'AVAILABLE',
    });

    if (availableResponders.length === 0) continue;

    // Sort responders by distance
    let nearestResponder: IResponder | null = null;
    let minDistance = Infinity;

    for (const responder of availableResponders) {
      const dist = calculateDistance(
        lat,
        lng,
        responder.currentLocation.lat,
        responder.currentLocation.lng
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestResponder = responder;
      }
    }

    if (nearestResponder) {
      // Calculate ETA: distance / 40 km/h * 60 min/h
      const eta = Math.ceil((minDistance / 40) * 60);

      recommendations.push({
        responder: nearestResponder,
        distance: minDistance,
        eta: Math.max(eta, 2), // Minimum 2 minutes
        reason: `Closest available ${type} unit (${minDistance} km away, ETA: ${Math.max(eta, 2)} mins)`
      });
    }
  }

  return recommendations;
};
