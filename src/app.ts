import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import errorHandler from '@middleware/errorHandler';
import routes from '@routes/index';
import logger from '@utils/logger';

const app = express();

import bcrypt from 'bcryptjs';

// bcrypt.hash("admin@123", 10, (err: any, hash: any) => {
//   if (err) throw err;
//   console.log("HASH IS HAHA hehe lala", hash);
// });
// Middleware setup
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim())}}));

// Routes
app.use('/api', routes);

// Error handler middleware
app.use(errorHandler);

export default app;
