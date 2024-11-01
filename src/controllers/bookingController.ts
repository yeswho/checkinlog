import BookingService from '@services/bookingService';
import { NextFunction, Request, Response } from 'express';

export class BookingController {
  // Get all bookings
  getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookings = await BookingService.findAll();
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  };
  // Get booking by ID
  getBookingById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const booking = await BookingService.findById(Number(id));
      res.json(booking);
    } catch (error) {
      next(error);
    }
  };
  // Add a booking
  addBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newBooking = await BookingService.create(req.body);
      res.status(201).json(newBooking);
    } catch (error) {
      next(error);
    }
  };
  // Update a booking
  updateBooking = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const updatedBooking = await BookingService.update(Number(id), req.body);
      res.json(updatedBooking);
    } catch (error) {
      next(error);
    }
  };
  // Delete a booking
  deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await BookingService.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
  // Find all booking in date range
  getBookingsInDateRange = async (req: Request, res: Response, next: NextFunction) => {
    const { checkInDate, checkOutDate } = req.body;
    try {
      const bookings = await BookingService.getBookingsInDateRange(new Date(checkInDate), new Date(checkOutDate));
      res.status(200).json({
        status: 'success',
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }
    // Find all booking of customer
    getBookingsByCustomerId = async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      try {
        const bookings = await BookingService.getBookingsByCustomerId (Number(id));
        res.status(200).json({
          status: 'success',
          data: bookings,
        });
      } catch (error) {
        next(error);
      }
    }
    // update manually update booking rate
    updateBookingRate = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { bookingId, newRate } = req.body;
        const updatedBooking = await BookingService.updateBookingRate(bookingId, newRate);
        res.status(200).json(updatedBooking);
      } catch (error) {
        next(error);
      }
    };
    // Get all booking details
    getBookingDetails = async (req: Request, res: Response, next: NextFunction) => {
      try{
        const { id } = req.params;
        const details = await BookingService.getBookingDetails(Number(id));
        res.status(200).json({
          status: 'success',
          data: details
        })
      } catch (error){
        next(error)
      }
    }
}
