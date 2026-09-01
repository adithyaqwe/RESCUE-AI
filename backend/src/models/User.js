import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['operator', 'dispatcher', 'admin'], 
      default: 'operator' 
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
