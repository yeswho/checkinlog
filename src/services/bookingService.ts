import { literal, Op, sql } from '@sequelize/core';
import { BOOKING_SOURCE, BOOKING_STATUS, GENDER, PAYMENT_MODE, ROOM_STATUS } from '@src/enums/database';
import { CustomError } from '@src/middleware/errorHandler';
import { Billing, Booking, BookingRoom, Customer, Floor, Maintenance, Room, RoomType } from '@src/sequelize/models';
import { AdditionalCharge } from '@src/sequelize/models/additionalCharge';
import { sendBookingEmails } from '@src/utils/mailService';
import BaseService from '@src/services/baseService';
import logger from '@src/utils/logger';
import nodemailer from 'nodemailer';
import moment from 'moment-timezone';
import ejs from 'ejs';
import path from 'path';

interface WebBookingInput {
  ip: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  check_in: Date;
  check_out: Date;
  room_ids: number[];
  payment_method: PAYMENT_MODE;
  total_amount: number;
  special_requests?: string;
}

class BookingService extends BaseService<Booking> {

  constructor() {
    super(Booking);
  }

  // async bookingFromWeb(input: WebBookingInput) {
  //   return await Booking.sequelize.transaction(async (transaction) => {
  //     const { room_ids: roomTypeIds, ...bookingAttributes } = input;

  //     // Step 1: Check or create customer
  //     let customer = await Customer.findOne({
  //       where: { email: input.email },
  //       transaction
  //     });

  //     if (!customer) {
  //       customer = await Customer.create({
  //         firstname: input.first_name,
  //         lastname: input.last_name,
  //         email: input.email,
  //         contact: input.phone,
  //         dateofbirth: new Date('2000-12-25'), // Default
  //         gender: GENDER.MALE, // Default
  //       }, { transaction });
  //     }

  //     // Step 2: Validate room types exist
  //     const roomTypes = await RoomType.findAll({
  //       where: { id: roomTypeIds },
  //       transaction,
  //     });

  //     if (roomTypes.length !== roomTypeIds.length) {
  //       throw new CustomError('One or more room types are invalid', 400);
  //     }

  //     // Calculate total capacity from room types
  //     const totalCapacity = roomTypes.reduce((sum, rt) => sum + (parseInt(rt.capacity) || 1), 0);

  //     // Step 3: Create Booking with all required fields
  //     const booking = await Booking.create({
  //       customer_id: customer.id,
  //       check_in: input.check_in,
  //       check_out: input.check_out,
  //       rate: input.total_amount,
  //       pax: totalCapacity,
  //       payment_mode: input.payment_method || PAYMENT_MODE.CASH,
  //       status: BOOKING_STATUS.PENDING,
  //       source: BOOKING_SOURCE.WEB,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     }, { transaction });

  //     // Step 4: Send Email Notifications
  //     try {
  //       const emailData = {
  //         bookingReference: `BK-${booking.id}`,
  //         firstName: input.first_name,
  //         lastName: input.last_name,
  //         email: input.email,
  //         total: input.total_amount,
  //         paymentMethod: String(input.payment_method),
  //         checkIn: input.check_in.toISOString(),
  //         checkOut: input.check_out.toISOString(),
  //         specialRequests: input.special_requests,
  //         rooms: roomTypes.map(rt => ({ name: rt.name, capacity: rt.capacity })),
  //       };

  //       await sendBookingEmails(emailData);

  //     } catch (emailError) {
  //       console.error('Email sending failed:', emailError);
  //     }

  //     return booking;
  //   });
  // }

  async bookingFromWeb(bookingData: any): Promise<Booking> {
    const { room_ids: roomTypeIds, ...bookingAttributes } = bookingData;

    try {
      // Use a managed transaction
      const result = await Booking.sequelize.transaction(async (transaction) => {
        console.log('[1] Transaction started');
        // Step 1: Check or create customer
        console.log('[2] Looking for customer with email:', bookingAttributes.email);
        let customer = await Customer.findOne({
          where: { email: bookingAttributes.email },
          transaction
        });
        if (!customer) {
          console.log('[3] Creating new customer');
          customer = await Customer.create({
            firstname: bookingAttributes.first_name,
            lastname: bookingAttributes.last_name,
            email: bookingAttributes.email,
            contact: bookingAttributes.phone,
            dateofbirth: new Date('2000-12-25'), // Default
            gender: GENDER.MALE, // Default
          }, { transaction });
          console.log('[4] Customer created:', customer.id);
        } else {
          console.log('[5] Using existing customer:', customer.id);
        }

        console.log('[6] Validating room types:', roomTypeIds);
        const roomTypes = await RoomType.findAll({
          where: { id: roomTypeIds },
          transaction,
        });

        if (roomTypes.length !== roomTypeIds.length) {
          console.error('[7] Room type validation failed');
          throw new CustomError('One or more room types are invalid', 400);
        }
        console.log('[8] Room types validated');

        const totalCapacity = roomTypes.reduce((sum, rt) => sum + (parseInt(rt.capacity) || 1), 0);
        console.log('[9] Total capacity calculated:', totalCapacity);

        console.log('[10] Creating booking record');
        const booking = await Booking.create({
          ...bookingAttributes,
          customer_id: customer.id,
          pax: totalCapacity,
          rate: bookingAttributes.total_amount,
          payment_mode: bookingAttributes.payment_method || PAYMENT_MODE.CASH,
          status: BOOKING_STATUS.PENDING,
          source: BOOKING_SOURCE.WEB,
          requested_roomType: roomTypeIds,
        }, { transaction });
        console.log('[11] Booking created:', booking.id);

        try {
          console.log('[12] Preparing email data');
          const emailData = {
            bookingReference: `BK-${booking.id}`,
            firstName: bookingAttributes.first_name,
            lastName: bookingAttributes.last_name,
            email: bookingAttributes.email,
            total: bookingAttributes.total_amount,
            paymentMethod: String(bookingAttributes.payment_method),
            checkIn: bookingAttributes.check_in instanceof Date ? bookingAttributes.check_in.toISOString() : bookingAttributes.check_in,
            checkOut: bookingAttributes.check_out instanceof Date ? bookingAttributes.check_out.toISOString() : bookingAttributes.check_out,
            specialRequests: bookingAttributes.special_requests,
            phone: bookingAttributes.phone,
            rooms: roomTypes.map(rt => ({ name: rt.name, capacity: rt.capacity })),
          };
          await sendBookingEmails(emailData, { recipient: 'admin' });
          console.log('[14] Email sent successfully');
        } catch (emailError) {
          console.error('[15] Email sending failed:', emailError);
        }
        return booking;
      });

      console.log('[16] Transaction completed successfully');
      return result;
    } catch (error) {
      // The transaction is automatically rolled back if an error occurs
      console.error('[17] Error in bookingFromWeb:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create booking from website', 500);
    }
  }

  async sendConfirmationEmail(bookingId: number) {
    try {
      const booking = await Booking.findByPk(bookingId, {
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['firstname', 'lastname', 'email', 'contact']
          },
          {
            model: Room,
            as: 'rooms',
            attributes: ['id', 'name', 'rate'],
            include: [{
              model: RoomType,
              as: 'roomType',
              attributes: ['name', 'capacity', 'size']
            }]
          },
          {
            model: AdditionalCharge,
            as: 'additionalCharges',
            attributes: ['description', 'amount']
          }
        ]
      });

      if (!booking) throw new CustomError('Booking not found', 404);
      if (!booking.customer) throw new CustomError('Customer information missing', 400);

      const checkIn = moment(booking.check_in);
      const checkOut = moment(booking.check_out);
      const nights = checkOut.diff(checkIn, 'days');

      // Format dates simply
      const formatDate = (date: Date) => moment(date).format('YYYY-MM-DD');

      // Process rooms - simplified version without quantity calculations
      const rooms = booking.rooms?.map(room => ({
        name: room.name,
        type: room.roomType?.name || 'Standard',
        quantity: 1, // Default to 1 since we're not tracking quantities
        rate: room.rate || 0,
        size: room.roomType?.size || 'N/A',
        capacity: room.roomType?.capacity || 'N/A',
        subtotal: room.rate || 0
      })) || [];

      // Calculate totals
      const baseRate = rooms.reduce((sum, room) => sum + room.subtotal, 0);
      const additionalCharges = booking.additionalCharges?.reduce((sum, charge) => sum + (charge.amount || 0), 0) || 0;
      const totalAmount = (baseRate * nights) + additionalCharges;

      const emailData = {
        bookingReference: `BK-${booking.id}`,
        firstName: booking.customer.firstname,
        lastName: booking.customer.lastname,
        email: booking.customer.email,
        phone: booking.customer.contact,
        checkIn: formatDate(booking.check_in),
        checkOut: formatDate(booking.check_out),
        nights: nights,
        total: totalAmount,
        paymentMethod: String(booking.payment_mode),
        specialRequests: 'None',
        rooms: rooms
      };

      console.log("Final email data:", emailData);

      await sendBookingEmails(emailData, { recipient: 'guest' });
      return emailData;
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw new CustomError('Failed to send confirmation email', 500);
    }
  }

  async updateRoomsForBooking(bookingId: number, newRoomIds: number[]): Promise<Booking> {
    return await Booking.sequelize.transaction(async (transaction) => {
      // 1. Fetch the booking with current rooms
      const booking = await Booking.findByPk(bookingId, {
        include: [{
          model: Room,
          through: { attributes: [] }
        }],
        transaction
      });

      if (!booking) {
        throw new CustomError('Booking not found', 404);
      }

      // 2. Validate booking status
      if (![BOOKING_STATUS.PENDING, BOOKING_STATUS.BOOKED].includes(booking.status)) {
        throw new CustomError('Rooms can only be updated for PENDING or BOOKED bookings', 400);
      }

      // 3. Get current and new rooms
      const currentRooms = booking.rooms || [];
      const currentRoomIds = currentRooms.map(room => room.id);

      // If no change in rooms, return early
      if (
        newRoomIds.length === currentRoomIds.length &&
        newRoomIds.every(id => currentRoomIds.includes(id))
      ) {
        return booking;
      }

      // 4. Check room availability for PENDING bookings
      if (booking.status === BOOKING_STATUS.PENDING) {
        const availableRooms = await Room.findAll({
          where: {
            id: newRoomIds,
            status: ROOM_STATUS.AVAILABLE
          },
          transaction
        });

        if (availableRooms.length !== newRoomIds.length) {
          throw new CustomError('One or more rooms are not available', 400);
        }
      }

      // 5. For BOOKED status, verify rooms are already assigned to this booking
      if (booking.status === BOOKING_STATUS.BOOKED) {
        const existingRooms = await Room.findAll({
          where: {
            id: newRoomIds,
            status: ROOM_STATUS.OCCUPIED
          },
          include: [{
            model: Booking,
            where: { id: bookingId },
            through: { attributes: [] },
            required: true
          }],
          transaction
        });

        if (existingRooms.length !== newRoomIds.length) {
          throw new CustomError('Can only update with rooms already assigned to this booking', 400);
        }
      }

      // 6. Check for overlapping bookings (only for PENDING status)
      if (booking.status === BOOKING_STATUS.PENDING) {
        const overlapping = await Booking.findAll({
          where: {
            [Op.and]: [
              {
                [Op.or]: [
                  {
                    check_in: { [Op.lt]: booking.check_out },
                    check_out: { [Op.gt]: booking.check_in }
                  }
                ]
              },
              {
                status: {
                  [Op.notIn]: [
                    BOOKING_STATUS.CANCELLED,
                    BOOKING_STATUS.COMPLETED,
                    BOOKING_STATUS.NO_SHOW
                  ]
                }
              },
              { id: { [Op.ne]: booking.id } }
            ]
          },
          include: [{
            model: Room,
            where: { id: newRoomIds },
            through: { attributes: [] }
          }],
          transaction
        });

        if (overlapping.length > 0) {
          throw new CustomError('One or more rooms are already booked for these dates', 400);
        }
      }

      // 7. Update room statuses in bulk
      if (currentRoomIds.length > 0) {
        await Room.update(
          { status: ROOM_STATUS.AVAILABLE },
          {
            where: { id: currentRoomIds },
            transaction
          }
        );
      }

      if (newRoomIds.length > 0) {
        await Room.update(
          {
            status: booking.status === BOOKING_STATUS.PENDING
              ? ROOM_STATUS.AVAILABLE
              : ROOM_STATUS.OCCUPIED
          },
          {
            where: { id: newRoomIds },
            transaction
          }
        );
      }

      // 8. Update room associations
      await BookingRoom.destroy({
        where: { booking_id: bookingId },
        transaction
      });

      await BookingRoom.bulkCreate(
        newRoomIds.map(roomId => ({
          booking_id: bookingId,
          room_id: roomId
        })),
        { transaction }
      );

      // 9. Update booking status if needed
      if (booking.status === BOOKING_STATUS.PENDING && newRoomIds.length > 0) {
        await booking.update(
          { status: BOOKING_STATUS.BOOKED },
          { transaction }
        );
      }

      // 10. Return updated booking
      const updatedBooking = await Booking.findByPk(bookingId, {
        include: [Room],
        transaction
      });
      if (!updatedBooking) {
        throw new CustomError('Booking not found after update', 404);
      }
      return updatedBooking;
    });
  }

  async update(id: number, data: Partial<Booking>): Promise<Booking> {

    // Fetch the current booking 
    const currentBooking = await this.findById(id);
    if (!currentBooking) {
      throw new CustomError('Booking not found', 404);
    }

    if (data.status === BOOKING_STATUS.CHECKED_IN && currentBooking.status == BOOKING_STATUS.BOOKED) {
      try {
        await Booking.sequelize.query(`
        UPDATE rooms r
        JOIN booking_rooms br ON r.id = br.room_id
        SET r.status = :status
        WHERE br.booking_id = :bookingId
      `, {
          replacements: {
            status: ROOM_STATUS.OCCUPIED,
            bookingId: currentBooking.id
          },
        });
      }
      catch (error) {
        throw new CustomError('Failed to update room status to OCCUPIED', 500);
      }
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

    if (data.status === BOOKING_STATUS.COMPLETED) {
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
              { status: ROOM_STATUS.AVAILABLE },
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
                    check_in: { [Op.lte]: bookingAttributes.check_out }, // New booking starts before existing booking ends
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

        console.log("BOOKING ATTRIBUTES ARE :", bookingAttributes);
        console.log("ROOM IDS ARE :", room_id);


        if (!rooms || rooms.length === 0) {
          throw new Error('No rooms found with the provided IDs');
        }

        // Sum up the rates of all rooms
        const totalRate = rooms.reduce((sum, room) => sum + (room.rate || 0), 0);

        // Step 3: Create the booking
        const booking = await Booking.create({
          ...bookingAttributes,
          rate: totalRate,
          status: BOOKING_STATUS.BOOKED,
          source: BOOKING_SOURCE.WALK_IN
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

  // async findAll(): Promise<any[]> {
  //   try {
  //     const bookings = await Booking.findAll({
  //       include: [
  //         {
  //           model: Customer,
  //           attributes: ['id', 'firstname', 'lastname', 'email', 'contact'],
  //         },
  //         {
  //           model: Room,
  //           include: [
  //             { model: Floor, attributes: ['name'] },
  //             { model: RoomType, attributes: ['name'] },
  //           ],
  //           through: { attributes: [] },
  //         },
  //       ],
  //       order: [['createdAt', 'DESC']],
  //     });

  //     if (!bookings) {
  //       throw new CustomError('No bookings found', 404);
  //     }

  //     return bookings.map((booking) => {
  //       const checkIn = new Date(booking.check_in);
  //       const checkOut = new Date(booking.check_out);
  //       const checkInNepal = new Date(checkIn.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
  //       const checkOutNepal = new Date(checkOut.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
  //       const checkInDateOnly = new Date(checkInNepal.getFullYear(), checkInNepal.getMonth(), checkInNepal.getDate());
  //       const checkOutDateOnly = new Date(checkOutNepal.getFullYear(), checkOutNepal.getMonth(), checkOutNepal.getDate());
  //       const duration = (checkOutDateOnly.getTime() - checkInDateOnly.getTime()) / (1000 * 3600 * 24);
  //       const totalPrice = booking.rooms.reduce((sum, room) => sum + ((room.rate || 0) * duration), 0);

  //       return {
  //         id: booking.id,
  //         customer_id: booking.customer_id,
  //         rooms: booking.rooms,
  //         check_in: booking.check_in,
  //         check_out: booking.check_out,
  //         duration,
  //         totalPrice,
  //         status: booking.status as BOOKING_STATUS,
  //         rate: booking.rate,
  //         pax: booking.pax,
  //         payment_mode: booking.payment_mode as PAYMENT_MODE,
  //         createdAt: booking.createdAt,
  //         updatedAt: booking.updatedAt,
  //         customer: booking.customer,
  //       };
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     if (error instanceof CustomError) {
  //       throw error;
  //     }
  //     throw new CustomError('Failed to fetch bookings', 500);
  //   }
  // }

  // Update rate manually
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<{ data: any[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const { count, rows: bookings } = await Booking.findAndCountAll({
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
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      if (!bookings || bookings.length === 0) {
        throw new CustomError('No bookings found', 404);
      }

      const formattedBookings = bookings.map((booking) => {
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

      return { data: formattedBookings, total: count };
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to fetch bookings', 500);
    }
  }



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

  async addAdditionalCharge(bookingId: number, description: string, amount: number, isFood: boolean): Promise<AdditionalCharge> {
    try {
      const booking = await Booking.findByPk(bookingId);
      if (!booking) {
        throw new CustomError('Booking not found', 404);
      }

      // Ensure the booking is in the "Check-in" state
      if (booking.status !== BOOKING_STATUS.CHECKED_IN) {
        throw new CustomError('Additional charges can only be added during the Check-in state', 400);
      }

      // Create the additional charge
      const additionalCharge = await AdditionalCharge.create({
        booking_id: bookingId,
        description,
        amount,
        isFood,
      });

      return additionalCharge;
    } catch (error) {
      console.log(error);

      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to add additional charge', 500);
    }
  }

  async generateBill(bookingId: number, totalAmount: number, discount: number = 0, extraCharge: number = 0, remarks: string = ''): Promise<Billing> {
    try {
      const booking = await Booking.findByPk(bookingId);
      if (!booking) {
        throw new CustomError('Booking not found', 404);
      }

      if (booking.status !== BOOKING_STATUS.CHECKED_OUT) {
        throw new CustomError('Needs to be Checked out before generating bill', 400);
      }

      // Fetch all additional charges for this booking
      const additionalCharges = await AdditionalCharge.findAll({
        where: { booking_id: bookingId },
      });

      // Calculate the total additional charges
      const totalAdditionalCharges = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);

      // Calculate the final amount
      const finalAmount = totalAmount + totalAdditionalCharges - discount + extraCharge;

      // Create the billing record
      const billing = await Billing.create({
        booking_id: bookingId,
        total_amount: totalAmount + totalAdditionalCharges,
        discount,
        extra_charge: extraCharge,
        final_amount: finalAmount,
        remarks,
        billing_date: new Date(),
        booking
      });

      // Update booking status to COMPLETED
      booking.status = BOOKING_STATUS.COMPLETED;
      await booking.save();
      try {
        await Booking.sequelize.query(`
        UPDATE rooms r
        JOIN booking_rooms br ON r.id = br.room_id
        SET r.status = :status
        WHERE br.booking_id = :bookingId
      `, {
          replacements: {
            status: ROOM_STATUS.AVAILABLE,
            bookingId: bookingId
          },
        });
      }
      catch (error) {
        throw new CustomError('Failed to update room status to AVAILABLE', 500);
      }

      return billing;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to generate bill', 500);
    }
  }

  async searchBookings(query: string, page: number = 1, limit: number = 10): Promise<{ data: any[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const { count, rows: bookings } = await Booking.findAndCountAll({
        include: [
          {
            model: Customer,
            attributes: ['id', 'firstname', 'lastname', 'email', 'contact'],
            where: {
              [Op.or]: [
                { firstname: { [Op.like]: `%${query}%` } },
                { lastname: { [Op.like]: `%${query}%` } },
                { email: { [Op.like]: `%${query}%` } },
              ],
            },
          },
          {
            model: Room,
            include: [
              { model: Floor, attributes: ['name'] },
              { model: RoomType, attributes: ['name'] },
            ],
            through: { attributes: [] },
          },
          {
            model: AdditionalCharge,
            attributes: ['amount']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      if (!bookings || bookings.length === 0) {
        throw new CustomError('No bookings found', 404);
      }

      const formattedBookings = bookings.map(async (booking) => {
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const checkInNepal = new Date(checkIn.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
        const checkOutNepal = new Date(checkOut.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
        const checkInDateOnly = new Date(checkInNepal.getFullYear(), checkInNepal.getMonth(), checkInNepal.getDate());
        const checkOutDateOnly = new Date(checkOutNepal.getFullYear(), checkOutNepal.getMonth(), checkOutNepal.getDate());
        const duration = (checkOutDateOnly.getTime() - checkInDateOnly.getTime()) / (1000 * 3600 * 24);
        const totalPrice = booking.rooms.reduce((sum, room) => sum + ((room.rate || 0) * duration), 0);

        const roomTypes = await RoomType.findAll({
          where: { id: booking.requested_roomType }
        });

        // Calculate total additional charges
        const totalAdditionalCharges = booking.additionalCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);

        return {
          id: booking.id,
          customer_id: booking.customer_id,
          rooms: booking.rooms,
          check_in: booking.check_in,
          check_out: booking.check_out,
          requested_roomType: roomTypes.map(rt => rt.name),
          duration,
          totalPrice,
          status: booking.status as BOOKING_STATUS,
          additionalCharges: totalAdditionalCharges,
          rate: booking.rate,
          pax: booking.pax,
          payment_mode: booking.payment_mode as PAYMENT_MODE,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          customer: booking.customer,
        };
      });

      const resolvedBookings = await Promise.all(formattedBookings);
      return { data: resolvedBookings, total: count };
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to search bookings', 500);
    }
  }

  async getRoomAvailability(year: number, month: number): Promise<any[]> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month

      const rooms = await Room.findAll({
        include: [
          { model: RoomType, attributes: ['name'] },
          { model: Floor, attributes: ['name'] },
          {
            model: Booking,
            required: false,
            where: {
              [Op.or]: [
                {
                  check_in: { [Op.lte]: endDate },
                  check_out: { [Op.gte]: startDate },
                },
              ],
              status: {
                [Op.notIn]: [
                  BOOKING_STATUS.CANCELLED,
                  BOOKING_STATUS.COMPLETED,
                  BOOKING_STATUS.NO_SHOW,
                ],
              },
            },
            include: [
              { model: Customer, attributes: ['firstname', 'lastname', 'contact'] },
            ],
          },
          {
            model: Maintenance,
            required: false,
            where: {
              [Op.or]: [
                {
                  startDate: { [Op.lte]: endDate },
                  expectedEndDate: { [Op.gte]: startDate },
                },
              ],
            },
          },
        ],
        attributes: ['id', 'name', 'rate'],
      });

      const daysInMonth = new Date(year, month, 0).getDate();
      const roomAvailability = rooms.map(room => {
        const dailyAvailability = Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const currentDay = new Date(year, month - 1, day);

          // Check for existing bookings
          const isBooked = room.bookings?.some(booking => {
            return (currentDay >= booking.check_in && currentDay <= booking.check_out);
          });

          // Check for ongoing maintenance
          const isUnderMaintenance = room.maintenances?.some(maintenance => {
            return (currentDay >= maintenance.startDate && currentDay <= maintenance.expectedEndDate);
          });

          return { day, available: !isBooked && !isUnderMaintenance };
        });

        return {
          id: room.id,
          name: room.name,
          roomType: room.roomType.name,
          floor: room.floor.name,
          rate: room.rate,
          availability: dailyAvailability,
        };
      });

      return roomAvailability;
    } catch (error) {
      console.error('Error fetching room availability:', error);
      throw new CustomError('Failed to fetch room availability', 500);
    }
  }
}

export default new BookingService();