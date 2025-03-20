import { Router } from 'express';
import { FloorController } from '@controllers/floorController';
import { validateFloor, validateUpdateFloor } from '@validator/validationMiddlewares';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';

const router = Router();
const floorController = new FloorController();

// Authenticated routes (require authentication)
router.get('/', authenticateToken, floorController.getAllFloors);
router.get('/:id', authenticateToken, floorController.getFloorById);

// Admin-only routes (require authentication and admin role)
router.post('/', authenticateToken, authorizeRole('admin'), validateFloor, floorController.addFloor);
router.put('/:id', authenticateToken, authorizeRole('admin'), validateUpdateFloor, floorController.updateFloor);
router.delete('/:id', authenticateToken, authorizeRole('admin'), floorController.deleteFloor);

export default router;
