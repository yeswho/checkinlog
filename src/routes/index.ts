import { Router } from 'express';
import customerRoutes from '@routes/customerRoutes';
import roomTypeRoutes from '@routes/roomTypeRoute';
import floorRoutes from '@routes/floorRoutes';
import roomRoutes from '@routes/roomRoutes';
import bookingRoutes from '@routes/bookingRoutes';
import userRoutes from '@routes/userRoute';
import complaintRoutes from '@routes/complaintRoutes';
import maintenanceRoutes from '@routes/maintenanceRoutes';
import billingRoutes from '@routes/billingRoutes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Mount routes
router.use('/customers', customerRoutes);
router.use('/floors', floorRoutes);
router.use('/room-type', roomTypeRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/user', userRoutes);
router.use('/complaints', complaintRoutes);
router.use('/maintenances', maintenanceRoutes);
router.use('/billings', billingRoutes);

export default router;
