import Responder from '../models/Responder.js';

// Calculate distance between two coordinates in km
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

export const findNearestResponders = async (lat, lng, requiredTypes) => {
  const recommendations = [];

  for (const type of requiredTypes) {
    // Find all available responders of the required type
    const availableResponders = await Responder.find({
      type: type,
      status: 'AVAILABLE',
    });

    if (availableResponders.length === 0) continue;

    // Sort responders by distance
    let nearestResponder = null;
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
