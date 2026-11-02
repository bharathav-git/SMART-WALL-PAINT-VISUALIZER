import mongoose, { Schema, Document } from 'mongoose';

export interface IPattern extends Document {
  name: string;
  description?: string;
  category: string;
  imageUrl?: string;
  svgContent?: string;
  defaultScale: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PatternSchema = new Schema<IPattern>(
  {
    name: {
      type: String,
      required: [true, 'Pattern name is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    imageUrl: {
      type: String,
      trim: true
    },
    svgContent: {
      type: String,
      trim: true
    },
    defaultScale: {
      type: Number,
      default: 1.0,
      min: 0.1,
      max: 5.0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Pattern = mongoose.model<IPattern>('Pattern', PatternSchema);
