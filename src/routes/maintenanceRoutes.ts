import { MaintenanceController } from '@controllers/maintenanceController';
import { validateMaintenance, validateMaintenanceUpdate } from '@validator/validationMiddlewares';
import { Router } from 'express';

const router = Router();

const maintenanceController = new MaintenanceController();

// Get all maintenance records
router.get('/', maintenanceController.getAllMaintenance);

// Get maintenance record by ID
router.get('/:id', maintenanceController.getMaintenanceById);

// Add a maintenance record
router.post('/', validateMaintenance, maintenanceController.addMaintenance);

// Update a maintenance record
router.put('/:id', validateMaintenanceUpdate, maintenanceController.updateMaintenance);

// Delete a maintenance record
router.delete('/:id', maintenanceController.deleteMaintenance);

export default router;