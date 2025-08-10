import { Router } from 'express';
import { RevenueController } from '@controllers/revenueController';
import { 
    validateDateRange,
    validateYearParam,
    validateDailySummary
} from '@validator/validationMiddlewares';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';
import { RevenueExportController } from '@src/controllers/revenueExportController';

const router = Router();
const revenueController = new RevenueController();

// Authenticated routes (require authentication)
router.get('/daily', authenticateToken, validateDailySummary, revenueController.getDailySummary);
router.get('/range', authenticateToken, validateDateRange, revenueController.getDateRangeData);
router.get('/kpis', authenticateToken, validateDateRange, revenueController.getKPIs);
router.get('/monthly/:year', authenticateToken, validateYearParam, revenueController.getMonthlyBreakdown);
router.get('/compare', authenticateToken, revenueController.getYearOverYearComparison);
router.get('/current-month', authenticateToken, revenueController.getCurrentMonthRevenue);
router.get('/export', authenticateToken,
    authorizeRole('admin'),
    RevenueExportController.exportRevenue
);

// Admin-only routes (require authentication and admin role)
router.post('/generate', authenticateToken, authorizeRole('admin'), revenueController.generateDailySummary);

export default router;