import CustomerService from '@services/customerService';
import { NextFunction, Request, Response } from 'express';

export class CustomerController {
  // Get all customers
  getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customers = await CustomerService.findAll();
      res.json(customers);
    } catch (error) {
      next(error);
    }
  };
  // Get customer by ID
  getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const customer = await CustomerService.findById(Number(id));
      res.json(customer);
    } catch (error) {
      next(error);
    }
  };
  // Add a customer
  addCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newCustomer = await CustomerService.create(req.body);
      res.status(201).json(newCustomer);
    } catch (error) {
      next(error);
    }
  };
  // Update a customer
  updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const updatedCustomer = await CustomerService.update(Number(id), req.body);
      res.json(updatedCustomer);
    } catch (error) {
      next(error);
    }
  };
  // Delete a customer
  deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await CustomerService.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
