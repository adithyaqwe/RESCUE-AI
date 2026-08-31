import express from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  assignResponders,
  updateIncidentStatus
} from '../controllers/incidentController';

const router = express.Router();

router.post('/', createIncident);
router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.post('/:incidentId/assign', assignResponders);
router.put('/:incidentId/status', updateIncidentStatus);

export default router;
