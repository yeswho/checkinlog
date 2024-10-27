import { Room } from '@src/sequelize/models/roomsModel';
import BaseService from '@src/services/baseService';
class RoomService extends BaseService<Room>{
constructor(){
    super(Room)
}
}

export default new RoomService();
