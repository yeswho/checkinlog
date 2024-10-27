import { RoomType } from '@src/sequelize/models/roomTypesModel';
import BaseService from '@src/services/baseService';
class RoomTypeService extends BaseService<RoomType>{
constructor(){
    super(RoomType)
}
}

export default new RoomTypeService();
