import { NextFunction, Request, Response } from 'express';
import SalaryService from '@services/salaryService';
import { CustomError } from '@src/middleware/errorHandler';
import { start } from 'repl';

export class SalaryController {
    // Get all salaries
    getAllSalaries = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const salaries = await SalaryService.findAll();
            res.json(salaries);
        } catch (error) {
            next(error);
        }
    };

    // Get salary by ID
    getSalaryById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const salary = await SalaryService.findById(Number(id));
            if (!salary) {
                throw new CustomError('Salary not found', 404);
            }
            res.json(salary);
        } catch (error) {
            next(error);
        }
    };

    // Add a salary record
    addSalary = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newSalary = await SalaryService.create(req.body);
            res.status(201).json(newSalary);
        } catch (error) {
            next(error);
        }
    };

    // Update a salary record
    updateSalary = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const updatedSalary = await SalaryService.update(Number(id), req.body);
            if (!updatedSalary) {
                throw new CustomError('Salary not found', 404);
            }
            res.json(updatedSalary);
        } catch (error) {
            next(error);
        }
    };

    // Delete a salary record
    deleteSalary = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const deleted = await SalaryService.delete(Number(id));
            if (!deleted) {
                throw new CustomError('Salary not found', 404);
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    // Get salaries by employee ID
    getSalariesByEmployeeId = async (req: Request, res: Response, next: NextFunction) => {
        const { employeeId } = req.params;
        try {
            const salaries = await SalaryService.findByEmployeeId(Number(employeeId));
            res.json(salaries);
        } catch (error) {
            next(error);
        }
    };

    getAllSalariesWithDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const salaries = await SalaryService.getAllSalariesWithEmployeeDetails();
            res.json(salaries);
        } catch (error) {
            next(error);
        }
    };

    // Get salaries by employee ID with employee details
    getSalariesByEmployeeIdWithDetails = async (req: Request, res: Response, next: NextFunction) => {
        const { employeeId } = req.params;
        try {
            const salaries = await SalaryService.findByEmployeeIdWithDetails(Number(employeeId));
            res.json(salaries);
        } catch (error) {
            next(error);
        }
    };

    getSalariesByDateRange = async (req: Request, res: Response, next: NextFunction) => {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            throw new CustomError('Missing start date or end date', 400);
        }

        try {
            const salaries = await SalaryService.getSalaryDetailsByDateRange(
                new Date(startDate as string),
                new Date(endDate as string)
            );
            res.json(salaries);
        } catch (error) {
            next(error);
        }
    };
}