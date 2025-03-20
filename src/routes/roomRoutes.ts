import { RoomController } from '@controllers/roomController';
import { validateRoom, validateUpdateRoom } from '@validator/validationMiddlewares';
import { authenticateToken, authorizeRole } from '@src/middleware/auth'; // Import the middleware
import { Router } from 'express';

const router = Router();
const roomController = new RoomController();

// Public routes (if any)
// Example: Get room details (public, no authentication required)
router.get('/details',authenticateToken, roomController.getRoomDetails);

// Authenticated routes (require authentication)
router.get('/', authenticateToken, roomController.getAllRooms); // Only authenticated users can access
router.get('/:id', authenticateToken, roomController.getRoomById); // Only authenticated users can access

// Admin-only routes (require authentication and admin role)
router.post('/', authenticateToken, authorizeRole('admin'), validateRoom, roomController.addRoom); // Only admin can add rooms
router.put('/:id', authenticateToken, authorizeRole('admin'), validateUpdateRoom, roomController.updateRoom); // Only admin can update rooms
router.delete('/:id', authenticateToken, authorizeRole('admin'), roomController.deleteRoom); // Only admin can delete rooms

export default router;