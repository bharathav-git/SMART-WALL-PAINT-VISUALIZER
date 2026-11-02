import { Router } from 'express';
import { PatternController } from '../controllers/patternController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', PatternController.getPatterns);
router.get('/:id', PatternController.getPatternById);

// Admin-only management routes
router.post('/', authenticate, requireAdmin, PatternController.createPattern);
router.patch('/:id', authenticate, requireAdmin, PatternController.updatePattern);
router.delete('/:id', authenticate, requireAdmin, PatternController.deletePattern);

export default router;
