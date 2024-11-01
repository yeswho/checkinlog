import { Customer } from '@src/sequelize/models/customerModel';
import BaseService from '@src/services/baseService';
class CustomerService extends BaseService<Customer> {
  constructor() {
    super(Customer);
  }

}

export default new CustomerService();
