import mongoose, { Schema, Document } from 'mongoose';
import { WallSelection, AppliedDesign } from '../types';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  originalImageUrl: string;
  thumbnailUrl?: string;
  finalImageUrl?: string;
  wallSelections: WallSelection[];
  appliedDesigns: AppliedDesign[];
  createdAt: Date;
  updatedAt: Date;
}

const PointSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  { _id: false }
);

const BrushStrokeSchema = new Schema(
  {
    points: [PointSchema],
    size: { type: Number, required: true, default: 20 },
    isErase: { type: Boolean, default: false }
  },
  { _id: false }
);

const WallPaintSettingsSchema = new Schema(
  {
    colorId: { type: String },
    colorName: { type: String },
    hex: { type: String, required: true, default: '#4A90E2' },
    opacity: { type: Number, required: true, default: 0.7, min: 0.05, max: 1.0 },
    intensity: { type: Number, default: 1.0, min: 0.1, max: 2.0 },
    finish: {
      type: String,
      enum: ['matte', 'satin', 'eggshell', 'glossy'],
      default: 'matte'
    },
    patternId: { type: String },
    patternName: { type: String },
    patternScale: { type: Number, default: 1.0 },
    patternOpacity: { type: Number, default: 0.5 }
  },
  { _id: false }
);

const WallSelectionSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, default: 'Wall' },
    type: { type: String, enum: ['polygon', 'brush'], required: true },
    points: [PointSchema],
    brushStrokes: [BrushStrokeSchema],
    paintSettings: { type: WallPaintSettingsSchema, required: true }
  },
  { _id: false }
);

const AppliedDesignSchema = new Schema(
  {
    wallSelectionId: { type: String, required: true },
    colorId: { type: String },
    customColor: { type: String },
    hex: { type: String, required: true },
    opacity: { type: Number, required: true, default: 0.7 },
    intensity: { type: Number, default: 1.0 },
    finish: {
      type: String,
      enum: ['matte', 'satin', 'eggshell', 'glossy'],
      default: 'matte'
    },
    patternId: { type: String },
    patternScale: { type: Number, default: 1.0 },
    patternOpacity: { type: Number, default: 0.5 }
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    originalImageUrl: {
      type: String,
      required: [true, 'Original room image URL is required']
    },
    thumbnailUrl: {
      type: String
    },
    finalImageUrl: {
      type: String
    },
    wallSelections: {
      type: [WallSelectionSchema],
      default: []
    },
    appliedDesigns: {
      type: [AppliedDesignSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

ProjectSchema.index({ userId: 1, createdAt: -1 });
ProjectSchema.index({ userId: 1, name: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
