import { NextFunction, Request, Response } from 'express';
import ExpenseService from '@services/expenseService';
import { CustomError } from '@src/middleware/errorHandler';

export class ExpenseController {
    // Get all expenses
    getAllExpenses = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const expenses = await ExpenseService.findAll();
            res.json(expenses);
        } catch (error) {
            next(error);
        }
    };

    // Get expense by ID
    getExpenseById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const expense = await ExpenseService.findById(Number(id));
            if (!expense) {
                throw new CustomError('Expense not found', 404);
            }
            res.json(expense);
        } catch (error) {
            next(error);
        }
    };

    // Add an expense record
    addExpense = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newExpense = await ExpenseService.create(req.body);
            res.status(201).json(newExpense);
        } catch (error) {
            next(error);
        }
    };

    // Update an expense record
    updateExpense = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const updatedExpense = await ExpenseService.update(Number(id), req.body);
            if (!updatedExpense) {
                throw new CustomError('Expense not found', 404);
            }
            res.json(updatedExpense);
        } catch (error) {
            next(error);
        }
    };

    // Delete an expense record
    deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const deleted = await ExpenseService.delete(Number(id));
            if (!deleted) {
                throw new CustomError('Expense not found', 404);
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    // Get expenses by category
    getExpensesByCategory = async (req: Request, res: Response, next: NextFunction) => {
        const { category } = req.params;
        try {
            const expenses = await ExpenseService.findByCategory(category);
            res.json(expenses);
        } catch (error) {
            next(error);
        }
    };

    // Get expenses by date range
    getExpensesByDateRange = async (req: Request, res: Response, next: NextFunction) => {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            throw new CustomError('Missing start date or end date', 400);
        }

        try {
            const expenses = await ExpenseService.findByDateRange(
                new Date(startDate as string),
                new Date(endDate as string)
            );
            res.json(expenses);
        } catch (error) {
            next(error);
        }
    };

    // Get total expenses
    getTotalExpenses = async (req: Request, res: Response, next: NextFunction) => {
        const { startDate, endDate } = req.query;
        
        try {
            let total: number;
            if (startDate && endDate) {
                total = await ExpenseService.calculateTotalExpenses(
                    new Date(startDate as string),
                    new Date(endDate as string)
                );
            } else {
                const allExpenses = await ExpenseService.findAll();
                total = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            }
            res.json({ total });
        } catch (error) {
            next(error);
        }
    };

    // Get expenses by category and date range
    getExpensesByCategoryAndDateRange = async (req: Request, res: Response, next: NextFunction) => {
        const { category } = req.params;
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            throw new CustomError('Missing start date or end date', 400);
        }

        try {
            const expenses = await ExpenseService.findByCategoryAndDateRange(
                category,
                new Date(startDate as string),
                new Date(endDate as string)
            );
            res.json(expenses);
        } catch (error) {
            next(error);
        }
    };

    // Get total expenses by category
    getTotalExpensesByCategory = async (req: Request, res: Response, next: NextFunction) => {
        const { category } = req.params;
        const { startDate, endDate } = req.query;
        
        try {
            let total: number;
            if (startDate && endDate) {
                total = await ExpenseService.calculateTotalByCategory(
                    category,
                    new Date(startDate as string),
                    new Date(endDate as string)
                );
            } else {
                total = await ExpenseService.calculateTotalByCategory(category);
            }
            res.json({ category, total });
        } catch (error) {
            next(error);
        }
    };

    // Get category breakdown
    getCategoryBreakdown = async (req: Request, res: Response, next: NextFunction) => {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            throw new CustomError('Missing start date or end date', 400);
        }

        try {
            const breakdown = await ExpenseService.getCategoryBreakdown(
                new Date(startDate as string),
                new Date(endDate as string)
            );
            res.json(breakdown);
        } catch (error) {
            next(error);
        }
    };


    // Get top expenses
    getTopExpenses = async (req: Request, res: Response, next: NextFunction) => {
        const { limit } = req.query;
        const { startDate, endDate } = req.query;

        try {
            const topExpenses = await ExpenseService.getTopExpenses(
                limit ? Number(limit) : 5,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );
            res.json(topExpenses);
        } catch (error) {
            next(error);
        }
    };

    // Compare expense periods
    comparePeriods = async (req: Request, res: Response, next: NextFunction) => {
        const { currentStart, currentEnd, previousStart, previousEnd } = req.query;

        if (!currentStart || !currentEnd || !previousStart || !previousEnd) {
            throw new CustomError('Missing required date parameters', 400);
        }

        try {
            const result = await ExpenseService.comparePeriods(
                new Date(currentStart as string),
                new Date(currentEnd as string),
                new Date(previousStart as string),
                new Date(previousEnd as string)
            );
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    
}