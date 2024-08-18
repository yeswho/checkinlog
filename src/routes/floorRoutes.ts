import { FloorController } from '@controllers/floorController';
import { validateFloor, validateUpdateFloor } from '@validator/validationMiddlewares';
import { Router } from 'express';

const router = Router();

const floorController = new FloorController();

// Get all customers
router.get('/', floorController.getAllFloors);
//Get customer by id
router.get('/:id', floorController.getFloorById);
// Add a customer
router.post('/', validateFloor, floorController.addFloor);
// Update customer
router.put('/:id', validateUpdateFloor, floorController.updateFloor);
// Delete customer
router.delete('/:id', floorController.deleteFloor);

export default router;
