import { BookingController } from '@controllers/bookingController';
import { validateBooking, validateUpdateBooking } from '@src/validation/validationMiddlewares';
import { Router } from 'express';

const router = Router();

const bookingController = new BookingController();

// Get all customers
router.get('/', bookingController.getAllBookings);
//Get customer by id
router.get('/:id', bookingController.getBookingById);
// Add a customer
router.post('/', validateBooking, bookingController.addBooking);
// Update customer
router.put('/:id',validateUpdateBooking, bookingController.updateBooking);
// Delete customer
router.delete('/:id', bookingController.deleteBooking);

export default router;
