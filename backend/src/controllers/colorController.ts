import { Request, Response, NextFunction } from 'express';
import { ColorService } from '../services/colorService';

export class ColorController {
  static async getColors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string;
      const search = req.query.search as string;
      const finish = req.query.finish as string;
      const isActiveOnly = req.query.all === 'true' ? false : true;

      const colors = await ColorService.getColors({ category, search, finish, isActiveOnly });
      res.status(200).json({
        success: true,
        data: colors
      });
    } catch (error) {
      next(error);
    }
  }

  static async getColorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const color = await ColorService.getColorById(id);
      res.status(200).json({
        success: true,
        data: color
      });
    } catch (error) {
      next(error);
    }
  }

  static async createColor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const color = await ColorService.createColor(req.body);
      res.status(201).json({
        success: true,
        message: 'Color created successfully',
        data: color
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateColor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const color = await ColorService.updateColor(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Color updated successfully',
        data: color
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteColor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await ColorService.deleteColor(id);
      res.status(200).json({
        success: true,
        message: 'Color deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
