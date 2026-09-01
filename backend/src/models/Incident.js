import mongoose, { Schema } from 'mongoose';

const IncidentSchema = new Schema(
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

export default mongoose.model('Incident', IncidentSchema);
