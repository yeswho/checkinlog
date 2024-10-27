import RoomTypeService from '@services/roomTypeService';
import { NextFunction, Request, Response } from 'express';

export class RoomTypeController {
  // Get all roomTypes
  getAllRoomTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomTypes = await RoomTypeService.findAll();
      res.json(roomTypes);
    } catch (error) {
      next(error);
    }
  };

  // Get roomType by ID
  getRoomTypeById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const roomType = await RoomTypeService.findById(Number(id));
      res.json(roomType);
    } catch (error) {
      next(error);
    }
  };

  // Add a roomType
  addRoomType= async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newRoomType = await RoomTypeService.create(req.body);
      res.status(201).json(newRoomType);
    } catch (error) {
      next(error);
    }
  };

  // Update a roomType
  updateRoomType = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const updatedRoomType = await RoomTypeService.update(Number(id), req.body);
      res.json(updatedRoomType);
    } catch (error) {
      next(error);
    }
  };

  // Delete a roomType
  deleteRoomType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await RoomTypeService.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
