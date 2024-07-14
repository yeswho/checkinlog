import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '@services/customerService';
import { CustomError } from '@src/middleware/errorHandler';

export class CustomerController {
    // Method to get all customers
    getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const customers = await CustomerService.getAllCustomers();
            res.json(customers);
        } catch (error) {
            next(error);
        }
    };
    // Method to get all customers
    getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const customer = await CustomerService.getCustomerById(id);
            res.json(customer);
        } catch (error) {
            next(error);
        }
    };
    // Method to add a customer
    addCustomer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newCustomer = await CustomerService.addCustomer(req.body);
            res.status(201).json(newCustomer);
        } catch (error) {
            next(error);
        }
    };
    // Method to update a customer
    updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const updatedCustomer = await CustomerService.updateCustomer(id, req.body);
            res.json(updatedCustomer);
        } catch (error) {
            next(error);
        }
    };
    // Method to delete a customer
    deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const result = await CustomerService.deleteCustomer(id);
            if (result) {
                res.status(200).send('Customer deleted successfully');
            } else {
                res.status(404).send('Customer not found');
            }
        } catch (error) {
            next(error);
        }
    };
}
