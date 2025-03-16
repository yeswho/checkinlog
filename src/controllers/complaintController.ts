import { NextFunction, Request, Response } from 'express';
import ComplaintService from '@services/complaintService';

export class ComplaintController {
  // Get all complaints
  getAllComplaints = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const complaints = await ComplaintService.findAll();
      res.json(complaints);
    } catch (error) {
      next(error);
    }
  };

  // Get complaint by ID
  getComplaintById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const complaint = await ComplaintService.findById(Number(id));
      res.json(complaint);
    } catch (error) {
      next(error);
    }
  };

  // Add a complaint
  addComplaint = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newComplaint = await ComplaintService.create(req.body);
      res.status(201).json(newComplaint);
    } catch (error) {
      next(error);
    }
  };

  // Update a complaint
  updateComplaint = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const updatedComplaint = await ComplaintService.update(Number(id), req.body);
      res.json(updatedComplaint);
    } catch (error) {
      next(error);
    }
  };

  // Delete a complaint
  deleteComplaint = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      await ComplaintService.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}