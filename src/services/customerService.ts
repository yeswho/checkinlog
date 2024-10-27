import { Customer } from '@src/sequelize/models/customerModel';
import BaseService from '@src/services/baseService';
class CustomerService extends BaseService<Customer> {
  constructor() {
    super(Customer);
  }

//incase override is needed
  // async create(data:Partial<CustomerData>) : Promise<Customer>{
  //   try {
  //    const addData = await Customer.create({
  //     ...data,
  //     address:"hehe"
  //   } as CreationAttributes<Customer>);
  //   return addData;
  //   } catch (error: any) {
  //     throw new CustomError(`Error creating entry: ${error.message}`, 500);
  //   }
  // }

}

export default new CustomerService();
