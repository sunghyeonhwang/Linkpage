import { Request, Response, NextFunction } from 'express';
import { linkService } from '../services/linkService.js';

export const linkController = {
  async getLinks(req: Request, res: Response, next: NextFunction) {
    try {
      const links = await linkService.getLinks(req.userId!, req.params.profileId as string);
      res.json({ data: links });
    } catch (err) {
      next(err);
    }
  },

  async createLink(req: Request, res: Response, next: NextFunction) {
    try {
      const link = await linkService.createLink(req.userId!, req.params.profileId as string, req.body);
      res.status(201).json({ data: link });
    } catch (err) {
      next(err);
    }
  },

  async updateLink(req: Request, res: Response, next: NextFunction) {
    try {
      const link = await linkService.updateLink(
        req.userId!,
        req.params.profileId as string,
        req.params.linkId as string,
        req.body,
      );
      res.json({ data: link });
    } catch (err) {
      next(err);
    }
  },

  async deleteLink(req: Request, res: Response, next: NextFunction) {
    try {
      await linkService.deleteLink(req.userId!, req.params.profileId as string, req.params.linkId as string);
      res.json({ data: { message: '링크가 삭제되었습니다' } });
    } catch (err) {
      next(err);
    }
  },

  async reorderLinks(req: Request, res: Response, next: NextFunction) {
    try {
      const links = await linkService.reorderLinks(
        req.userId!,
        req.params.profileId as string,
        req.body.links,
      );
      res.json({ data: links });
    } catch (err) {
      next(err);
    }
  },
};
