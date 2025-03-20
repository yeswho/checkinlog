import { NextFunction, Request, Response } from 'express';
import UserService from '../services/userService';
import { CustomError } from '@src/middleware/errorHandler';

export class UserController {

      // Get user by ID
      getUserById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        console.log(`Fetching user with ID: ${id}`); // Debug log
      
        try {
          const user = await UserService.getUserDetails(Number(id));
          console.log('User found:', user); // Debug log
      
          if (user) {
            const { username, password, email, address, role } = user;
            res.json({ username, email, password, address, role });
          } else {
            res.status(404).json({ message: 'User not found' });
          }
        } catch (error) {
          console.error('Error fetching user:', error); // Debug log
          next(error);
        }
      };

      // Update a roomType
      updateUser = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
          const updatedUser = await UserService.updateUser(Number(id), req.body);
          res.json(updatedUser);
        } catch (error) {
          next(error);
        }
      };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password }: { email: string; password: string } = req.body;

            // Basic input validation
            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required.' });
            }

            const result = await UserService.login(email, password);

            // Set refresh token in HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(200).json({
                success: true,
                data: {
                    accessToken: result.accessToken,
                    user: result.user
                }
            });
        } catch (error) {
            next(error); // Pass to error handling middleware
        }
    };

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            
            if (!refreshToken) {
                throw new CustomError('No refresh token', 401);
            }
    
            const tokens = await UserService.refreshToken(refreshToken);
            
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
    
            res.json({ accessToken: tokens.accessToken });
        } catch (error) {
            next(error);
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader?.split(' ')[1];
    
            if (token) {
                await UserService.logout(token);
            }
    
            res.clearCookie('refreshToken');
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    };
}
