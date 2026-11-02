export type UserRole = 'user' | 'admin';
export type FinishType = 'matte' | 'satin' | 'eggshell' | 'glossy';
export type SelectionType = 'polygon' | 'brush';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  favoriteColors?: string[];
  createdAt?: string;
  updatedAt?: string;
  projectCount?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

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

export interface Project {
  _id: string;
  userId: string | User;
  name: string;
  originalImageUrl: string;
  thumbnailUrl?: string;
  finalImageUrl?: string;
  wallSelections: WallSelection[];
  appliedDesigns: AppliedDesign[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Color {
  _id: string;
  name: string;
  hex: string;
  manufacturer: string;
  finishOptions: FinishType[];
  category: string;
  description?: string;
  isActive: boolean;
}

export interface Pattern {
  _id: string;
  name: string;
  description?: string;
  category: string;
  imageUrl?: string;
  svgContent?: string;
  defaultScale: number;
  isActive: boolean;
}

export interface AdminAnalytics {
  summary: {
    totalUsers: number;
    totalProjects: number;
    totalUploadedImages: number;
    totalSavedDesigns: number;
    totalColors: number;
    totalPatterns: number;
  };
  colorsByCategory: { _id: string; count: number }[];
  recentActivity: any[];
  recentProjects: Project[];
}
