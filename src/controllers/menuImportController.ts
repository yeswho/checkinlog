// src/controllers/menuImportController.ts
import { NextFunction, Request, Response } from 'express';
import { MenuImportService } from '@services/menuImportService';
import { CustomError } from '@src/middleware/errorHandler';

export class MenuImportController {
    static async uploadMenu(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                throw new CustomError('No file uploaded', 400);
            }

            await MenuImportService.processExcel(req.file.buffer);
            res.json({ success: true, message: 'Menu imported successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async downloadTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const buffer = MenuImportService.generateTemplateBuffer();
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=menu_template.xlsx');
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }
}