import { Customer, Room } from '@src/sequelize/models';
import { Complaint } from '@src/sequelize/models/complaintModel';
import BaseService from '@src/services/baseService';

class ComplaintService extends BaseService<Complaint> {
  constructor() {
    super(Complaint);
  }

  async findAll(): Promise<Complaint[]> {
    return this.model.findAll({
      include: [
        {
          model: Customer,
          attributes: ['firstname', 'lastname'],
          required: false,
        },
        {
          model: Room,
          attributes: ['name'],
          required: false,
        },
      ],
    });
  }
  
}

export default new ComplaintService();