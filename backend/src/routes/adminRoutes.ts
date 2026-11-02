import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// All administrative endpoints require admin privileges
router.use(authenticate, requireAdmin);

router.get('/analytics', AdminController.getAnalytics);
router.get('/users', AdminController.getUsers);
router.get('/projects', AdminController.getAllProjects);

export default router;
