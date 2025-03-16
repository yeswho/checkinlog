import MaintenanceService from '@services/maintenanceService';
import { NextFunction, Request, Response } from 'express';

export class MaintenanceController {
  // Get all maintenance records
  getAllMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const maintenanceRecords = await MaintenanceService.getAllMaintenanceDetails();
      res.json(maintenanceRecords);
    } catch (error) {
      next(error);
    }
  };

  // Get maintenance record by ID
  getMaintenanceById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const maintenance = await MaintenanceService.findById(Number(id));
      res.json(maintenance);
    } catch (error) {
      next(error);
    }
  };

  // Add a maintenance record
  addMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newMaintenance = await MaintenanceService.createMaintenanceRecord(req.body);
      res.status(201).json(newMaintenance);
    } catch (error) {
      next(error);
    }
  };

  // Update a maintenance record
  updateMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const updatedMaintenance = await MaintenanceService.updateMaintenanceByRoomId(Number(id), req.body);
      res.json(updatedMaintenance);
    } catch (error) {
      next(error);
    }
  };

  // Delete a maintenance record
  deleteMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      await MaintenanceService.deleteMaintenanceRecord(Number(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}