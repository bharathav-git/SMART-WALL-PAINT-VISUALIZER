import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:4200',
  mongodbUri: process.env.MONGODB_URI || 'memory',
  jwtSecret: process.env.JWT_SECRET || 'smart_wall_paint_default_jwt_secret_key_98765',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  adminName: process.env.ADMIN_NAME || 'System Administrator',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@wallvisualizer.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123456'
};
