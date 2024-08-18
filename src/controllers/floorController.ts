import { FloorService } from '@services/floorService';
import { NextFunction, Request, Response } from 'express';

export class FloorController {
    // Method to get all floors
    getAllFloors = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const floors = await FloorService.getAllFloors();
            res.json(floors);
        } catch (error) {
            next(error);
        }
    };
    // Method to get Floor by ID
    getFloorById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const Floor = await FloorService.getFloorById(id);
            res.json(Floor);
        } catch (error) {
            next(error);
        }
    };
    // Method to add a Floor
    addFloor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newFloor = await FloorService.addFloor(req.body);
            res.status(201).json(newFloor);
        } catch (error) {
            next(error);
        }
    };
    // Method to update a Floor
    updateFloor = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const updatedFloor = await FloorService.updateFloor(id, req.body);
            res.json(updatedFloor);
        } catch (error) {
            next(error);
        }
    };
    // Method to delete a Floor
    deleteFloor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await FloorService.deleteFloor(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
