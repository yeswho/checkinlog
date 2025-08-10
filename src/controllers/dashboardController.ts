import { NextFunction, Request, Response } from 'express';
import DashboardService from '../services/dashboardService';

class DashboardController {
  // Keep existing methods that you're not removing
  async getRoomOccupancy(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getRoomOccupancy();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getBookingTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const data = await DashboardService.getBookingTrends(new Date(startDate as string), new Date(endDate as string));
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerDemographics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getCustomerDemographics();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // New methods for dashboard
  async getTodaysSnapshot(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getTodaysSnapshot();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getRoomAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getRoomAvailability();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getUpcomingReservations();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getRecentBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getRecentBookings();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getCancellations(req: Request, res: Response, next: NextFunction) {
    try {
      const { period } = req.query; // 'today' or 'week'
      const data = await DashboardService.getCancellations(period as string);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getNotifications();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();