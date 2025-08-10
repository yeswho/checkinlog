import dotenv from 'dotenv';
import 'module-alias/register';
import app from './app';
import logger from './utils/logger';

dotenv.config();

//initialize database connection
import '@orm/database'

const port = process.env.PORT || 3000;

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});
