import { Router } from 'express';
import { publicController } from '../controllers/publicController.js';
import { analyticsController } from '../controllers/analyticsController.js';

const router = Router();

router.get('/profile/:slug', publicController.getProfile);

// Analytics tracking (public, no auth)
router.post('/track/view', analyticsController.trackView);
router.post('/track/click', analyticsController.trackClick);

export default router;
