import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
};

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  // Safe logging
  console.error(`[Error] [${statusCode}]:`, err.message || err);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred',
    errors: err.errors,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};
