import { CustomError } from '../middleware/errorHandler';
import { User } from '../sequelize/models/user';
import bcrypt from 'bcryptjs';
import { createTokens, TokenPayload } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';
import BaseService from './baseService';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
});

class UserService extends BaseService<User> {
  constructor() {
    super(User);
  }

  async getUserDetails(id: number) {
    try {
      const user = await this.findById(id);

      // Check if user exists
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const { password, ...userWithoutPassword } = user.get();

      return {
        ...userWithoutPassword,
        password: user.password
      };
    } catch (error) {
      throw new CustomError('Failed to fetch user details', 500);
    }
  }

  async updateUser(id: number, updates: Partial<User>) {
    try {
      const user = await this.findById(id);

      
      
      // Check if user exists
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Hash the new password if provided
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      // Update user details
      await user.update(updates);
      return user;
    } catch (error) {
      throw new CustomError('Failed to update user', 500);
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await User.findOne({
        where: { email },
      });

      // Check if user exists
      if (!user) {
        throw new CustomError('Invalid email or password', 401);
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError('Invalid email or password', 401);
      }

      // Create tokens
      const { accessToken, refreshToken } = await createTokens(user);

      // Exclude sensitive fields from the user object
      const { password: _, tokenVersion: __, ...userWithoutSensitive } = user.get();

      return {
        accessToken,
        refreshToken,
        user: userWithoutSensitive,
      };
    } catch (err) {
      if (err instanceof CustomError) {
        throw err;
      }
      throw new CustomError('Failed to authenticate user', 500);
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as TokenPayload;

      const user = await User.findByPk(payload.userId);

      // Check if user exists and token version matches
      if (!user || user.tokenVersion !== payload.tokenVersion) {
        throw new CustomError('Invalid refresh token', 401);
      }

      // Create new tokens
      const tokens = await createTokens(user);
      return tokens;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new CustomError('Refresh token has expired', 401);
      }
      throw new CustomError('Invalid refresh token', 401);
    }
  }

  async logout(accessToken: string) {
    try {
      // Decode the access token
      const decoded = jwt.decode(accessToken) as jwt.JwtPayload;

      // Check if decoded token is valid
      if (!decoded || !decoded.exp || !decoded.userId) {
        throw new CustomError('Invalid access token', 401);
      }

      // Add the token to the blacklist with an expiry
      const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiryTime > 0) {
        await redis.setex(`bl_${accessToken}`, expiryTime, 'true');
      }

      // Increment token version to invalidate all existing tokens
      await User.increment('tokenVersion', { where: { id: decoded.userId } });

      return { success: true };
    } catch (error) {
      throw new CustomError('Failed to logout', 500);
    }
  }
}

export default new UserService();