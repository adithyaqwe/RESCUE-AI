import mongoose, { Schema, Document } from 'mongoose';

export interface IResponder extends Document {
  unitId: string; // e.g., A-17, F-12
  type: 'Ambulance' | 'Police' | 'Fire' | 'Medical';
  status: 'AVAILABLE' | 'EN_ROUTE' | 'ON_SCENE' | 'UNAVAILABLE';
  currentLocation: {
    lat: number;
    lng: number;
  };
  contactInfo: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResponderSchema: Schema = new Schema(
  {
    unitId: { type: String, required: true, unique: true },
    type: { 
      type: String, 
      enum: ['Ambulance', 'Police', 'Fire', 'Medical'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['AVAILABLE', 'EN_ROUTE', 'ON_SCENE', 'UNAVAILABLE'], 
      default: 'AVAILABLE' 
    },
    currentLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    contactInfo: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IResponder>('Responder', ResponderSchema);
