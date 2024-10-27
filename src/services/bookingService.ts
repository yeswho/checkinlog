import { Booking } from '@src/sequelize/models/bookingsModel';
import BaseService from '@src/services/baseService';
class BookingService extends BaseService<Booking> {
  constructor() {
    super(Booking);
  }
}

export default new BookingService();
