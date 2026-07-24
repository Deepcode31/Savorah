import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGoal extends Document {
  userId: Types.ObjectId;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  imageUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },
    deadline: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Goal = mongoose.model<IGoal>('Goal', goalSchema);
