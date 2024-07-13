import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import errorHandler from '@middleware/errorHandler';
import routes from '@routes/index';
import logger from '@utils/logger';

const app = express();

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim())}}));

// Routes
app.use('/api', routes);

// Error handler middleware
app.use(errorHandler);

export default app;
