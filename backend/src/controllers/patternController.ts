import { Request, Response, NextFunction } from 'express';
import { PatternService } from '../services/patternService';

export class PatternController {
  static async getPatterns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string;
      const isActiveOnly = req.query.all === 'true' ? false : true;

      const patterns = await PatternService.getPatterns({ category, isActiveOnly });
      res.status(200).json({
        success: true,
        data: patterns
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPatternById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const pattern = await PatternService.getPatternById(id);
      res.status(200).json({
        success: true,
        data: pattern
      });
    } catch (error) {
      next(error);
    }
  }

  static async createPattern(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pattern = await PatternService.createPattern(req.body);
      res.status(201).json({
        success: true,
        message: 'Pattern created successfully',
        data: pattern
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePattern(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const pattern = await PatternService.updatePattern(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Pattern updated successfully',
        data: pattern
      });
    } catch (error) {
      next(error);
    }
  }

  static async deletePattern(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await PatternService.deletePattern(id);
      res.status(200).json({
        success: true,
        message: 'Pattern deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
