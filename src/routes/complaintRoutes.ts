import { Router } from 'express';
import { ComplaintController } from '@controllers/complaintController';
import { validateComplaint, validateComplaintUpdate } from '@validator/validationMiddlewares';

const router = Router();
const complaintController = new ComplaintController();

// Get all complaints
router.get('/', complaintController.getAllComplaints);

// Get complaint by ID
router.get('/:id', complaintController.getComplaintById);

// Add a complaint
router.post('/', validateComplaint, complaintController.addComplaint);

// Update a complaint
router.put('/:id', validateComplaintUpdate, complaintController.updateComplaint);

// Delete a complaint
router.delete('/:id', complaintController.deleteComplaint);

export default router;