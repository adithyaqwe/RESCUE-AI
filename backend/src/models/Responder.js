import mongoose, { Schema } from 'mongoose';

const ResponderSchema = new Schema(
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

export default mongoose.model('Responder', ResponderSchema);
