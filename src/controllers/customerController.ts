import CustomerService from '@services/customerService';
import { NextFunction, Request, Response } from 'express';

export class CustomerController {
  // Get all customers
  getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
  
      const { data, total } = await CustomerService.findAllPaginated(page, limit);
  
      res.json({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  //Search a customer
  searchCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.query as string;
      console.log("Search Query:", query);
      const customers = await CustomerService.searchCustomers(query);
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
