import { BillingController } from '@controllers/billingController';
import { Router } from 'express';

const router = Router();

const billingController = new BillingController();

// Get printable bill by booking ID
router.get('/printable/:bookingId', billingController.getPrintableBill);
// Get all printable bills
router.get('/printable', billingController.getAllPrintableBills);
// Get all billings
router.get('/', billingController.getAllBillings);
// Get billing by ID
router.get('/:id', billingController.getBillingById);
// Add a billing
router.post('/', billingController.addBilling);
// Update billing
router.put('/:id', billingController.updateBilling);
// Delete billing
router.delete('/:id', billingController.deleteBilling);

export default router;