import { Op } from '@sequelize/core';
import { BOOKING_STATUS, ROOM_STATUS } from '@src/enums/database';
import { RoomDetails } from '@src/interfaces/common';
import { CustomError } from '@src/middleware/errorHandler';
import { Booking, BookingRoom, Customer, Floor, Maintenance, RoomType } from '@src/sequelize/models';
import { Room } from '@src/sequelize/models/roomsModel';
import BaseService from '@src/services/baseService';

const query = `
  SELECT 
      rooms.id AS room_id,
      rooms.name AS room_name,
      rooms.floor_id,
      rooms.roomType_id,
      rooms.rate,
      rooms.status,
      rooms.createdAt AS room_createdAt,
      rooms.updatedAt AS room_updatedAt,
      floors.id AS floor_id,
      floors.name AS floor_name,
      room_types.id AS roomType_id,
      room_types.name AS roomType_name,
      bookings.check_in,
      bookings.check_out,
      customers.firstname AS customer_firstname,
      customers.lastname AS customer_lastname,
      customers.contact AS customer_contact,
      maintenances.reason AS maintenance_reason,
      maintenances.startDate AS maintenance_startDate,
      maintenances.expectedEndDate AS maintenance_expectedEndDate
  FROM 
      rooms
  LEFT JOIN 
      floors ON rooms.floor_id = floors.id
  LEFT JOIN 
      room_types ON rooms.roomType_id = room_types.id
  LEFT JOIN 
      bookings ON rooms.id = bookings.room_id
      AND bookings.check_in <= :currentDate
      AND bookings.check_out >= :currentDate
  LEFT JOIN 
      customers ON bookings.customer_id = customers.id
  LEFT JOIN 
      maintenances ON rooms.id = maintenances.room_id
      AND maintenances.startDate <= :currentDate
      AND maintenances.expectedEndDate >= :currentDate;
`;
class RoomService extends BaseService<Room> {
  constructor() {
    super(Room);
  }

  // Display all rooms for table
  // async getAllRoomDetails(): Promise<any[]> {
  //   try {
  //     const rooms = await this.model.findAll({
  //       include: [
  //         {
  //           model: Floor,
  //           attributes: ['id', 'name']
  //         },
  //         {
  //           model: RoomType,
  //           attributes: ['id', 'name']
  //         }
  //       ],
  //       attributes: ['id', 'name', 'floor_id', 'roomType_id', 'rate', 'status', 'createdAt', 'updatedAt']
  //     });

  //     return rooms.map(room => ({
  //       id: room.id,
  //       name: room.name,
  //       floor: room.floor ? { id: room.floor.id, name: room.floor.name } : null,
  //       room_type: room.roomType ? { id: room.roomType.id, name: room.roomType.name } : null,
  //       rate: room.rate,
  //       status: room.status,
  //       createdAt: room.createdAt,
  //       updatedAt: room.updatedAt
  //     }));
  //   } catch (err) {
  //     console.error('Error in getAllRoomDetails:', err);
  //     if (err instanceof CustomError) {
  //       throw err;
  //     }
  //     throw new CustomError('Failed to fetch room details', 500);
  //   }
  // }

  async delete(roomId: number): Promise<boolean> {
    try {
      await Room.sequelize.transaction(async (transaction) => {
        await BookingRoom.destroy({
          where: { room_id: roomId },
          transaction,
        });

        await Room.destroy({
          where: { id: roomId },
          transaction,
        });

      });
      return true;
    } catch (error) {
      throw new CustomError('Failed to delete room', 500);
    }
  }

  async getAllRoomDetails(): Promise<RoomDetails[]> {
    try {
      const currentDate = new Date();
  
      const rooms = await this.model.findAll({
        include: [
          {
            model: Floor,
            attributes: ['id', 'name'],
          },
          {
            model: RoomType,
            attributes: ['id', 'name'],
          },
          {
            model: Booking,
            attributes: ['check_in', 'check_out', 'status'],
            where: {
              check_in: { [Op.lte]: currentDate },
              check_out: { [Op.gte]: currentDate },
              status: {
                [Op.notIn]: [
                  BOOKING_STATUS.CANCELLED,
                  BOOKING_STATUS.COMPLETED,
                  BOOKING_STATUS.NO_SHOW,
                ],
              },
            },
            required: false,
            include: [
              {
                model: Customer,
                attributes: ['firstname', 'lastname', 'contact'],
              },
            ],
          },
          {
            model: Maintenance,
            attributes: ['reason', 'startDate', 'expectedEndDate'],
            where: {
              startDate: { [Op.lte]: currentDate },
              expectedEndDate: { [Op.gte]: currentDate },
            },
            required: false,
          },
        ],
        attributes: ['id', 'name', 'floor_id', 'roomType_id', 'rate', 'status', 'createdAt', 'updatedAt'],
      });
  
      // If no rooms are found, return an empty array
      if (!rooms || rooms.length === 0) {
        return [];
      }
  
      return rooms.map((room) => {
        let status = room.status;
  
        if (room.maintenances && room.maintenances.length > 0) {
          status = ROOM_STATUS.UNDER_MAINTAINANCE;
        }
        else if (room.bookings && room.bookings.length > 0) {
          status = ROOM_STATUS.OCCUPIED;
        }
  
        return {
          id: room.id,
          name: room.name,
          floor: room.floor ? { id: room.floor.id, name: room.floor.name } : null,
          room_type: room.roomType ? { id: room.roomType.id, name: room.roomType.name } : null,
          rate: room.rate,
          status: status, // Use the dynamically determined status
          occupiedDetails: room.bookings?.[0]
            ? {
                customer: {
                  firstName: room.bookings[0].customer.firstname,
                  lastName: room.bookings[0].customer.lastname,
                  contact: room.bookings[0].customer.contact,
                },
                checkIn: room.bookings[0].check_in.toISOString(),
                checkOut: room.bookings[0].check_out.toISOString(),
              }
            : null,
          maintenanceDetails: room.maintenances?.[0]
            ? {
                reason: room.maintenances[0].reason,
                startDate: room.maintenances[0].startDate.toISOString(),
                expectedEndDate: room.maintenances[0].expectedEndDate.toISOString(),
              }
            : null,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        };
      });
    } catch (err) {
      console.error('Error in getAllRoomDetails:', err);
  
      // Return an empty array in case of any error
      return [];
    }
  }

  // Get all rooms in a floor
  async getRoomsInFloor(id: number): Promise<Room[]> {
    try {
      const rooms = await this.model.findAll({
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
  async getAvailableRooms(): Promise<Room[]> {
    try {
      const rooms = await this.model.findAll({
        where: {
          status: ROOM_STATUS.AVAILABLE
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
      const availableRooms = await this.model.findAll({
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
