import { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger';

// Custom error handling
class CustomError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

const errorHandler = (err: Error | CustomError, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CustomError) {
        const statusCode = err.statusCode || 500;
        const message = err.message || 'Internal Server Error';
        logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        logger.error(err.stack);

        res.status(statusCode).json({
            status: 'error',
            statusCode,
            message
        });
    } else {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'A server error occurred'
        });
    }
};


export { CustomError, errorHandler };
export default errorHandler;
