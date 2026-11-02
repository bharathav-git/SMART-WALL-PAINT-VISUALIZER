import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const result = await AuthService.register(req.body, ip);
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const result = await AuthService.login(req.body, ip);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser(req.user!.userId);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleFavoriteColor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hex } = req.body;
      if (!hex) {
        res.status(400).json({ success: false, message: 'HEX color is required' });
        return;
      }
      const favoriteColors = await AuthService.toggleFavoriteColor(req.user!.userId, hex);
      res.status(200).json({
        success: true,
        data: { favoriteColors }
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    // JWT is stateless on client side; endpoint provides explicit confirmation
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}
