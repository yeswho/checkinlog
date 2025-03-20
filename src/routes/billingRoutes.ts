import { BillingController } from '@controllers/billingController';
import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';

const router = Router();
const billingController = new BillingController();

const upload = multer({ storage: multer.memoryStorage() });

// Authenticated routes (require authentication)
router.get('/printable/:bookingId', authenticateToken, billingController.getPrintableBill);
router.get('/printable', authenticateToken, billingController.getAllPrintableBills);
router.get('/', authenticateToken, billingController.getAllBillings); 
router.get('/:id', authenticateToken, billingController.getBillingById);

// Admin-only routes (require authentication and admin role)
router.post('/', authenticateToken, authorizeRole('admin'), billingController.addBilling);
router.put('/:id', authenticateToken, authorizeRole('admin'), billingController.updateBilling);
router.delete('/:id', authenticateToken, authorizeRole('admin'), billingController.deleteBilling);
router.post('/email', authenticateToken, authorizeRole('admin'), upload.single("pdfFile"), billingController.sendEmailWithPdf);

export default router;