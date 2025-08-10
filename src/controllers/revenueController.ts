import { NextFunction, Request, Response } from 'express';
import RevenueService from '@services/revenueService';
import { CustomError } from '@src/middleware/errorHandler';

export class RevenueController {
    // Generate daily revenue summary
    generateDailySummary = async (req: Request, res: Response, next: NextFunction) => {
        const { date } = req.body;
        
        if (!date) {
            throw new CustomError('Date parameter is required', 400);
        }

        try {
            const summary = await RevenueService.generateDailySummary(new Date(date as string));
            res.json(summary);
        } catch (error) {
            next(error);
        }
    };

    getRevenueData = async (req: Request, res: Response, next: NextFunction) => {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            throw new CustomError('Both startDate and endDate parameters are required', 400);
        }

        try {
            const data = await RevenueService.getRevenueData(
                new Date(startDate as string),
                new Date(endDate as string)
            );
            res.json(data);
        } catch (error) {
            next(error);
        }
    };

    // Get monthly revenue breakdown for a specific year
    getMonthlyRevenue = async (req: Request, res: Response, next: NextFunction) => {
        const { year } = req.params;

        if (!year || isNaN(Number(year))) {
            throw new CustomError('Valid year parameter is required', 400);
        }

        try {
            const data = await RevenueService.getMonthlyRevenue(Number(year));
            res.json(data);
        } catch (error) {
            next(error);
        }
    };

    // Get year-over-year comparison
    getYearOverYearComparison = async (req: Request, res: Response, next: NextFunction) => {
        const { years } = req.query;

        if (!years) {
            throw new CustomError('Years parameter is required (comma-separated)', 400);
        }

        try {
            const yearArray = (years as string).split(',').map(y => parseInt(y.trim()));
            const data = await RevenueService.getYearOverYearComparison(yearArray);
            res.json(data);
        } catch (error) {
            next(error);
        }
    };

    // Get revenue KPIs for a date range
    getKPIs = async (req: Request, res: Response, next: NextFunction) => {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            throw new CustomError('Both startDate and endDate parameters are required', 400);
        }

        try {
            const kpis = await RevenueService.getKPIs(
                new Date(startDate as string),
                new Date(endDate as string)
            );
            res.json(kpis);
        } catch (error) {
            next(error);
        }
    };

    // Get detailed daily summary
    getDailySummary = async (req: Request, res: Response, next: NextFunction) => {
        const { date } = req.query;
        console.log("DATE IS,", date);
        
        if (!date) {
            throw new CustomError('Date parameter is required', 400);
        }

        try {
            const summary = await RevenueService.getDailySummary(new Date(date as string));
            res.json(summary);
        } catch (error) {
            console.log("ERROR IS FROM HERE 1,", error);
            
            next(error);
        }
    };

    // Get date range data with totals
    getDateRangeData = async (req: Request, res: Response, next: NextFunction) => {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            throw new CustomError('Both startDate and endDate parameters are required', 400);
        }

        try {
            const data = await RevenueService.getDateRangeData(
                new Date(startDate as string),
                new Date(endDate as string)
            );
            res.json(data);
        } catch (error) {
            next(error);
        }
    };

    // Get monthly breakdown for a year
    getMonthlyBreakdown = async (req: Request, res: Response, next: NextFunction) => {
        const { year } = req.params;

        if (!year || isNaN(Number(year))) {
            throw new CustomError('Valid year parameter is required', 400);
        }

        try {
            const breakdown = await RevenueService.getMonthlyBreakdown(Number(year));
            res.json(breakdown);
        } catch (error) {
            next(error);
        }
    };

    getCurrentMonthRevenue = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const revenue = await RevenueService.getCurrentMonthRevenue();
            res.json(revenue);
        } catch (error) {
            next(error);
        }
    };
}

export default new RevenueController();