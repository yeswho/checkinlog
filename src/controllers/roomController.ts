import RoomService from '@services/roomService';
import { NextFunction, Request, Response } from 'express';

export class RoomController {
  // Get all rooms
  getAllRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookings = await RoomService.findAll();
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  };
  // Get room by ID
  getRoomById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const booking = await RoomService.findById(Number(id));
      res.json(booking);
    } catch (error) {
      next(error);
    }
  };

  getAvailableRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { checkIn, checkOut } = req.query;

      const availableRooms = await RoomService.getAvailableRooms({
        checkIn: checkIn as string,
        checkOut: checkOut as string
      });

      res.json(availableRooms);
    } catch (error) {
      next(error);
    }
  }
  
  // Add a room
  addRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newRoom = await RoomService.create(req.body);
      res.status(201).json(newRoom);
    } catch (error) {
      next(error);
    }
  };
  // Update a room
  updateRoom = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const updatedRoom = await RoomService.update(Number(id), req.body);
      res.json(updatedRoom);
    } catch (error) {
      next(error);
    }
  };
  // Delete a room
  deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await RoomService.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
  // Get all rooms in floor :id
  getRoomsInFloor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const rooms = await RoomService.getRoomsInFloor(Number(id));
      res.status(200).json({
        status: 'success',
        data: rooms,
      });
    } catch (error) {
      next(error);
    }
  }
  //Get room details for table
  getRoomDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomDetails = await RoomService.getAllRoomDetails();
      res.json(roomDetails);
    } catch (error) {
      next(error);
    }
  }
}
