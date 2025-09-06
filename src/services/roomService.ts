import Sequelize, { Op } from '@sequelize/core';
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

  static async getAllRoomsForFrontend() {
    const roomTypes = await RoomType.findAll();

    const rooms = await Room.findAll({
      where: { status: ROOM_STATUS.AVAILABLE },
      attributes: ['roomType_id'],
    });

    const availableCountMap: Record<number, number> = {};

    rooms.forEach((r) => {
      const id = r.roomType_id;
      availableCountMap[id] = (availableCountMap[id] || 0) + 1;
    });

    const formatted = await Promise.all(
      roomTypes.map(async (rt) => {
        const anyRoom = await Room.findOne({ where: { roomType_id: rt.id } });

        return {
          id: anyRoom?.id ?? rt.id,
          title: anyRoom?.name ?? rt.name,
          category: rt.name,
          description: rt.description,
          price: anyRoom?.rate ?? 0,
          size: rt.size,
          capacity: rt.capacity,
          amenities: rt.amenities?.split(',') || [],
          images: {
            main: rt.main_image,
            gallery: rt.gallery_images?.split(',') || [],
          },
          availableRooms: availableCountMap[rt.id] ?? 0,
        };
      })
    );

    return formatted;
  }

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

  async getAllRoomDetails(
    page: number = 1,
    pageSize: number = 20,
    filter?: string,
    statusFilter?: string,
    sortColumn?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<{ rows: RoomDetails[]; count: number }> {
    try {
      const currentDate = new Date();
      const offset = (page - 1) * pageSize;

      const whereClause: any = {};
      if (filter) {
        whereClause.name = { [Op.like]: `%${filter}%` };
      }
      if (statusFilter && statusFilter !== 'all') {
        whereClause.status = statusFilter;
      }

      const orderClause: any[] = [];
      if (sortColumn && sortDirection) {
        if (sortColumn === 'floor') {
          orderClause.push([Floor, 'name', sortDirection]);
        } else if (sortColumn === 'room_type') {
          orderClause.push([RoomType, 'name', sortDirection]);
        } else {
          orderClause.push([sortColumn, sortDirection]);
        }
      }

      const { count, rows } = await this.model.findAndCountAll({
        where: whereClause,
        limit: pageSize,
        offset: offset,
        order: orderClause,
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
      if (!rows || rows.length === 0) {
        return { rows: [], count: 0 };
      }

      return {
        rows: rows.map((room) => {
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
        }),
        count: count,
      };
    } catch (err) {
      console.error('Error in getAllRoomDetails:', err);

      // Return an empty array and count in case of any error
      return { rows: [], count: 0 };
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
  async getAvailableRooms(params?: { checkIn?: string; checkOut?: string }): Promise<any[]> {
    try {
      const where: any = {
        status: ROOM_STATUS.AVAILABLE
      };

      // Add date overlap checking if dates are provided
      if (params?.checkIn && params?.checkOut) {
        where[Op.and] = [
          // Room is not booked for the requested dates
          {
            id: {
              [Op.notIn]: Sequelize.literal(`(
              SELECT room_id 
              FROM booking_rooms
              JOIN bookings ON booking_rooms.booking_id = bookings.id
              WHERE bookings.status NOT IN (
                '${BOOKING_STATUS.CANCELLED}', 
                '${BOOKING_STATUS.COMPLETED}',
                '${BOOKING_STATUS.NO_SHOW}'
              )
              AND bookings.check_out > '${params.checkIn}'
              AND bookings.check_in < '${params.checkOut}'
            )`)
            }
          }
        ];
      }

      const rooms = await this.model.findAll({
        where,
        include: [
          {
            model: RoomType,
            as: 'roomType'
          },
          {
            model: Floor,
            as: 'floor'
          }
        ],
        order: [
          ['floor_id', 'ASC'],
          ['name', 'ASC']
        ]
      });

      return rooms.map(room => ({
        ...room.toJSON(),
        room_type: room.roomType,
        floor: room.floor,
      }));
    } catch (err) {
      console.error('Error fetching available rooms:', err);
      throw new CustomError('Failed to fetch available rooms', 500);
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
