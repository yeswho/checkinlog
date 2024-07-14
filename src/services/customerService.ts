import { Customer } from '@models/customer';
import { CustomError } from '@src/middleware/errorHandler';

export class CustomerService {
    // Method to get all customers
    static async getAllCustomers(): Promise<Customer[]> {
        try {
            const customers = await Customer.findAll();
            return customers;
        } catch (error: any) {
            throw new CustomError(`Error fetching customers: ${error.message}`, 500);
        }
    }
    // Method to get a customer by ID
    static async getCustomerById(id: string): Promise<Customer> {
        try {
            const customer = await Customer.findByPk(id);
            if (!customer) {
                throw new CustomError('Customer not found', 400);
            }
            return customer;
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(`Database error: ${error.message}`, 500);
        }
    }
    // Method to add a customer
    static async addCustomer(data: any): Promise<Customer> {
        try {
            const customer = await Customer.create(data);
            return customer;
        } catch (error: any) {
            throw new CustomError(`Error creating customer: ${error.message}`, 500);
        }
    }
    // Method to update a customer
    static async updateCustomer(id: string, data: any): Promise<Customer | null> {
        try {
            const customer = await Customer.findByPk(id);
            if (!customer) {
                throw new CustomError('Customer not found', 400);
            }
            await customer.update(data);
            return customer;
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(`Error updating customer: ${error.message}`, 500);
        }
    }
    // Method to delete a customer
    static async deleteCustomer(id: string): Promise<boolean> {
        try {
            const customer = await Customer.findByPk(id);
            if (!customer) {
                throw new CustomError('Customer not found', 400);
            }
            await customer.destroy();
            return true;
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(`Error deleting customer: ${error.message}`, 500);
        }
    }
}