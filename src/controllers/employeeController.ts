import EmployeeService from '@services/employeeService';
import { NextFunction, Request, Response } from 'express';

export class EmployeeController {
    //  get all employees
    getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const employees = await EmployeeService.findAll();
            res.json(employees);
        } catch (error) {
            next(error);
        }
    };
    //  get employee by ID
    getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const employee = await EmployeeService.findById(Number(id));
            res.json(employee);
        } catch (error) {
            next(error);
        }
    };
    //  add an employee
    addEmployee = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newEmployee = await EmployeeService.create(req.body);
            res.status(201).json(newEmployee);
        } catch (error) {
            next(error);
        }
    };
    //  update an employee
    updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const updatedEmployee = await EmployeeService.update(Number(id), req.body);
            res.json(updatedEmployee);
        } catch (error) {
            next(error);
        }
    };
    //  delete an employee
    deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await EmployeeService.delete(Number(id));
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
