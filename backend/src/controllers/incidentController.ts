import { Request, Response } from 'express';
import Incident from '../models/Incident';
import Responder from '../models/Responder';
import { classifyIncident } from '../services/aiService';
import { calculatePriorityScore } from '../services/priorityEngine';
import { findNearestResponders, calculateDistance } from '../services/dispatchEngine';

// Central location (e.g., University campus center)
const CAMPUS_LAT = 40.730610;
const CAMPUS_LNG = -73.935242;

export const createIncident = async (req: Request, res: Response) => {
  try {
    const { description, locationAddress, victimsCount, coordinates } = req.body;

    if (!description || !locationAddress) {
      return res.status(400).json({ error: 'Description and location address are required.' });
    }

    // 1. AI Classification
    const aiAnalysis = await classifyIncident(description);

    // 2. Deterministic Priority Scoring
    const { score, category } = calculatePriorityScore(
      description,
      aiAnalysis.type,
      aiAnalysis.severity,
      victimsCount || aiAnalysis.victimsCount
    );

    // Generate random coordinates near campus if not provided
    const lat = coordinates?.lat || CAMPUS_LAT + (Math.random() - 0.5) * 0.05;
    const lng = coordinates?.lng || CAMPUS_LNG + (Math.random() - 0.5) * 0.05;

    // Generate incident ID
    const incidentId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Dispatch Recommendation
    const recommendations = await findNearestResponders(lat, lng, aiAnalysis.requiredServices);

    const newIncident = new Incident({
      incidentId,
      type: aiAnalysis.type,
      priority: category,
      priorityScore: score,
      location: {
        address: locationAddress,
        coordinates: { lat, lng }
      },
      victimsCount: victimsCount || aiAnalysis.victimsCount,
      description,
      requiredServices: aiAnalysis.requiredServices,
      status: 'ANALYZED',
      aiConfidence: aiAnalysis.confidence || 0.85,
      aiAnalysis: {
        ...aiAnalysis,
        recommendations
      }
    });

    await newIncident.save();

    // Emit Socket notification
    const io = req.app.get('io');
    io.emit('incident_created', newIncident);

    res.status(201).json(newIncident);
  } catch (error: any) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getIncidents = async (req: Request, res: Response) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 }).populate('assignedResponders');
    res.status(200).json(incidents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getIncidentById = async (req: Request, res: Response) => {
  try {
    const incident = await Incident.findOne({ incidentId: req.params.id as any }).populate('assignedResponders');
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.status(200).json(incident);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const assignResponders = async (req: Request, res: Response) => {
  try {
    const { incidentId } = req.params;
    const { responderIds } = req.body; // Array of responder MongoDB ObjectIds

    const incident = await Incident.findOne({ incidentId: incidentId as any });
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Prevent duplicate dispatch
    if (['DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'RESOLVED'].includes(incident.status)) {
      return res.status(400).json({ error: 'Incident is already dispatched or resolved' });
    }

    let maxEta = 0;

    // Update responder statuses and update incident
    for (const rId of responderIds) {
      const responder = await Responder.findById(rId);
      if (responder) {
        if (responder.status !== 'AVAILABLE') {
          return res.status(400).json({ error: `Responder ${responder.unitId} is not available` });
        }
        responder.status = 'EN_ROUTE';
        await responder.save();

        // Calculate distance and ETA
        if (incident.location.coordinates) {
          const dist = calculateDistance(
            incident.location.coordinates.lat,
            incident.location.coordinates.lng,
            responder.currentLocation.lat,
            responder.currentLocation.lng
          );
          const eta = Math.max(Math.ceil((dist / 40) * 60), 2);
          if (eta > maxEta) {
            maxEta = eta;
          }
        }
        
        // Fix ObjectId comparison issue
        const isAlreadyAssigned = incident.assignedResponders.some(
          (id) => id.toString() === responder._id.toString()
        );
        if (!isAlreadyAssigned) {
          incident.assignedResponders.push(responder._id as any);
        }
      }
    }

    incident.status = 'DISPATCHED';
    incident.estimatedArrival = maxEta;
    await incident.save();

    const populatedIncident = await incident.populate('assignedResponders');

    // Emit live updates
    const io = req.app.get('io');
    io.emit('incident_updated', populatedIncident);
    io.emit('responders_updated');

    res.status(200).json(populatedIncident);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateIncidentStatus = async (req: Request, res: Response) => {
  try {
    const { incidentId } = req.params;
    const { status } = req.body; // 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED'

    const incident = await Incident.findOne({ incidentId: incidentId as any }).populate('assignedResponders');
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    incident.status = status;

    if (status === 'RESOLVED') {
      // Release all assigned responders
      for (const responderObj of incident.assignedResponders) {
        const responder = await Responder.findById(responderObj._id);
        if (responder) {
          responder.status = 'AVAILABLE';
          await responder.save();
        }
      }
      incident.responseTimeMs = Date.now() - incident.createdAt.getTime();
    }

    await incident.save();

    // Emit live updates
    const io = req.app.get('io');
    io.emit('incident_updated', incident);
    io.emit('responders_updated');

    res.status(200).json(incident);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
