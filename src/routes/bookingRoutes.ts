import { BookingController } from '@controllers/bookingController';
import { validateBooking, validateUpdateBooking } from '@src/validation/validationMiddlewares';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';
import { Router } from 'express';

const router = Router();
const bookingController = new BookingController();

// Public routes (if any)
// Example: Search bookings (public, no authentication required)
router.get('/search', bookingController.searchBooking);

// Authenticated routes (require authentication)
router.get('/', authenticateToken, bookingController.getAllBookings); 
router.get('/:id', authenticateToken, bookingController.getBookingById); 
router.get('/booking-range', authenticateToken, bookingController.getBookingsInDateRange); 
router.get('/customer/:id', authenticateToken, bookingController.getBookingsByCustomerId); 
router.get('/details/:id', authenticateToken, bookingController.getBookingDetails); 

// Admin-only routes (require authentication and admin role)
router.post('/', authenticateToken, authorizeRole('admin'), validateBooking, bookingController.addBooking);
router.put('/:id', authenticateToken, authorizeRole('admin'), validateUpdateBooking, bookingController.updateBooking);
router.delete('/:id', authenticateToken, authorizeRole('admin'), bookingController.deleteBooking);
router.put('/update-rate', authenticateToken, authorizeRole('admin'), bookingController.updateBookingRate);
router.post('/bill/:id', authenticateToken, authorizeRole('admin'), bookingController.generateBill);

export default router;