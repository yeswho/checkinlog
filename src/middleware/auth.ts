import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from './errorHandler';
import { User } from '../sequelize/models/user';
import { Redis } from 'ioredis';

// Initialize Redis client
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
});

export interface TokenPayload {
    userId: string;
    email: string;
    tokenVersion: number;
}

export const createTokens = async (user: User) => {
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        tokenVersion: user.tokenVersion 
      },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: '15m' }
    );
  
    const refreshToken = jwt.sign(
      { 
        userId: user.id,
        tokenVersion: user.tokenVersion 
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
  
    return { accessToken, refreshToken };
  };
  
  export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
  
      if (!token) {
        throw new CustomError('No token provided', 401);
      }
  
      // Check if token is blacklisted
      const isBlacklisted = await redis.get(`bl_${token}`);
      if (isBlacklisted) {
        throw new CustomError('Token is invalid', 401);
      }
  
      const payload = jwt.verify(token, process.env.JWT_SECRET_KEY!) as TokenPayload;
      
      const user = await User.findByPk(payload.userId);
      if (!user || user.tokenVersion !== payload.tokenVersion) {
        throw new CustomError('Token is invalid', 401);
      }
  
      req.user = user;

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new CustomError('Token has expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid token', 401);
      }
      next(error);
    }
  };