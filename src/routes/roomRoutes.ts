import { RoomController } from '@controllers/roomController';
import { validateRoom, validateUpdateRoom } from '@validator/validationMiddlewares';
import { Router } from 'express';

const router = Router();

const roomController = new RoomController();

// Get printable bill by booking ID
router.get('/details', roomController.getRoomDetails);
// Get all billings
router.get('/', roomController.getAllRooms);
// Get billing by ID
router.get('/:id', roomController.getRoomById);
// Add a billing (with validation)
router.post('/', validateRoom, roomController.addRoom);
// Update billing (with validation)
router.put('/:id', validateUpdateRoom, roomController.updateRoom);
// Delete billing
router.delete('/:id', roomController.deleteRoom);

export default router;