import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { config } from '../config/environment';

// Ensure upload directory exists
const uploadAbsolutePath = path.resolve(process.cwd(), config.uploadDir);
if (!fs.existsSync(uploadAbsolutePath)) {
  fs.mkdirSync(uploadAbsolutePath, { recursive: true });
}

// Storage configuration with sanitized unique filename
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadAbsolutePath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `${sanitizedBase}_${uniqueSuffix}${ext}`);
  }
});

// File filter checking extension and MIME type
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error(`Invalid file extension "${ext}". Allowed types: JPG, JPEG, PNG, WEBP.`));
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error(`Invalid MIME type "${file.mimetype}". Only image files are allowed.`));
  }

  cb(null, true);
};

export const uploadRoomImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024 // e.g. 10MB
  }
});
