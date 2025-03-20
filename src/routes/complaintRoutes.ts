import { Router } from 'express';
import { ComplaintController } from '@controllers/complaintController';
import { validateComplaint, validateComplaintUpdate } from '@validator/validationMiddlewares';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';

const router = Router();
const complaintController = new ComplaintController();

// Authenticated routes (require authentication)
router.get('/', authenticateToken, complaintController.getAllComplaints);
router.get('/:id', authenticateToken, complaintController.getComplaintById);

// Admin-only routes (require authentication and admin role)
router.post('/', authenticateToken, authorizeRole('admin'), validateComplaint, complaintController.addComplaint);
router.put('/:id', authenticateToken, authorizeRole('admin'), validateComplaintUpdate, complaintController.updateComplaint);
router.delete('/:id', authenticateToken, authorizeRole('admin'), complaintController.deleteComplaint);

export default router;
