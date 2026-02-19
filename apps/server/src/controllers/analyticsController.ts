import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService.js';
import type { AnalyticsPeriod } from '@linkpage/shared';

export const analyticsController = {
  async trackView(req: Request, res: Response, _next: NextFunction) {
    const { profileId } = req.body;
    if (!profileId) {
      res.status(400).json({ error: { message: 'profileId is required' } });
      return;
    }
    res.status(204).end();

    const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || null;
    const referrer = (req.headers.referer as string) || null;
    const userAgent = (req.headers['user-agent'] as string) || null;
    analyticsService.trackView(profileId, referrer, userAgent, ip).catch(() => {});
  },

  async trackClick(req: Request, res: Response, _next: NextFunction) {
    const { linkId, profileId } = req.body;
    if (!linkId || !profileId) {
      res.status(400).json({ error: { message: 'linkId and profileId are required' } });
      return;
    }
    res.status(204).end();

    const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || null;
    const referrer = (req.headers.referer as string) || null;
    const userAgent = (req.headers['user-agent'] as string) || null;
    analyticsService.trackClick(linkId, profileId, referrer, userAgent, ip).catch(() => {});
  },

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as AnalyticsPeriod) || '7d';
      const data = await analyticsService.getAnalytics(
        req.userId!,
        req.params.profileId,
        period,
      );
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
};
