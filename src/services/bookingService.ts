import { Op, sql } from '@sequelize/core';
import { Room, Customer, Booking } from '@src/sequelize/models';
import { CustomError } from '@src/middleware/errorHandler';
import BaseService from '@src/services/baseService';
class BookingService extends BaseService<Booking> {
  constructor() {
    super(Booking);
  }
  //update rate manually
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
  // all booking in date range
  async getBookingsInDateRange(checkInDate: Date, checkOutDate: Date): Promise<Booking[]> {
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
      });
      return bookings;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to fetch bookings', 500);
    }
  }
  // all booking of a customer
  async getBookingsByCustomerId (id: number) : Promise<Booking[]> {
    try{
      const bookings = await Booking.findAll({
        where: {
          customer_id : id
        }
      })
      return bookings;
    } catch (error) {
      if (error instanceof CustomError){
        throw error
      }
      throw new CustomError('Failed to fetch bookings', 500);
    }
  }
  //get booking details
  async getBookingDetails(bookingId: number): Promise<any> {
    try {
      // Fetch the booking with related room and customer details
      const booking = await Booking.findOne({
        where: { id: bookingId },
        include: [Room, Customer],
      });

      if (!booking) {
        throw new CustomError('Booking not found', 404);
      }
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const duration = (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24); 

      const rate = booking.rate ? booking.rate : booking.room.rate;
      const totalPrice = rate * duration;

      return {
        bookingId: booking.id,
        customer: {
          id: booking.customer.id,
          name: booking.customer.firstname + booking.customer.lastname,
          email: booking.customer.email,
        },
        room: {
          id: booking.room.id,
          floor_id: booking.room.floor_id,
          roomType_id: booking.room.roomType_id,
          rate: rate,
        },
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

// Get customers with highest number of bookings
async getTopCustomersWithHighestBookings(limit: number) { 
  const results = await Booking.findAll({
    attributes: [
      'customer_id',
      [sql`COUNT(customer_id)`, 'booking_count']
    ],
    group: ['customer_id'],
    order: [[sql`booking_count`, 'DESC']],
    limit,
    include: {
      model: Customer,
      attributes: ['id', 'firstname', 'lastname', 'email'],
    }
  });

  return results.map(result => ({
    customerId: result.customer_id,
    name: `${result.customer.firstname} ${result.customer.lastname}`,
    email: result.customer.email,
    bookingCount: result.get('booking_count')
  }));
}


  
}

export default new BookingService();
