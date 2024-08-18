import { Floor } from '@src/sequelize/models/floorsModel';
import { UniqueConstraintError } from '@sequelize/core';
import { CustomError } from '@src/middleware/errorHandler';

export class FloorService {
    // Method to get all floors
    static async getAllFloors(): Promise<Floor[]> {
        try {
            const floors = await Floor.findAll();
            return floors;
        } catch (error: any) {
            throw new CustomError(`Error fetching floors: ${error.message}`, 500);
        }
    }
    // Method to get a floor by ID
    static async getFloorById(id: string): Promise<Floor> {
        try {
            const floor = await Floor.findByPk(id);
            if (!floor) {
                throw new CustomError('Floor not found', 404);
            }
            return floor;
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(`Error fetching floor: ${error.message}`, 500);
        }
    }
    // Method to add a floor
    static async addFloor(data: any): Promise<Floor> {
        try {
            const floor = await Floor.create(data);
            return floor;
        } catch (error: any) {
            if (error instanceof UniqueConstraintError) {
                const field = error.fields && Object.keys(error.fields)[0];
                throw new CustomError(`A floor with that ${field} already exists.`, 400);
            } else {
                throw new CustomError(`Error creating floor: ${error.message}`, 500);
            }
        }
    }
    // Method to update a floor
    static async updateFloor(id: string, data: any): Promise<Floor | null> {
        try {
            const floor = await Floor.findByPk(id);
            if (!floor) {
                throw new CustomError('Floor not found', 404);
            }
            await floor.update(data);
            return floor;
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(`Error updating floor: ${error.message}`, 500);
        }
    }
    // Method to delete a floor
    static async deleteFloor(id: string): Promise<boolean> {
        try {
            const floor = await Floor.findByPk(id);
            if (!floor) {
                throw new CustomError('Floor not found', 404);
            }
            await floor.destroy();
            return true;
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(`Error deleting floor: ${error.message}`, 500);
        }
    }
}
