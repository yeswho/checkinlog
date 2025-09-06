import BookingService from '@services/bookingService';
import { CustomError } from '@src/middleware/errorHandler';
import { NextFunction, Request, Response } from 'express';

export class BookingController {
  // Get all bookings
  getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
  
      const { data, total } = await BookingService.findAllPaginated(page, limit);
  
      res.json({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  searchBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.query as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
  
      const { data, total } = await BookingService.searchBookings(query, page, limit);
      res.json({ data, total });
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
      console.log(`Received booking data: ${JSON.stringify(req.body)}`); // Debug log
      
      const newBooking = await BookingService.create(req.body);
      res.status(201).json(newBooking);
    } catch (error) {
      next(error);
    }
  };

 sendConfirmationEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipient = req.body;
     const { bookingId } = req.params;
     console.log("ID IS ", bookingId);
     
    
    await BookingService.sendConfirmationEmail(Number(bookingId));
    res.status(200).json({ message: 'Confirmation email sent successfully' });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    }
    else {
      console.error('Email sending error:', error);
      res.status(500).json({ error: 'Failed to send confirmation email' });
    }
  }
};

async updateBookingRooms(req: Request, res: Response) {
  try {
    const { bookingId } = req.params;
    const { roomIds } = req.body;
    
    const updatedBooking = await BookingService.updateRoomsForBooking(
      Number(bookingId),
      roomIds
    );
    
    res.json(updatedBooking);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Room update error:', error);
      res.status(500).json({ error: 'Failed to update booking rooms' });
    }
  }
}

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

  bookingFromWeb = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookingData = req.body;
      console.log(`Received booking data: ${JSON.stringify(bookingData)}`); // Debug log
      
      const newBooking = await BookingService.bookingFromWeb(bookingData);
      res.status(201).json(newBooking);
    } catch (error) {
      next(error);
    }
  }
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
        res.json({
          bookings,
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
    // generate bill for booking
    generateBill = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const { totalAmount, discount, extraCharge, remarks } = req.body;
        const bill = await BookingService.generateBill(Number(id), totalAmount, discount, extraCharge, remarks);
        res.status(200).json({
          status: 'success',
          data: bill
        })
      } catch (error) {
        next(error)
      }
    }
    // add additional booking
    addAdditional = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const { id } = req.params;
          const { description, amount, isFood } = req.body;

          const additionalCharge = await BookingService.addAdditionalCharge(
              Number(id),
              description,
              amount,
              isFood
          );

          res.status(201).json({
              status: 'success',
              data: additionalCharge,
          });
      } catch (error) {
          next(error);
      }
  }

    // Get room availability for a specific month and year
    getRoomAvailability = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { year, month } = req.params;
            const availability = await BookingService.getRoomAvailability(parseInt(year), parseInt(month));
            res.json(availability);
        } catch (error) {
            next(error);
        }
    };
}
