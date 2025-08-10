import { Router } from 'express';
import { ExpenseController } from '@controllers/expenseController';
import { validateExpense, validateExpenseUpdate } from '@validator/validationMiddlewares';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';

const router = Router();
const expenseController = new ExpenseController();

// Authenticated routes (require authentication)
router.get('/', authenticateToken, expenseController.getAllExpenses);
router.get('/total', authenticateToken, expenseController.getTotalExpenses);
router.get('/category/:category', authenticateToken, expenseController.getExpensesByCategory);
router.get('/category/:category/total', authenticateToken, expenseController.getTotalExpensesByCategory);
router.get('/range', authenticateToken, expenseController.getExpensesByDateRange);
router.get('/:id', authenticateToken, expenseController.getExpenseById);
// Additional routes for expense analysis
router.get('/category-breakdown', authenticateToken, expenseController.getCategoryBreakdown);
router.get('/top-expenses', authenticateToken, expenseController.getTopExpenses);
router.get('/compare-periods', authenticateToken, expenseController.comparePeriods);   

// Category-specific date range routes
router.get('/category/:category/range', authenticateToken, expenseController.getExpensesByCategoryAndDateRange);

// Admin-only routes (require authentication and admin role)
router.post('/', authenticateToken, authorizeRole('admin'), validateExpense, expenseController.addExpense);
router.put('/:id', authenticateToken, authorizeRole('admin'), validateExpenseUpdate, expenseController.updateExpense);
router.delete('/:id', authenticateToken, authorizeRole('admin'), expenseController.deleteExpense);

export default router;