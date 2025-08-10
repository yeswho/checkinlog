import { CustomError } from '../middleware/errorHandler';
import { User } from '../sequelize/models/user';
import bcrypt from 'bcryptjs';
import { createTokens, TokenPayload } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import BaseService from './baseService';

class UserService extends BaseService<User> {
  constructor() {
    super(User);
  }

  async getUserDetails(id: number) {
    try {
      const user = await this.findById(id);

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

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      await user.update(updates);
      return user;
    } catch (error) {
      throw new CustomError('Failed to update user', 500);
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new CustomError('Invalid email or password', 401);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError('Invalid email or password', 401);
      }

      const { accessToken } = await createTokens(user);

      const { password: _, tokenVersion: __, ...userWithoutSensitive } = user.get();

      return {
        accessToken,
        user: userWithoutSensitive,
      };
    } catch (err) {
      console.log('Error during login:', err);
      
      if (err instanceof CustomError) throw err;
      throw new CustomError('Failed to authenticate user', 500);
    }
  }

  async logout(accessToken: string) {
    try {
      const decoded = jwt.decode(accessToken) as jwt.JwtPayload;

      if (!decoded || !decoded.userId) {
        throw new CustomError('Invalid access token', 401);
      }

      // Invalidate all tokens by bumping tokenVersion
      await User.increment('tokenVersion', { where: { id: decoded.userId } });

      return { success: true };
    } catch (error) {
      throw new CustomError('Failed to logout', 500);
    }
  }
}

export default new UserService();
