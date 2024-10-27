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
}
