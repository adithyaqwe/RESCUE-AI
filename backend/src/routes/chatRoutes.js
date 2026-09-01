import express from 'express';
import { handleChatQuery } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', handleChatQuery);

export default router;
