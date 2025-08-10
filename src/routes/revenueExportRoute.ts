// src/routes/revenueExportRoutes.ts
import { Router } from 'express';
import { RevenueExportController } from '@controllers/revenueExportController';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';

const router = Router();

router.get('/export', 
    authenticateToken,
    authorizeRole('admin'),
    RevenueExportController.exportRevenue
);

export default router;