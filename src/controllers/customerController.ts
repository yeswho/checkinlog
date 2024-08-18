import { CustomerService } from '@services/customerService';
import { NextFunction, Request, Response } from 'express';

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
    // Method to get customer by ID
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
        try {
            const { id } = req.params;
            await CustomerService.deleteCustomer(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
