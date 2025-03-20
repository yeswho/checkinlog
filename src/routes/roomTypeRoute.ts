import { Router } from 'express';
import { RoomTypeController } from '@controllers/roomTypeController';
import { validateRoomType, validateUpdateRoomType } from '@validator/validationMiddlewares';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';

const router = Router();
const roomTypeController = new RoomTypeController();

// Authenticated routes (require authentication)
router.get('/', authenticateToken, roomTypeController.getAllRoomTypes);
router.get('/:id', authenticateToken, roomTypeController.getRoomTypeById);

// Admin-only routes (require authentication and admin role)
router.post('/', authenticateToken, authorizeRole('admin'), validateRoomType, roomTypeController.addRoomType);
router.put('/:id', authenticateToken, authorizeRole('admin'), validateUpdateRoomType, roomTypeController.updateRoomType);
router.delete('/:id', authenticateToken, authorizeRole('admin'), roomTypeController.deleteRoomType);

export default router;
