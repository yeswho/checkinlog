import { Router } from 'express';
import customerRoutes from '@routes/customerRoutes';
import roomRoutes from '@routes/roomRoutes';
import bookingRoutes from '@routes/bookingRoutes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Mount routes
router.use('/customers', customerRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);

export default router;
