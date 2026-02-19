import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from './error.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, '인증이 필요합니다', 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    throw new AppError(401, '유효하지 않은 토큰입니다', 'INVALID_TOKEN');
  }
}
