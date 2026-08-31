import { Request, Response } from 'express';
import Responder from '../models/Responder';

export const createResponder = async (req: Request, res: Response) => {
  try {
    const { unitId, type, currentLocation, contactInfo } = req.body;

    if (!unitId || !type || !currentLocation) {
      return res.status(400).json({ error: 'unitId, type, and currentLocation (lat/lng) are required.' });
    }

    const responder = new Responder({
      unitId,
      type,
      currentLocation,
      contactInfo
    });

    await responder.save();

    // Emit live updates
    const io = req.app.get('io');
    io.emit('responders_updated');

    res.status(201).json(responder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getResponders = async (req: Request, res: Response) => {
  try {
    const responders = await Responder.find();
    res.status(200).json(responders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateResponderLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    const responder = await Responder.findById(id);
    if (!responder) {
      return res.status(404).json({ error: 'Responder not found' });
    }

    responder.currentLocation = { lat, lng };
    await responder.save();

    // Emit live updates
    const io = req.app.get('io');
    io.emit('responders_updated');

    res.status(200).json(responder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
