import { col, fn, literal, Op } from '@sequelize/core';
import { EXPENSE_CATEGORY } from '@src/enums/database';
import { Expense } from '@src/sequelize/models/expenses';
import BaseService from '@src/services/baseService';

class ExpenseService extends BaseService<Expense> {
    constructor() {
        super(Expense);
    }

    // Get expenses by category
    async findByCategory(category: string): Promise<Expense[]> {
        try {
            const expenses = await Expense.findAll({
                where: { category },
            });
            return expenses;
        } catch (error) {
            throw new Error('Failed to fetch expenses by category');
        }
    }

    // Get expenses within a date range
    async findByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
        try {
            const expenses = await Expense.findAll({
                where: {
                    expense_date: {
                        [Op.between]: [startDate, endDate],
                    },
                },
            });
            return expenses;
        } catch (error) {
            throw new Error('Failed to fetch expenses by date range');
        }
    }

    // Calculate total expenses in a date range
    async calculateTotalExpenses(startDate: Date, endDate: Date): Promise<number> {
        try {
            const expenses = await this.findByDateRange(startDate, endDate);
            const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            return total;
        } catch (error) {
            throw new Error('Failed to calculate total expenses');
        }
    }

    // Get expenses by category within a date range
    async findByCategoryAndDateRange(category: string, startDate: Date, endDate: Date): Promise<Expense[]> {
        try {
            const expenses = await Expense.findAll({
                where: {
                    category,
                    expense_date: {
                        [Op.between]: [startDate, endDate],
                    },
                },
            });
            return expenses;
        } catch (error) {
            throw new Error('Failed to fetch expenses by category and date range');
        }
    }

    // Calculate total expenses by category
    async calculateTotalByCategory(category: string, startDate?: Date, endDate?: Date): Promise<number> {
        try {
            let expenses: Expense[];
            if (startDate && endDate) {
                expenses = await this.findByCategoryAndDateRange(category, startDate, endDate);
            } else {
                expenses = await this.findByCategory(category);
            }
            return expenses.reduce((sum, expense) => sum + expense.amount, 0);
        } catch (error) {
            throw new Error('Failed to calculate total expenses by category');
        }
    }

    async getCategoryBreakdown(startDate: Date, endDate: Date): Promise<{ category: string; amount: number; percentage: number }[]> {
        try {
            const total = await this.calculateTotalExpenses(startDate, endDate);
            if (total === 0) return [];

            const results = await Expense.findAll({
                attributes: [
                    'category',
                    [fn('SUM', col('amount')), 'amount'],
                    [literal(`ROUND(SUM(amount) / ${total} * 100, 1)`), 'percentage']
                ],
                where: {
                    expense_date: {
                        [Op.between]: [startDate, endDate],
                    },
                },
                group: ['category'],
                order: [[fn('SUM', col('amount')), 'DESC']],
                raw: true
            }) as Array<{ category: string; amount: number; percentage: string }>;

            return results.map(item => ({
                category: item.category,
                amount: item.amount,
                percentage: parseFloat(item.percentage)
            }));
        } catch (error) {
            throw new Error('Failed to get expense breakdown by category');
        }
    }

    // Get top expenses (largest amounts)
    async getTopExpenses(limit: number = 5, startDate?: Date, endDate?: Date): Promise<Expense[]> {
        try {
            const where: any = {};
            if (startDate && endDate) {
                where.expense_date = { [Op.between]: [startDate, endDate] };
            }

            return await Expense.findAll({
                where,
                order: [['amount', 'DESC']],
                limit
            });
        } catch (error) {
            throw new Error('Failed to get top expenses');
        }
    }

    async comparePeriods(
        currentStart: Date,
        currentEnd: Date,
        previousStart: Date,
        previousEnd: Date
    ): Promise<{
        currentTotal: number;
        previousTotal: number;
        changePercentage: number;
        categoryComparison: Record<string, {
            current: number;
            previous: number;
            change: number;
        }>;
    }> {
        try {
            // Get current period data
            const currentBreakdown = await this.getCategoryBreakdown(currentStart, currentEnd);
            const currentTotal = await this.calculateTotalExpenses(currentStart, currentEnd);

            // Get previous period data
            const previousBreakdown = await this.getCategoryBreakdown(previousStart, previousEnd);
            const previousTotal = await this.calculateTotalExpenses(previousStart, previousEnd);

            // Calculate change percentage
            const changePercentage = previousTotal === 0 ? 0 :
                ((currentTotal - previousTotal) / previousTotal) * 100;

            // Create category comparison
            const allCategories = new Set([
                ...currentBreakdown.map(item => item.category),
                ...previousBreakdown.map(item => item.category)
            ]);

            const categoryComparison: Record<string, any> = {};

            for (const category of allCategories) {
                const current = currentBreakdown.find(item => item.category === category)?.amount || 0;
                const previous = previousBreakdown.find(item => item.category === category)?.amount || 0;
                const change = previous === 0 ? 0 : ((current - previous) / previous) * 100;

                categoryComparison[category] = { current, previous, change };
            }

            return {
                currentTotal,
                previousTotal,
                changePercentage,
                categoryComparison
            };
        } catch (error) {
            throw new Error('Failed to compare expense periods');
        }
    }




}

export default new ExpenseService();