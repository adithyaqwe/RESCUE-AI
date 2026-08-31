import { Server } from 'socket.io';
import Responder from '../models/Responder';
import Incident from '../models/Incident';
import { calculateDistance } from './dispatchEngine';

export const startSimulation = (io: Server) => {
  console.log('Background GPS simulation service started.');

  setInterval(async () => {
    try {
      // Find all active incidents that are in dispatched/en route/arrived statuses
      const activeIncidents = await Incident.find({
        status: { $in: ['DISPATCHED', 'EN_ROUTE', 'ARRIVED'] }
      }).populate('assignedResponders');

      if (activeIncidents.length === 0) return;

      let respondersUpdated = false;

      for (const incident of activeIncidents) {
        if (!incident.location.coordinates) continue;

        const target = incident.location.coordinates;
        let allArrived = true;
        let anyEnRoute = false;

        for (const responderObj of incident.assignedResponders as any) {
          const responder = await Responder.findById(responderObj._id);
          if (!responder || responder.status !== 'EN_ROUTE') {
            if (responder && responder.status === 'ON_SCENE') {
              // already arrived
            } else {
              allArrived = false;
            }
            continue;
          }

          anyEnRoute = true;
          const current = responder.currentLocation;

          // Compute distance
          const dist = calculateDistance(current.lat, current.lng, target.lat, target.lng);

          if (dist <= 0.2) {
            // Responder arrived at incident scene
            responder.status = 'ON_SCENE';
            responder.currentLocation = target;
            await responder.save();
            respondersUpdated = true;

            console.log(`[Simulator] Responder ${responder.unitId} arrived at scene for incident ${incident.incidentId}`);
            io.emit('system_log', `Responder ${responder.unitId} arrived on-scene at ${incident.location.address}.`);
          } else {
            // Step 15% closer to target coordinates
            const stepRatio = 0.15;
            const newLat = current.lat + (target.lat - current.lat) * stepRatio;
            const newLng = current.lng + (target.lng - current.lng) * stepRatio;

            responder.currentLocation = { lat: newLat, lng: newLng };
            await responder.save();
            respondersUpdated = true;
            allArrived = false;
          }
        }

        // If responder statuses changed, update incident status if appropriate
        if (anyEnRoute && allArrived && incident.status !== 'ARRIVED') {
          incident.status = 'ARRIVED';
          await incident.save();
          
          const fullyPopulated = await Incident.findById(incident._id).populate('assignedResponders');
          io.emit('incident_updated', fullyPopulated);
          io.emit('system_log', `All units arrived. Incident ${incident.incidentId} status updated to ARRIVED.`);
        } else if (respondersUpdated) {
          // Send live coordinate update for radar map
          const fullyPopulated = await Incident.findById(incident._id).populate('assignedResponders');
          io.emit('incident_updated', fullyPopulated);
        }
      }

      if (respondersUpdated) {
        io.emit('responders_updated');
      }
    } catch (error) {
      console.error('Error running simulation loop:', error);
    }
  }, 4000);
};
