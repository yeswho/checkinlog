import { Floor } from '@src/sequelize/models/floorsModel';
import BaseService from '@src/services/baseService';
class FloorService extends BaseService<Floor>{
constructor(){
    super(Floor)
}
}

export default new FloorService();
