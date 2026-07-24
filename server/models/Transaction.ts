import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISplitParticipant {
  id: string;
  name: string;
  amount: number;
  isMe?: boolean;
  settled?: boolean;
}

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  receiptUrl?: string;
  isEssential?: boolean;
  tags?: string[];
  split?: {
    totalAmount: number;
    paidByMe: boolean;
    participants: ISplitParticipant[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const splitParticipantSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    isMe: { type: Boolean, default: false },
    settled: { type: Boolean, default: false },
  },
  { _id: false }
);

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['expense', 'income'], required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    paymentMethod: { type: String, default: 'Other' },
    notes: { type: String },
    receiptUrl: { type: String },
    isEssential: { type: Boolean, default: false },
    tags: [{ type: String }],
    split: {
      totalAmount: { type: Number },
      paidByMe: { type: Boolean, default: true },
      participants: [splitParticipantSchema],
    },
  },
  { timestamps: true }
);

// Common query paths: user ledger sorted by date, and per-category aggregation.
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, type: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
