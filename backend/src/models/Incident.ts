import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
  incidentId: string; // e.g., INC-2048
  type: string;       // e.g., Accident, Fire, Medical
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priorityScore: number;
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  victimsCount: number;
  description: string;
  requiredServices: string[]; // e.g., ['Ambulance', 'Police']
  status: 'REPORTED' | 'ANALYZED' | 'DISPATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED';
  aiAnalysis?: any;
  assignedResponders: mongoose.Types.ObjectId[];
  estimatedArrival?: number;  // ETA in minutes for dispatched units
  responseTimeMs?: number;    // Time to resolve incident in milliseconds
  aiConfidence?: number;      // Triage confidence score (0.0 to 1.0)
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema: Schema = new Schema(
  {
    incidentId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    priority: { 
      type: String, 
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], 
      default: 'MEDIUM' 
    },
    priorityScore: { type: Number, default: 0 },
    location: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    victimsCount: { type: Number, default: 0 },
    description: { type: String, required: true },
    requiredServices: [{ type: String }],
    status: { 
      type: String, 
      enum: ['REPORTED', 'ANALYZED', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'RESOLVED'], 
      default: 'REPORTED' 
    },
    aiAnalysis: { type: Schema.Types.Mixed },
    assignedResponders: [{ type: Schema.Types.ObjectId, ref: 'Responder' }],
    estimatedArrival: { type: Number },
    responseTimeMs: { type: Number },
    aiConfidence: { type: Number }
  },
  { timestamps: true }
);

export default mongoose.model<IIncident>('Incident', IncidentSchema);
