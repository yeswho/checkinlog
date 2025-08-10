import { Router } from 'express';
import { EmployeeController } from '@controllers/employeeController';
import ExpenseService from '@services/expenseService';
import { validateEmployee, validateEmployeeUpdate } from '@validator/validationMiddlewares';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';

const router = Router();
const employeeController = new EmployeeController();

// Authenticated routes (require authentication)
router.get('/', authenticateToken, employeeController.getAllEmployees);
router.get('/:id', authenticateToken, employeeController.getEmployeeById);
router.get('/:id/advances', authenticateToken, async (req, res) => {
    try {
        const advances = await ExpenseService.getEmployeeAdvances(Number(req.params.id));
        const total = await ExpenseService.getEmployeeAdvances(Number(req.params.id));
        res.json({ advances, totalAdvance: total });
    } catch (error) {
        throw new Error('Failed to fetch employee advances');
    }
});

// Admin-only routes (require authentication and admin role)
router.post('/', authenticateToken, authorizeRole('admin'), validateEmployee, employeeController.addEmployee);
router.put('/:id', authenticateToken, authorizeRole('admin'), validateEmployeeUpdate, employeeController.updateEmployee);
router.delete('/:id', authenticateToken, authorizeRole('admin'), employeeController.deleteEmployee);

export default router;
