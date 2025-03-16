import { CustomError } from '../middleware/errorHandler';
import { User } from '../sequelize/models/user';
import bcrypt from 'bcryptjs';
import { createTokens, TokenPayload } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
});

class UserService {
  async login(email: string, password: string) {
    try {
      const user = await User.findOne({
        where: { email },
      });

      if (!user) {
        throw new CustomError('Invalid email or password', 401);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new CustomError('Invalid email or password', 401);
      }

      const { accessToken, refreshToken } = await createTokens(user);

      const { password: _, tokenVersion: __, ...userWithoutSensitive } = user.get();

      return { 
        accessToken, 
        refreshToken,
        user: userWithoutSensitive 
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
      
      if (!user || user.tokenVersion !== payload.tokenVersion) {
        throw new CustomError('Invalid refresh token', 401);
      }

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
      // Add the token to blacklist with an expiry
      const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
      const expiryTime = (decoded.exp || 0) - Math.floor(Date.now() / 1000);
      if (expiryTime > 0) {
        await redis.setex(`bl_${accessToken}`, expiryTime, 'true');
      }
      // Increment token version to invalidate all existing tokens
      const userId = decoded.userId;
      await User.increment('tokenVersion', { where: { id: userId } });

      return { success: true };
    } catch (error) {
      throw new CustomError('Failed to logout', 500);
    }
  }
}

export default new UserService();