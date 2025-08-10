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

      // Update
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

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required.' });
            }

            const result = await UserService.login(email, password);

            res.status(200).json({
                success: true,
                data: {
                    accessToken: result.accessToken,
                    user: result.user
                }
            });
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
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    };
}
