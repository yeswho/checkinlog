import FloorService from '@services/floorService';
import { NextFunction, Request, Response } from 'express';

export class FloorController {
    //  get all floors
    getAllFloors = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const floors = await FloorService.findAll();
            res.json(floors);
        } catch (error) {
            next(error);
        }
    };
    //  get Floor by ID
    getFloorById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const Floor = await FloorService.findById(Number(id));
            res.json(Floor);
        } catch (error) {
            next(error);
        }
    };
    //  add a Floor
    addFloor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newFloor = await FloorService.create(req.body);
            res.status(201).json(newFloor);
        } catch (error) {
            next(error);
        }
    };
    //  update a Floor
    updateFloor = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const updatedFloor = await FloorService.update(Number(id), req.body);
            res.json(updatedFloor);
        } catch (error) {
            next(error);
        }
    };
    //  delete a Floor
    deleteFloor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await FloorService.delete(Number(id));
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
