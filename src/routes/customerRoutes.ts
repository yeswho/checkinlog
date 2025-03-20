import { CustomerController } from '@controllers/customerController';
import { validateCustomer, validateCustomerUpdate } from '@validator/validationMiddlewares';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';
import { Router } from 'express';

const router = Router();
const customerController = new CustomerController();

// Authenticated routes (require authentication)
router.get('/', authenticateToken, customerController.getAllCustomers);
router.get('/search', authenticateToken, customerController.searchCustomer);
router.get('/:id', authenticateToken, customerController.getCustomerById);

// Admin-only routes (require authentication and admin role)
router.post('/', authenticateToken, authorizeRole('admin'), validateCustomer, customerController.addCustomer);
router.put('/:id', authenticateToken, authorizeRole('admin'), validateCustomerUpdate, customerController.updateCustomer);
router.delete('/:id', authenticateToken, authorizeRole('admin'), customerController.deleteCustomer);

export default router;