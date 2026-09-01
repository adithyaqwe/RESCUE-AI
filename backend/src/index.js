import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import { connectDB } from './config/db.js';
import { seedDatabase } from './config/seed.js';
import { startSimulation } from './services/simulationService.js';
import incidentRoutes from './routes/incidentRoutes.js';
import responderRoutes from './routes/responderRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // To be configured properly in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// Set socket.io instance
app.set('io', io);

// Register routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/responders', responderRoutes);
app.use('/api/chat', chatRoutes);

// Basic route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'RescueAI API' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// Connect to database and seed
connectDB().then(() => {
  seedDatabase();
  startSimulation(io);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
