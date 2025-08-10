import { Router } from 'express';
import { SalaryController } from '@controllers/salaryController';
import { validateSalary, validateSalaryUpdate } from '@validator/validationMiddlewares';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';

const router = Router();
const salaryController = new SalaryController();

// Authenticated routes (require authentication)
router.get('/', authenticateToken, salaryController.getAllSalariesWithDetails);
router.get('/range', authenticateToken, salaryController.getSalariesByDateRange);
router.get('/:id', authenticateToken, salaryController.getSalariesByEmployeeId);
router.get('/employee/:employeeId', authenticateToken, salaryController.getSalariesByEmployeeId);

// Admin-only routes (require authentication and admin role)
router.post('/', authenticateToken, authorizeRole('admin'), validateSalary, salaryController.addSalary);
router.put('/:id', authenticateToken, authorizeRole('admin'), validateSalaryUpdate, salaryController.updateSalary);
router.delete('/:id', authenticateToken, authorizeRole('admin'), salaryController.deleteSalary);

export default router;