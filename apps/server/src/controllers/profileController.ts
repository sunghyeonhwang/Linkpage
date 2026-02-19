import { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profileService.js';

export const profileController = {
  async getProfiles(req: Request, res: Response, next: NextFunction) {
    try {
      const profiles = await profileService.getProfiles(req.userId!);
      res.json({ data: profiles });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.params.profileId;
      const profile = await profileService.getProfile(req.userId!, profileId);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.params.profileId;
      const profile = await profileService.updateProfile(req.userId!, profileId, req.body);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },

  async updateSlug(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.params.profileId;
      const profile = await profileService.updateSlug(req.userId!, profileId, req.body.slug);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },

  async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await profileService.createProfile(req.userId!, req.body.display_name);
      res.status(201).json({ data: profile });
    } catch (err) {
      next(err);
    }
  },

  async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      await profileService.deleteProfile(req.userId!, req.params.profileId);
      res.json({ data: { message: '프로필이 삭제되었습니다' } });
    } catch (err) {
      next(err);
    }
  },

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ error: { message: '파일을 선택해주세요' } });
        return;
      }

      // Store avatar as base64 data URL for MVP (no external storage needed)
      const base64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

      const profileId = req.params.profileId;
      const profile = await profileService.updateProfile(req.userId!, profileId, {
        avatar_url: dataUrl,
      } as any);

      res.json({ data: { avatar_url: profile.avatar_url } });
    } catch (err) {
      next(err);
    }
  },

  async uploadBackgroundImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ error: { message: '파일을 선택해주세요' } });
        return;
      }

      const base64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

      const profileId = req.params.profileId;
      const profile = await profileService.updateProfile(req.userId!, profileId, {
        background_image_url: dataUrl,
      } as any);

      res.json({ data: { background_image_url: profile.background_image_url } });
    } catch (err) {
      next(err);
    }
  },

  async removeBackgroundImage(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.params.profileId;
      const profile = await profileService.updateProfile(req.userId!, profileId, {
        background_image_url: null,
      } as any);

      res.json({ data: { background_image_url: profile.background_image_url } });
    } catch (err) {
      next(err);
    }
  },
};
