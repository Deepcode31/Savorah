import mongoose, { Document, Schema } from 'mongoose';
import { UserPersona } from './User.js';

export interface IOtp extends Document {
  email: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  // Pending signup details captured at request time (used when creating a new user).
  name?: string;
  persona?: UserPersona;
  monthlyIncome?: number;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    name: { type: String },
    persona: { type: String, enum: ['student', 'professional', 'family', 'senior'] },
    monthlyIncome: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Auto-remove expired codes.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model<IOtp>('Otp', otpSchema);
