import { literal, Op, sql } from '@sequelize/core';
import { BOOKING_STATUS, PAYMENT_MODE, ROOM_STATUS } from '@src/enums/database';
import { CustomError } from '@src/middleware/errorHandler';
import { Billing, Booking, BookingRoom, Customer, Floor, Room, RoomType } from '@src/sequelize/models';
import BaseService from '@src/services/baseService';
import logger from '@src/utils/logger';

class BookingService extends BaseService<Booking> {

  constructor() {
    super(Booking);
  }


  async update(id: number, data: Partial<Booking>): Promise<Booking> {
      // Fetch the current booking
      const currentBooking = await this.findById(id);
      if (!currentBooking) {
        throw new CustomError('Booking not found', 404);
      }
  
      // Convert check_in and check_out to Date objects if they are strings
      if (data.check_in && typeof data.check_in === 'string') {
        data.check_in = new Date(data.check_in);
      }
      if (data.check_out && typeof data.check_out === 'string') {
        data.check_out = new Date(data.check_out);
      }
  
      // Prevent updates if status is COMPLETED
      if (currentBooking.status === BOOKING_STATUS.COMPLETED) {
        throw new CustomError('Booking cannot be updated because its status is COMPLETED', 400);
      }
  
      // Prevent updates to check_in and check_out after check-in
      if (
        (currentBooking.status === BOOKING_STATUS.CHECKED_IN || currentBooking.status === BOOKING_STATUS.CHECKED_OUT) &&
        (data.check_in && data.check_in.toISOString() !== currentBooking.check_in.toISOString() || 
         data.check_out && data.check_out.toISOString() !== currentBooking.check_out.toISOString())
      ) {
        throw new CustomError('Check-in and check-out dates cannot be updated after check-in', 400);
      }

      if (data.status === BOOKING_STATUS.COMPLETED){
          throw new CustomError('Status cannot be changed to COMPLETED, please generate bill once the order is in CHECK-OUT', 400);
        }
  
      // Prevent changing status to BOOKED after check-in
      if (
        (currentBooking.status === BOOKING_STATUS.CHECKED_IN || currentBooking.status === BOOKING_STATUS.CHECKED_OUT) &&
        data.status === BOOKING_STATUS.BOOKED
      ) {
        throw new CustomError('Status cannot be changed to BOOKED after check-in', 400);
      }
  
      // Prevent changing status to CANCELLED after check-in
      if (
        (currentBooking.status === BOOKING_STATUS.CHECKED_IN || currentBooking.status === BOOKING_STATUS.CHECKED_OUT) &&
        data.status === BOOKING_STATUS.CANCELLED
      ) {
        throw new CustomError('Status cannot be changed to CANCELLED after check-in', 400);
      }
  
      // Prevent changing status to NO_SHOW after check-in
      if (
        (currentBooking.status === BOOKING_STATUS.CHECKED_IN || currentBooking.status === BOOKING_STATUS.CHECKED_OUT) &&
        data.status === BOOKING_STATUS.NO_SHOW
      ) {
        throw new CustomError('Status cannot be changed to NO_SHOW after check-in', 400);
      }
  
      // If all validations pass, update the booking
      await currentBooking.update(data);
  
      // Handle room updates if room_id is provided
      if (data.rooms) {
        logger.info(`Updating rooms for booking ID: ${currentBooking.id}`);
  
        // Remove existing room associations
        await BookingRoom.destroy({
          where: { booking_id: currentBooking.id },
        });
  
        // Add new room associations
        const bookingRooms = data.rooms.map((room: Room) => ({
          booking_id: currentBooking.id,
          room_id: room.id,
        }));
  
        await BookingRoom.bulkCreate(bookingRooms);
      }
  
      return currentBooking;
  }

  // async create(bookingData: any): Promise<Booking> {
  //   const { room_id, ...bookingAttributes } = bookingData;

  //   try {
  //     // Use a managed transaction
  //     const result = await Booking.sequelize.transaction(async (transaction) => {
  //       // Create the booking
  //       const booking = await Booking.create(bookingAttributes, { transaction });

  //       // Associate rooms (if any)
  //       if (room_id && room_id.length > 0) {
  //         const bookingRooms = room_id.map((roomId: number) => ({
  //           booking_id: booking.id,
  //           room_id: roomId,
  //         }));

  //         await BookingRoom.bulkCreate(bookingRooms, { transaction });
  //       }

  //       // Return the booking (will be committed automatically if no errors)
  //       return booking;
  //     });

  //     return result;
  //   } catch (error) {
  //     // The transaction is automatically rolled back if an error occurs
  //     throw new CustomError('Failed to create booking', 500);
  //   }
  // }
  async create(bookingData: any): Promise<Booking> {
    const { room_id, ...bookingAttributes } = bookingData;

    try {
      // Use a managed transaction
      const result = await Booking.sequelize.transaction(async (transaction) => {
        // Step 1: Check if the rooms are available or will be available by the new booking's check-in date
        const rooms = await Room.findAll({
          where: {
            id: room_id,
            [Op.or]: [
              { status: ROOM_STATUS.AVAILABLE }, // Room is currently available
              {
                status: ROOM_STATUS.OCCUPIED,
                id: {
                  [Op.notIn]: literal(`(
                                    SELECT room_id
                                    FROM bookings
                                    JOIN booking_rooms ON bookings.id = booking_rooms.booking_id
                                    WHERE bookings.status NOT IN ('${BOOKING_STATUS.CANCELLED}', '${BOOKING_STATUS.COMPLETED}', '${BOOKING_STATUS.NO_SHOW}', '${BOOKING_STATUS.CHECKED_OUT}')
                                    AND bookings.check_out > '${bookingAttributes.check_in}'
                                    AND bookings.check_in < '${bookingAttributes.check_out}'
                                )`),
                },
              },
            ],
          },
          transaction,
        });

        if (rooms.length !== room_id.length) {
          throw new CustomError('One or more rooms are not available for the requested dates', 400);
        }

        // Step 2: Check for overlapping bookings for the requested rooms
        const overlappingBookings = await Booking.findAll({
          where: {
            [Op.and]: [
              {
                [Op.or]: [
                  {
                    check_in: { [Op.lt]: bookingAttributes.check_out }, // New booking starts before existing booking ends
                    check_out: { [Op.gt]: bookingAttributes.check_in }, // New booking ends after existing booking starts
                  },
                ],
              },
              {
                status: {
                  [Op.notIn]: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CHECKED_OUT, BOOKING_STATUS.NO_SHOW], // Ignore cancelled/completed bookings
                },
              },
            ],
          },
          include: [
            {
              model: Room,
              where: { id: room_id },
              through: { attributes: [] }, // Exclude junction table attributes
            },
          ],
          transaction,
        });

        if (overlappingBookings.length > 0) {
          throw new CustomError('One or more rooms are already booked for the requested dates', 400);
        }

        // Step 3: Create the booking
        const booking = await Booking.create({
          ...bookingAttributes,
          status: BOOKING_STATUS.BOOKED, // Set the booking status to "Booked"
        }, { transaction });

        // Step 4: Associate rooms (if any)
        if (room_id && room_id.length > 0) {
          const bookingRooms = room_id.map((roomId: number) => ({
            booking_id: booking.id,
            room_id: roomId,
          }));

          await BookingRoom.bulkCreate(bookingRooms, { transaction });
        }

        // Return the booking (will be committed automatically if no errors)
        return booking;
      });

      return result;
    } catch (error) {
      // The transaction is automatically rolled back if an error occurs
      console.error('Error creating booking:', error); // Log the actual error
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create booking', 500);
    }
  }

  async delete(bookingId: number): Promise<boolean> {
    try {
      await Booking.sequelize.transaction(async (transaction) => {

        await BookingRoom.destroy({
          where: { booking_id: bookingId },
          transaction,
        });

        await Booking.destroy({
          where: { id: bookingId },
          transaction,
        });
      });
      return true;
    } catch (error) {
      throw new CustomError('Failed to delete booking', 500);
    }
  }

  async findAll(): Promise<any[]> {
    try {
      const bookings = await Booking.findAll({
        include: [
          {
            model: Customer,
            attributes: ['id', 'firstname', 'lastname', 'email', 'contact'],
          },
          {
            model: Room,
            include: [
              { model: Floor, attributes: ['name'] },
              { model: RoomType, attributes: ['name'] },
            ],
            through: { attributes: [] },
          },
        ],
      });

      if (!bookings) {
        throw new CustomError('No bookings found', 404);
      }

      return bookings.map((booking) => {
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const checkInNepal = new Date(checkIn.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
        const checkOutNepal = new Date(checkOut.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
        const checkInDateOnly = new Date(checkInNepal.getFullYear(), checkInNepal.getMonth(), checkInNepal.getDate());
        const checkOutDateOnly = new Date(checkOutNepal.getFullYear(), checkOutNepal.getMonth(), checkOutNepal.getDate());
        const duration = (checkOutDateOnly.getTime() - checkInDateOnly.getTime()) / (1000 * 3600 * 24);
        const totalPrice = booking.rooms.reduce((sum, room) => sum + ((room.rate || 0) * duration), 0);

        return {
          id: booking.id,
          customer_id: booking.customer_id,
          rooms: booking.rooms,
          check_in: booking.check_in,
          check_out: booking.check_out,
          duration,
          totalPrice,
          status: booking.status as BOOKING_STATUS,
          rate: booking.rate,
          pax: booking.pax,
          payment_mode: booking.payment_mode as PAYMENT_MODE,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          customer: booking.customer,
        };
      });
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to fetch bookings', 500);
    }
  }

  // Update rate manually
  async updateBookingRate(bookingId: number, newRate: number): Promise<Booking> {
    try {
      const booking = await Booking.findByPk(bookingId);
      if (!booking) {
        throw new CustomError('Booking not found', 404);
      }
      booking.rate = newRate;
      await booking.save();
      return booking;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update booking rate', 500);
    }
  }

  // All bookings in date range
  async getBookingsInDateRange(checkInDate: Date, checkOutDate: Date): Promise<any[]> {
    try {
      if (!(checkInDate instanceof Date) || !(checkOutDate instanceof Date)) {
        throw new CustomError('Invalid date format', 400);
      }
      if (checkInDate >= checkOutDate) {
        throw new CustomError('Check-out date must be after check-in date', 400);
      }

      const bookings = await Booking.findAll({
        where: {
          check_in: {
            [Op.gte]: checkInDate,
          },
          check_out: {
            [Op.lte]: checkOutDate,
          },
        },
        include: [
          {
            model: Customer,
            attributes: ['id', 'firstname', 'lastname', 'email', 'contact'],
          },
          {
            model: Room,
            include: [
              { model: Floor, attributes: ['name'] },
              { model: RoomType, attributes: ['name'] },
            ],
            through: { attributes: [] }, // Exclude junction table attributes
          },
        ],
      });

      return bookings.map((booking) => {
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const checkInNepal = new Date(checkIn.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
        const checkOutNepal = new Date(checkOut.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
        const checkInDateOnly = new Date(checkInNepal.getFullYear(), checkInNepal.getMonth(), checkInNepal.getDate());
        const checkOutDateOnly = new Date(checkOutNepal.getFullYear(), checkOutNepal.getMonth(), checkOutNepal.getDate());
        const duration = (checkOutDateOnly.getTime() - checkInDateOnly.getTime()) / (1000 * 3600 * 24);
        const total = booking.rooms.reduce((sum, room) => sum + ((room.rate || 0) * duration), 0);

        return {
          id: booking.id,
          customer_id: booking.customer_id,
          rooms: booking.rooms,
          check_in: booking.check_in,
          check_out: booking.check_out,
          duration,
          total,
          status: booking.status as BOOKING_STATUS,
          pax: booking.pax,
          payment_mode: booking.payment_mode as PAYMENT_MODE,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          customer: booking.customer,
        };
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to fetch bookings', 500);
    }
  }

  // All bookings of a customer
  async getBookingsByCustomerId(id: number): Promise<any[]> {
    try {
      const bookings = await Booking.findAll({
        where: {
          customer_id: id,
        },
        include: [
          {
            model: Customer,
            attributes: ['id', 'firstname', 'lastname', 'email', 'contact'],
          },
          {
            model: Room,
            include: [
              { model: Floor, attributes: ['name'] },
              { model: RoomType, attributes: ['name'] },
            ],
          },
        ],
      });

      return bookings.map((booking) => {
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const checkInNepal = new Date(checkIn.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
        const checkOutNepal = new Date(checkOut.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
        const checkInDateOnly = new Date(checkInNepal.getFullYear(), checkInNepal.getMonth(), checkInNepal.getDate());
        const checkOutDateOnly = new Date(checkOutNepal.getFullYear(), checkOutNepal.getMonth(), checkOutNepal.getDate());
        const duration = (checkOutDateOnly.getTime() - checkInDateOnly.getTime()) / (1000 * 3600 * 24);
        const totalPrice = booking.rooms.reduce((sum, room) => sum + ((room.rate || 0) * duration), 0);

        return {
          id: booking.id,
          customer_id: booking.customer_id,
          rooms: booking.rooms,
          check_in: booking.check_in.toISOString(),
          check_out: booking.check_out.toISOString(),
          duration,
          totalPrice,
          status: booking.status as BOOKING_STATUS,
          pax: booking.pax,
          payment_mode: booking.payment_mode as PAYMENT_MODE,
          createdAt: booking.createdAt.toISOString(),
          updatedAt: booking.updatedAt.toISOString(),
          customer: booking.customer,
        };
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to fetch bookings', 500);
    }
  }

  // Get booking details
  async getBookingDetails(bookingId: number): Promise<any> {
    try {
      const booking = await Booking.findOne({
        where: { id: bookingId },
        include: [
          {
            model: Customer,
            attributes: ['id', 'firstname', 'lastname', 'email', 'contact'],
          },
          {
            model: Room,
            include: [
              { model: Floor, attributes: ['name'] },
              { model: RoomType, attributes: ['name'] },
            ],
            through: { attributes: [] },
          },
        ],
      });

      if (!booking) {
        throw new CustomError('Booking not found', 404);
      }

      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const duration = (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24);
      console.log(booking.rooms);
      const totalPrice = booking.rooms.reduce((sum, room) => sum + ((room.rate || 0) * duration), 0);

      return {
        bookingId: booking.id,
        customer: {
          id: booking.customer.id,
          name: `${booking.customer.firstname} ${booking.customer.lastname}`,
          email: booking.customer.email,
          contactNumber: booking.customer.contact,
        },
        rooms: booking.rooms.map((room) => ({
          id: room.id,
          name: room.name,
          floor: room.floor.name,
          room_type: room.roomType.name,
          rate: room.rate,
        })),
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        duration: duration,
        totalPrice: totalPrice,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to fetch booking details', 500);
    }
  }

  // Get customers with the highest number of bookings
  async getTopCustomersWithHighestBookings(limit: number) {
    const results = await Booking.findAll({
      attributes: [
        'customer_id',
        [sql`COUNT(customer_id)`, 'booking_count'],
      ],
      group: ['customer_id'],
      order: [[sql`booking_count`, 'DESC']],
      limit,
      include: [
        {
          model: Customer,
          attributes: ['id', 'firstname', 'lastname', 'email'],
        },
        {
          model: Room,
          through: { attributes: [] }, // Exclude junction table attributes
        },
      ],
    });

    return results.map((result) => ({
      customerId: result.customer_id,
      name: `${result.customer.firstname} ${result.customer.lastname}`,
      email: result.customer.email,
      bookingCount: result.get('booking_count'),
    }));
  }

  async generateBill(bookingId: number, totalAmount: number, discount: number = 0, extraCharge: number = 0, remarks: string = ''): Promise<Billing> {
    try {
      const booking = await Booking.findByPk(bookingId);
      if (!booking) {
        throw new CustomError('Booking not found', 404);
      }

      if (booking.status !== BOOKING_STATUS.CHECKED_OUT) {
        throw new CustomError('Booking is not in CHECKED_OUT status', 400);
      }

      const finalAmount = totalAmount - discount + extraCharge;

      const billing = await Billing.create({
        booking_id: bookingId,
        total_amount: totalAmount,
        discount,
        extra_charge: extraCharge,
        final_amount: finalAmount,
        remarks,
        billing_date: new Date(),
        booking: booking
      });

      // Update booking status to COMPLETED
      booking.status = BOOKING_STATUS.COMPLETED;
      await booking.save();

      return billing;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to generate bill', 500);
    }
  }

}

export default new BookingService();