// src/services/revenueExportService.ts
import { RevenueSummary } from '@src/sequelize/models';
import * as xlsx from 'xlsx';
import { Op } from '@sequelize/core';

export class RevenueExportService {
    static async exportToExcel(startDate: Date, endDate: Date): Promise<Buffer> {
        const revenueData = await RevenueSummary.findAll({
            where: {
                summary_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['summary_date', 'ASC']]
        });

        const formattedData = revenueData.map(item => ({
            Date: item.summary_date,
            'Total Revenue': item.total_revenue,
            'Room Revenue': item.room_revenue,
            'Food Revenue': item.food_revenue,
            'Other Revenue': item.other_revenue,
            'Total Expenses': item.total_expenses,
            'Salary Expenses': item.salary_expenses,
            'Operational Expenses': item.operational_expenses,
            'Net Profit': item.net_profit,
            'Total Bookings': item.total_bookings
        }));

        const worksheet = xlsx.utils.json_to_sheet(formattedData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Revenue Report');

        return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
}