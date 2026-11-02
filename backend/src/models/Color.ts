import mongoose, { Schema, Document } from 'mongoose';
import { FinishType } from '../types';

export interface IColor extends Document {
  name: string;
  hex: string;
  manufacturer: string;
  finishOptions: FinishType[];
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ColorSchema = new Schema<IColor>(
  {
    name: {
      type: String,
      required: [true, 'Color name is required'],
      trim: true,
      index: true
    },
    hex: {
      type: String,
      required: [true, 'HEX color is required'],
      trim: true,
      uppercase: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid HEX color code (e.g. #3A7BD5)'],
      index: true
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer or palette attribution is required'],
      trim: true,
      default: 'Smart Paint Studio'
    },
    finishOptions: {
      type: [String],
      enum: ['matte', 'satin', 'eggshell', 'glossy'],
      default: ['matte', 'satin', 'eggshell', 'glossy']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true
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

ColorSchema.index({ name: 'text', category: 'text', manufacturer: 'text' });

export const Color = mongoose.model<IColor>('Color', ColorSchema);
