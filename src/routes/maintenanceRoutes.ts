import { Router } from 'express';
import { MaintenanceController } from '@controllers/maintenanceController';
import { validateMaintenance, validateMaintenanceUpdate } from '@validator/validationMiddlewares';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';

const router = Router();
const maintenanceController = new MaintenanceController();

// Authenticated routes (require authentication)
router.get('/', authenticateToken, maintenanceController.getAllMaintenance);
router.get('/:id', authenticateToken, maintenanceController.getMaintenanceById);

// Admin-only routes (require authentication and admin role)
router.post('/', authenticateToken, authorizeRole('admin'), validateMaintenance, maintenanceController.addMaintenance);
router.put('/:id', authenticateToken, authorizeRole('admin'), validateMaintenanceUpdate, maintenanceController.updateMaintenance);
router.delete('/:id', authenticateToken, authorizeRole('admin'), maintenanceController.deleteMaintenance);

export default router;
