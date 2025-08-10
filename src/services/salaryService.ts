import { Op } from '@sequelize/core';
import { Employee } from '@src/sequelize/models';
import { Salary } from '@src/sequelize/models/salary';
import BaseService from '@src/services/baseService';

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