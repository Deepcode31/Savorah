import mongoose, { Document, Schema } from 'mongoose';

export type UserPersona = 'student' | 'professional' | 'family' | 'senior';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string | null;
  persona: UserPersona;
  monthlyIncome: number;
  currency: string;
  avatar?: string;
  isGoogleUser: boolean;
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    persona: {
      type: String,
      enum: ['student', 'professional', 'family', 'senior'],
      default: 'professional',
    },
    monthlyIncome: { type: Number, default: 3000 },
    currency: { type: String, default: '₹' },
    avatar: { type: String },
    isGoogleUser: { type: Boolean, default: false },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
