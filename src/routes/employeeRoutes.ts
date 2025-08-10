import { Router } from 'express';
import { EmployeeController } from '@controllers/employeeController';
import { validateEmployee, validateEmployeeUpdate } from '@validator/validationMiddlewares';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';

const router = Router();
const employeeController = new EmployeeController();

// Authenticated routes (require authentication)
router.get('/', authenticateToken, employeeController.getAllEmployees);
router.get('/:id', authenticateToken, employeeController.getEmployeeById);

// Admin-only routes (require authentication and admin role)
router.post('/', authenticateToken, authorizeRole('admin'), validateEmployee, employeeController.addEmployee);
router.put('/:id', authenticateToken, authorizeRole('admin'), validateEmployeeUpdate, employeeController.updateEmployee);
router.delete('/:id', authenticateToken, authorizeRole('admin'), employeeController.deleteEmployee);

export default router;
