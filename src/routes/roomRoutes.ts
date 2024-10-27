import { RoomController } from '@controllers/roomController';
import { validateRoom, validateUpdateRoom } from '@validator/validationMiddlewares';
import { Router } from 'express';

const router = Router();

const roomController = new RoomController();

// Get all room
router.get('/', roomController.getAllRooms);
//Get room by id
router.get('/:id', roomController.getRoomById);
// Add a room
router.post('/', validateRoom, roomController.addRoom);
// Update room
router.put('/:id', validateUpdateRoom, roomController.updateRoom);
// Delete room
router.delete('/:id', roomController.updateRoom);

export default router;
