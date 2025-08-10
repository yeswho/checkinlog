import cron from 'node-cron';
import RevenueService from '@services/revenueService';
import logger from '../utils/logger';

// Schedule to run every day at 14:00 server time
cron.schedule('0 14 * * *', async () => {
    try {
        logger.info('Running daily revenue summary job...');

        const today = new Date();
        await RevenueService.generateDailySummary(today);

        logger.info('Daily revenue summary job completed successfully.');
    } catch (error) {
        logger.error('Error running daily revenue summary job:', error);
    }
});
