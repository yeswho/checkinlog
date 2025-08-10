// src/controllers/revenueExportController.ts
import { NextFunction, Request, Response } from 'express';
import { RevenueExportService } from '@services/revenueExportService';
import { CustomError } from '@src/middleware/errorHandler';

export class RevenueExportController {
    static async exportRevenue(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;
            
            if (!startDate || !endDate) {
                throw new CustomError('Both startDate and endDate are required', 400);
            }

            const buffer = await RevenueExportService.exportToExcel(
                new Date(startDate as string),
                new Date(endDate as string)
            );

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=revenue_report_${startDate}_to_${endDate}.xlsx`);
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }
}