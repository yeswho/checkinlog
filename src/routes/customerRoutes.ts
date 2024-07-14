import { CustomerController } from '@controllers/customerController';
import { Router } from 'express';

const router = Router();

const customerController = new CustomerController();

// Get all customers
router.get('/', customerController.getAllCustomers);
//Get customer by id
router.get('/:id', customerController.getCustomerById);
// Add a customer
router.post('/', customerController.addCustomer);
// Update customer
router.put('/:id', customerController.updateCustomer);
// Delete customer
router.delete('/:id', customerController.deleteCustomer);

export default router;
