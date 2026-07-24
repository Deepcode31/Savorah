import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User, IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

interface JwtPayload {
  userId: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function toPublicUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    persona: user.persona,
    monthlyIncome: user.monthlyIncome,
    currency: user.currency,
    isLoggedIn: true,
    isGoogleUser: user.isGoogleUser,
    onboardingComplete: user.onboardingComplete,
  };
}
