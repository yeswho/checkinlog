import { Employee } from '@src/sequelize/models/employee';
import BaseService from '@src/services/baseService';
class EmployeeService extends BaseService<Employee>{
constructor(){
    super(Employee)
}
}

export default new EmployeeService();
