import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ActivityLog } from '../models/ActivityLog';

export class UploadController {
  static async uploadRoomImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file uploaded'
        });
        return;
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      if (req.user) {
        await ActivityLog.create({
          userId: req.user.userId,
          action: 'ROOM_IMAGE_UPLOADED',
          metadata: {
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
          }
        });
      }

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
