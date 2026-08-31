import express from 'express';
import {
  createResponder,
  getResponders,
  updateResponderLocation
} from '../controllers/responderController';

const router = express.Router();

router.post('/', createResponder);
router.get('/', getResponders);
router.put('/:id/location', updateResponderLocation);

export default router;
