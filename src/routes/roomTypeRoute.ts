import { RoomTypeController } from '@controllers/roomTypeController';
import { validateRoomType, validateUpdateRoomType } from '@validator/validationMiddlewares';
import { Router } from 'express';

const router = Router();

const roomTypeController = new RoomTypeController();

// Get all roomtype
router.get('/', roomTypeController.getAllRoomTypes);
//Get roomtype by id
router.get('/:id', roomTypeController.getRoomTypeById);
// Add a roomtype
router.post('/', validateRoomType, roomTypeController.addRoomType);
// Update roomtype
router.put('/:id', validateUpdateRoomType, roomTypeController.updateRoomType);
// Delete roomtype
router.delete('/:id', roomTypeController.deleteRoomType);

export default router;
