import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { uploadRoomImage } from '../middleware/uploadMiddleware';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Room photograph upload (can be authenticated user or during trial)
router.post('/room-image', authenticate, uploadRoomImage.single('image'), UploadController.uploadRoomImage);

export default router;
