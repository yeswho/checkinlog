import { BookingController } from '@controllers/bookingController';
import { validateBooking, validateUpdateBooking } from '@src/validation/validationMiddlewares';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';
import { Router } from 'express';
import AdditionalChargeController from '@src/controllers/additionalChargeController';

const router = Router();
const bookingController = new BookingController();
const additionalChargeController = new AdditionalChargeController();

// Public routes (if any)
// Example: Search bookings (public, no authentication required)
router.get('/search', bookingController.searchBooking);
router.post('/web', bookingController.bookingFromWeb);

// Authenticated routes (require authentication)
router.get('/', authenticateToken, bookingController.getAllBookings); 
router.get('/:id', authenticateToken, bookingController.getBookingById);
router.get('/room-availability/:year/:month', authenticateToken, (req, res, next) => bookingController.getRoomAvailability(req, res, next));
router.put('/:bookingId/rooms', authenticateToken, bookingController.updateBookingRooms);
router.get('/:bookingId/additional', authenticateToken, additionalChargeController.getAdditionalCharges);
router.post('/:bookingId/additional', authenticateToken, additionalChargeController.addAdditionalCharge); 
router.post('/:bookingId/confirm', authenticateToken, bookingController.sendConfirmationEmail);
router.put('/:bookingId/additional/:chargeId', authenticateToken, additionalChargeController.updateAdditionalCharge);
router.get('/booking-range', authenticateToken, bookingController.getBookingsInDateRange); 
router.get('/customer/:id', authenticateToken, bookingController.getBookingsByCustomerId); 
router.get('/details/:id', authenticateToken, bookingController.getBookingDetails); 

// Admin-only routes (require authentication and admin role)
router.post('/', authenticateToken, authorizeRole('admin'), validateBooking, bookingController.addBooking);
router.put('/:id', authenticateToken, authorizeRole('admin'), validateUpdateBooking, bookingController.updateBooking);
router.delete('/:id', authenticateToken, authorizeRole('admin'), bookingController.deleteBooking);
router.put('/update-rate', authenticateToken, authorizeRole('admin'), bookingController.updateBookingRate);
router.post('/bill/:id', authenticateToken, authorizeRole('admin'), bookingController.generateBill);
router.post('/:id/additional', authenticateToken, authorizeRole('admin'), bookingController.addAdditional);
router.delete('/:bookingId/additional/:chargeId', authenticateToken, authorizeRole('admin'), additionalChargeController.deleteAdditionalCharge); 

export default router;