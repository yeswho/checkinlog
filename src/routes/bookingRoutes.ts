import { BookingController } from '@controllers/bookingController';
import { validateBooking, validateUpdateBooking } from '@src/validation/validationMiddlewares';
import { Router } from 'express';

const router = Router();

const bookingController = new BookingController();

// Get all customers
router.get('/', bookingController.getAllBookings);
//Get customer by id
router.get('/:id', bookingController.getBookingById);
//Add a customer
router.post('/', validateBooking, bookingController.addBooking);
//Update customer
router.put('/:id',validateUpdateBooking, bookingController.updateBooking);
//Delete customer
router.delete('/:id', bookingController.deleteBooking);
//Find booking in range
router.get('/booking-range', bookingController.getBookingsInDateRange);
//Find all bookings of a customer
router.get('/customer/:id', bookingController.getBookingsByCustomerId);
//Manually update room rate in a booking
router.put('/update-rate', bookingController.updateBookingRate);
//Get all booking detail
router.get('/details/:id', bookingController.getBookingDetails);

export default router;
