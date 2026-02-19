import { Router } from 'express';
import { linkController } from '../controllers/linkController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { linkCreateSchema, linkUpdateSchema, linkReorderSchema } from '@linkpage/shared';

const router = Router();

router.use(authMiddleware);

// Get all links for a profile
router.get('/:profileId', linkController.getLinks);

// Create a link
router.post('/:profileId', validate(linkCreateSchema), linkController.createLink);

// Reorder links
router.put('/:profileId/reorder', validate(linkReorderSchema), linkController.reorderLinks);

// Update a link
router.put('/:profileId/:linkId', validate(linkUpdateSchema), linkController.updateLink);

// Delete a link
router.delete('/:profileId/:linkId', linkController.deleteLink);

export default router;
