import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from './errorHandler';
import { User } from '../sequelize/models/user';

declare global {
    namespace Express {
        interface Request {
            userRole?: 'admin' | 'standard';
        }
    }
}

export interface TokenPayload {
    userId: string;
    email: string;
    tokenVersion: number;
    role: 'admin' | 'standard';
}

export const createTokens = async (user: User) => {
    const accessToken = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            tokenVersion: user.tokenVersion,
            role: user.role,
        },
        process.env.JWT_SECRET_KEY!,
        { expiresIn: '1h' }
    );

    return { accessToken };
};

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY!) as TokenPayload;

        const user = await User.findByPk(payload.userId);
        if (!user || user.tokenVersion !== payload.tokenVersion) {
            return res.status(401).json({ message: 'Token is invalid or revoked' });
        }

        req.user = user;
        req.userRole = payload.role;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token has expired' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        next(error);
    }
};

export const authorizeRole = (requiredRole: 'admin' | 'standard') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.userRole;

        if (userRole !== requiredRole) {
            throw new CustomError('Access denied. You do not have the required role.', 403);
        }

        next();
    };
};
