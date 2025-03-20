import { CustomError } from '@src/middleware/errorHandler';
import { Customer } from '@src/sequelize/models/customerModel';
import BaseService from '@src/services/baseService';
import { Op } from 'sequelize';

class CustomerService extends BaseService<Customer> {
  constructor() {
    super(Customer);
  }

async findAllPaginated(page: number = 1, limit: number = 10): Promise<{ data: Customer[]; total: number }> {
  try {
    const offset = (page - 1) * limit;

    const { count, rows: customers } = await this.model.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return { data: customers, total: count };
  } catch (error: any) {
    throw new CustomError("Error fetching customers", 500);
  }
}

async searchCustomers(query: string): Promise<Customer[]> {
  try {
    // Validate the query parameter

    console.log("Search Query in Service:", query); 
    
    if (!query || typeof query !== "string") {
      throw new CustomError("Invalid search query", 400);
    }

    if (!this.model.sequelize) {
      throw new CustomError("Sequelize instance not found", 500);
    }
    const customers = await this.model.sequelize.query(
      `
      SELECT * 
      FROM Customers
      WHERE 
        firstname LIKE :query OR 
        lastname LIKE :query OR 
        email LIKE :query
      ORDER BY createdAt DESC
      `,
      {
        replacements: { query: `%${query}%` },
        model: this.model,
        mapToModel: true, 
      }
    );

    return customers as unknown as Customer[];
  } catch (error: any) {
    console.error("Error in searchCustomers:", error);
    throw new CustomError("Error searching customers", 500);
  }
}

}

export default new CustomerService();
