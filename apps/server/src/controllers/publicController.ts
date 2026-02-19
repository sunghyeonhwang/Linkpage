import { Request, Response, NextFunction } from 'express';
import { publicService } from '../services/publicService.js';

export const publicController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await publicService.getPublicProfile(req.params.slug);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
};
