import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then((m) => m.LandingComponent),
    title: 'Smart Wall Paint Visualizer - Architectural Wall Preview'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Sign In - Smart Wall Paint Visualizer'
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'Create Account - Smart Wall Paint Visualizer'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - Smart Wall Paint Visualizer'
  },
  {
    path: 'upload',
    loadComponent: () => import('./features/image-upload/image-upload.component').then((m) => m.ImageUploadComponent),
    canActivate: [authGuard],
    title: 'Upload Room Photo - Smart Wall Paint Visualizer'
  },
  {
    path: 'studio',
    loadComponent: () => import('./features/wall-editor/wall-editor.component').then((m) => m.WallEditorComponent),
    title: 'Paint Studio - Smart Wall Paint Visualizer'
  },
  {
    path: 'saved-designs',
    loadComponent: () => import('./features/saved-designs/saved-designs.component').then((m) => m.SavedDesignsComponent),
    canActivate: [authGuard],
    title: 'Saved Designs - Smart Wall Paint Visualizer'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [authGuard, adminGuard],
    title: 'Admin Portal - Smart Wall Paint Visualizer'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
