import { Op } from '@sequelize/core';
import { Employee } from '@src/sequelize/models';
import { Salary } from '@src/sequelize/models/salary';
import { Expense } from '@src/sequelize/models/expenses';
import BaseService from '@src/services/baseService';
import ExpenseService from '@src/services/expenseService';
import { EXPENSE_CATEGORY } from '@src/enums/database';


class SalaryService extends BaseService<Salary> {
    constructor() {
        super(Salary);
    }

    // Get all salaries with employee details
    async getAllSalariesWithEmployeeDetails(): Promise<any[]> {
        try {
            const salaries = await Salary.findAll({
                include: [
                    {
                        model: Employee,
                        attributes: ['name', 'basic_salary'],
                    },
                ],
            });
            return salaries;
        } catch (error) {
            throw new Error('Failed to fetch salaries with employee details');
        }
    }

     async createSalaryWithAdvanceDeduction(data: any): Promise<Salary> {
        try {
            const totalAdvance = await ExpenseService.getEmployeeAdvances(data.employee_id);
            
            // Create salary record with advance deduction
            const salary = await Salary.create({
                ...data,
                advance: totalAdvance,
                total_salary: data.basic_salary + (data.bonus || 0) + (data.overtime || 0) - Number(totalAdvance)
            });

            // Mark advances as deducted (optional - could add a flag to expense model)
            await Expense.update(
                { is_deducted: true },
                { 
                    where: { 
                        category: EXPENSE_CATEGORY.EMPLOYEE_ADVANCE,
                        employee_id: data.employee_id,
                        is_deducted: false 
                    } 
                }
            );

            return salary;
        } catch (error) {
            throw new Error('Failed to create salary with advance deduction');
        }
    }

    // Find salaries by employee ID
    async findByEmployeeId(employeeId: number): Promise<Salary[]> {
        try {
            const salaries = await Salary.findAll({
                where: { employee_id: employeeId },
            });
            return salaries;
        } catch (error) {
            throw new Error('Failed to fetch salaries by employee ID');
        }
    }

    // Calculate total salary for an employee in a date range
    async calculateTotalSalaryByEmployeeId(employeeId: number, startDate: Date, endDate: Date): Promise<number> {
        try {
            const salaries = await Salary.findAll({
                where: {
                    employee_id: employeeId,
                    salary_date: {
                        [Op.between]: [startDate, endDate],
                    },
                },
            });

            const totalSalary = salaries.reduce((sum, salary) => sum + salary.total_salary, 0);
            return totalSalary;
        } catch (error) {
            throw new Error('Failed to calculate total salary');
        }
    }

     // Find salaries by employee ID with employee details
     async findByEmployeeIdWithDetails(employeeId: number): Promise<any[]> {
        try {
            const salaries = await Salary.findAll({
                where: { employee_id: employeeId },
                include: [
                    {
                        model: Employee,
                        attributes: ['name', 'basic_salary'],
                    },
                ],
            });
            return salaries;
        } catch (error) {
            throw new Error('Failed to fetch salaries by employee ID with details');
        }
    }

    async getSalaryDetailsByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
        try {
            const salaries = await Salary.findAll({
                where: {
                    salary_date: {
                        [Op.between]: [startDate, endDate],
                    },
                },
                include: [
                    {
                        model: Employee,
                        attributes: ['name'],
                    },
                ],
            });
            return salaries;
        } catch (error) {
            throw new Error('Failed to fetch salary details by date range');
        }
    }

}

export default new SalaryService();