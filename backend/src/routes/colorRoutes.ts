import { Router } from 'express';
import { ColorController } from '../controllers/colorController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', ColorController.getColors);
router.get('/:id', ColorController.getColorById);

// Admin-only management routes
router.post('/', authenticate, requireAdmin, ColorController.createColor);
router.patch('/:id', authenticate, requireAdmin, ColorController.updateColor);
router.delete('/:id', authenticate, requireAdmin, ColorController.deleteColor);

export default router;
