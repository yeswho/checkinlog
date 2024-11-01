import { CustomError } from '@src/middleware/errorHandler';
import { Room } from '@src/sequelize/models/roomsModel';
import BaseService from '@src/services/baseService';
import { ROOM_STATUS } from '@src/enums/database';
import { Booking } from '@src/sequelize/models';
import { Op } from '@sequelize/core';

class RoomService extends BaseService<Room> {
  constructor() {
    super(Room);
  }
  // Get all rooms in a floor
  async getRoomsInFloor(id: number): Promise<Room[]> {
    try {
      const rooms = await Room.findAll({
        where: {
          floor_id: id,
        },
      });
      return rooms;
    } catch (err) {
      if (err instanceof CustomError) {
        throw err;
      }
      throw new CustomError('Failed to fetch rooms', 500);
    }
  }
  // Get all available rooms
  async getAvailableRooms():Promise<Room[]>{
    try{
        const rooms = await Room.findAll({
            where: {
                status:ROOM_STATUS.AVAILABLE 
            }
        })
        return rooms;
    } catch (err) {
        if (err instanceof CustomError) {
            throw err;
          }
          throw new CustomError('Failed to fetch rooms', 500);
    }
  }
  // Get all available rooms in date range
  async getAvailableRoomsInRange(checkIn: Date, checkOut: Date): Promise<Room[]> {
    try {
      const availableRooms = await Room.findAll({
        include: [
          {
            model: Booking,
            required: false,
            where: {
              [Op.or]: [
                {
                  check_in: { [Op.lt]: checkOut },
                  check_out: { [Op.gt]: checkIn }
                }
              ]
            }
          }
        ],
        where: {
          '$Bookings.id$': null
        }
      });
  
      return availableRooms;
    } catch (error) {
      throw new CustomError('Failed to fetch available rooms', 500);
    }
}

}

export default new RoomService();
