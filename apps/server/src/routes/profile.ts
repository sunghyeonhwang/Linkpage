import { Router } from 'express';
import multer from 'multer';
import { profileController } from '../controllers/profileController.js';
import { analyticsController } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { profileUpdateSchema, slugSchema } from '@linkpage/shared';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드할 수 있습니다'));
    }
  },
});

router.use(authMiddleware);

// Get all profiles for current user
router.get('/', profileController.getProfiles);

// Create a new profile
router.post('/', profileController.createProfile);

// Get a specific profile
router.get('/:profileId', profileController.getProfile);

// Update a profile
router.put('/:profileId', validate(profileUpdateSchema), profileController.updateProfile);

// Update slug
router.post('/:profileId/slug', validate(slugSchema), profileController.updateSlug);

// Upload avatar
router.post('/:profileId/avatar', upload.single('avatar'), profileController.uploadAvatar);

// Upload background image
router.post('/:profileId/background-image', upload.single('background'), profileController.uploadBackgroundImage);

// Delete background image
router.delete('/:profileId/background-image', profileController.removeBackgroundImage);

// Analytics
router.get('/:profileId/analytics', analyticsController.getAnalytics);

// Delete a profile
router.delete('/:profileId', profileController.deleteProfile);

export default router;
