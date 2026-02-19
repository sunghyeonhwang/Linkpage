import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';

export const authController = {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body.email, req.body.password);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response) {
    // JWT is stateless, client simply removes the token
    res.json({ data: { message: '로그아웃되었습니다' } });
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.userId!);
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyEmail(req.body.token);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.password);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
};
