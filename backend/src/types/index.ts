import { Request } from 'express';

export type UserRole = 'user' | 'admin';

export type FinishType = 'matte' | 'satin' | 'eggshell' | 'glossy';

export type SelectionType = 'polygon' | 'brush';

export interface Point {
  x: number;
  y: number;
}

export interface BrushStroke {
  points: Point[];
  size: number;
  isErase: boolean;
}

export interface WallPaintSettings {
  colorId?: string;
  colorName?: string;
  hex: string;
  opacity: number;
  intensity: number;
  finish: FinishType;
  patternId?: string;
  patternName?: string;
  patternScale?: number;
  patternOpacity?: number;
}

export interface WallSelection {
  id: string;
  name: string;
  type: SelectionType;
  points: Point[];
  brushStrokes?: BrushStroke[];
  paintSettings: WallPaintSettings;
}

export interface AppliedDesign {
  wallSelectionId: string;
  colorId?: string;
  customColor?: string;
  hex: string;
  opacity: number;
  intensity?: number;
  finish: FinishType;
  patternId?: string;
  patternScale?: number;
  patternOpacity?: number;
}

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}
