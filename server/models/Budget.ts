import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBudget extends Document {
  userId: Types.ObjectId;
  category: string;
  limit: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true, min: 0 },
    color: { type: String, default: '#64748B' },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema);
