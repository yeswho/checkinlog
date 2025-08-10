import { Router } from 'express';
import dashboardController from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Remove revenue/expense related routes
router.get('/room-occupancy', authenticateToken, dashboardController.getRoomOccupancy);
router.get('/booking-trends', authenticateToken, dashboardController.getBookingTrends);
router.get('/customer-demographics', authenticateToken, dashboardController.getCustomerDemographics);

// New routes for dashboard
router.get('/todays-snapshot', authenticateToken, dashboardController.getTodaysSnapshot);
router.get('/room-availability', authenticateToken, dashboardController.getRoomAvailability);
router.get('/upcoming-reservations', authenticateToken, dashboardController.getUpcomingReservations);
router.get('/recent-bookings', authenticateToken, dashboardController.getRecentBookings);
router.get('/cancellations', authenticateToken, dashboardController.getCancellations);
router.get('/notifications', authenticateToken, dashboardController.getNotifications);

export default router;