import { col, fn, Op, where } from '@sequelize/core';
import { Billing } from '@src/sequelize/models/billings';
import { AdditionalCharge } from '@src/sequelize/models/additionalCharge';
import { Expense } from '@src/sequelize/models/expenses';
import { Salary } from '@src/sequelize/models/salary';
import { RevenueSummary } from '@src/sequelize/models/revenueSummary';
import BaseService from '@src/services/baseService';
import { Booking, BookingRoom, Room } from '@src/sequelize/models';
import { BOOKING_STATUS, EXPENSE_CATEGORY, ROOM_STATUS } from '@src/enums/database';
import { toNepaliStartOfDayUTC, toNepaliEndOfDayUTC } from '@src/utils/common';

class RevenueService extends BaseService<RevenueSummary> {
    constructor() {
        super(RevenueSummary);
    }

    // Generate daily revenue summary (should be called once per day via cron job)
    async generateDailySummary(date: Date): Promise<RevenueSummary> {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Check if summary already exists
            const existingSummary = await RevenueSummary.findOne({
                where: {
                    summary_date: date
                }
            });

            if (existingSummary) {
                return existingSummary;
            }

            // Calculate revenues
            const { roomRevenue, foodRevenue, otherRevenue } = await this.calculateRevenues(startOfDay, endOfDay);
            const totalRevenue = roomRevenue + foodRevenue + otherRevenue;

            // Calculate expenses
            const { salaryExpenses, operationalExpenses } = await this.calculateExpenses(startOfDay, endOfDay);
            const totalExpenses = salaryExpenses + operationalExpenses;

            // Count bookings
            const totalBookings = await Billing.count({
                where: {
                    billing_date: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
            });

            // Create summary
            const summary = await RevenueSummary.create({
                summary_date: date,
                total_revenue: totalRevenue,
                room_revenue: roomRevenue,
                food_revenue: foodRevenue,
                other_revenue: otherRevenue,
                total_expenses: totalExpenses,
                salary_expenses: salaryExpenses,
                operational_expenses: operationalExpenses,
                net_profit: totalRevenue - totalExpenses,
                total_bookings: totalBookings
            });

            return summary;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to generate daily summary: ${error.message}`);
            } else {
                throw new Error('Failed to generate daily summary: Unknown error');
            }
        }
    }

    // Get revenue data for a date range (reads existing summaries)
    async getRevenueData(startDate: Date, endDate: Date) {
        try {
            // Normalize dates to start and end of day
            const normalizedStart = new Date(startDate);
            normalizedStart.setHours(0, 0, 0, 0);

            const normalizedEnd = new Date(endDate);
            normalizedEnd.setHours(23, 59, 59, 999);

            const summaries = await RevenueSummary.findAll({
                where: {
                    summary_date: {
                        [Op.between]: [normalizedStart, normalizedEnd]
                    }
                },
                order: [['summary_date', 'ASC']]
            });

            return summaries;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get revenue data: ${error.message}`);
            } else {
                throw new Error('Failed to get revenue data: Unknown error');
            }
        }
    }

    // Get daily summary (reads existing or creates if missing)
    async getDailySummary(date: Date) {
        // Normalize date
        const dateOnly = date.toISOString().split('T')[0]; // e.g., "2025-07-19"

        // Try to get existing summary
        let summary = await RevenueSummary.findOne({
            where: where(fn('DATE', col('summary_date')), dateOnly)
        });

        if (!summary) {
            throw new Error(`No revenue summary found for date: ${dateOnly}`);
        }

        // If summary doesn't exist, generate it
        // if (!summary) {
        //     summary = await this.generateDailySummary(normalizedDate);
        // }

        if (!summary) {
            throw new Error(`No revenue summary found for date: ${dateOnly}`);
        }

        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const occupancyRate = await this.calculateOccupancyRateToday(normalizedDate);
        const availableRoomNights = await this.getAvailableRoomNights(normalizedDate, normalizedDate);

        return {
            date: summary.summary_date,
            revenues: {
                total: summary.total_revenue,
                breakdown: {
                    room: summary.room_revenue,
                    food: summary.food_revenue,
                    other: summary.other_revenue
                }
            },
            expenses: {
                total: summary.total_expenses,
                breakdown: {
                    salary: summary.salary_expenses,
                    operational: summary.operational_expenses
                }
            },
            profit: summary.net_profit,
            bookings: summary.total_bookings,
            occupancyRate,
            revPAR: availableRoomNights > 0 ? summary.total_revenue / availableRoomNights : 0
        };
    }

    async calculateOccupancyRateToday(normalizedDate: Date): Promise<number> {
        // Ensure the date has no time component
        const today = new Date(normalizedDate);
        today.setHours(0, 0, 0, 0);

        // Get next day for check-out comparison
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Count how many bookings are active today
        const bookedRoomsToday = await Booking.count({
            where: {
                check_in: { [Op.lt]: tomorrow },
                check_out: { [Op.gt]: today },
                status: {
                    [Op.or]: [
                        BOOKING_STATUS.BOOKED,
                        BOOKING_STATUS.CHECKED_IN,
                    ]
                }
            }
        });

        // Get total number of available rooms
        const totalRooms = await Room.count();

        if (totalRooms === 0) return 0;

        // Calculate occupancy rate
        const occupancyRate = (bookedRoomsToday / totalRooms) * 100;

        return Number(occupancyRate.toFixed(2));
    }

    // Private helper methods remain the same
    private async calculateRevenues(startDate: Date, endDate: Date) {

        console.log("Start date Revenue:", startDate);
        console.log("End date Revenue:", endDate);
        // Get all billings in date range
        const billings = await Billing.findAll({
            where: {
                billing_date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        // Get all additional charges in date range
        const additionalCharges = await AdditionalCharge.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        // Calculate room revenue (from billings)
        const roomRevenue = billings.reduce((sum, billing) => sum + billing.final_amount, 0);

        // Calculate food and other revenue from additional charges
        let foodRevenue = 0;
        let otherRevenue = 0;

        additionalCharges.forEach(charge => {
            if (charge.isFood) {
                foodRevenue += charge.amount;
            } else {
                otherRevenue += charge.amount;
            }
        });

        return { roomRevenue, foodRevenue, otherRevenue };
    }

    private async calculateExpenses(startDate: Date, endDate: Date) {
        // Get all salaries in date range
        const salaries = await Salary.findAll({
            where: {
                salary_date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        console.log("Expense date is,", startDate, endDate);
        console.log("Salaries:", salaries);


        // Get all expenses in date range (excluding salaries)
        const expenses = await Expense.findAll({
            where: {
                updatedAt: {
                    [Op.between]: [startDate, endDate]
                },
                category: {
                    [Op.not]: EXPENSE_CATEGORY.SALARY
                }
            }
        });

        console.log("Expenses:", expenses);

        // Calculate salary expenses
        const salaryExpenses = salaries.reduce((sum, salary) => sum + salary.total_salary, 0);

        // Calculate operational expenses
        const operationalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        return { salaryExpenses, operationalExpenses };
    }

    private async calculateOccupancyRate(startDate: Date, endDate: Date) {
        // Create new Date objects to avoid mutation
        const start = new Date(startDate);
        const end = new Date(endDate);

        console.log("Start date occ:", start);
        console.log("End date occ:", end);

        const totalRoomNights = await this.getAvailableRoomNights(start, end);
        console.log("Total room nights:", totalRoomNights);

        if (totalRoomNights === 0) return 0;

        const bookedRoomNights = await Booking.count({
            where: {
                check_in: { [Op.lte]: end },
                check_out: { [Op.gte]: start },
                status: { [Op.or]: [BOOKING_STATUS.BOOKED, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.CHECKED_OUT, BOOKING_STATUS.COMPLETED] }
            }
        });

        return bookedRoomNights / totalRoomNights;
    }

    private async getAvailableRoomNights(startDate: Date, endDate: Date) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const utcStart = toNepaliStartOfDayUTC(start);
        const utcEnd = toNepaliEndOfDayUTC(end);

        // Calculate days difference properly
        const days = Math.floor((utcEnd.getTime() - utcStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const totalRooms = await Room.count({ where: { status: ROOM_STATUS.AVAILABLE } });
        console.log("Total rooms:", totalRooms);
        console.log("Days:", days);
        console.log("Total room nights inside function:", totalRooms * days);

        return totalRooms * days;
    }


    async getDateRangeData(startDate: Date, endDate: Date) {
        const summaries = await this.getRevenueData(startDate, endDate);

        const data = await Promise.all(summaries.map(async summary => ({
            date: summary.summary_date,
            revenues: {
                total: summary.total_revenue,
                room: summary.room_revenue,
                food: summary.food_revenue,
                other: summary.other_revenue
            },
            expenses: {
                total: summary.total_expenses,
                salary: summary.salary_expenses,
                operational: summary.operational_expenses
            },
            profit: summary.net_profit,
            bookings: summary.total_bookings
        })));

        const totals = data.reduce((acc, day) => ({
            revenue: acc.revenue + day.revenues.total,
            expenses: acc.expenses + day.expenses.total,
            profit: acc.profit + day.profit,
            bookings: acc.bookings + day.bookings
        }), { revenue: 0, expenses: 0, profit: 0, bookings: 0 });

        return {
            startDate,
            endDate,
            data,
            totals: {
                ...totals,
                averageDailyRevenue: data.length > 0 ? totals.revenue / data.length : 0,
                averageOccupancy: await this.calculateOccupancyRate(startDate, endDate)
            }
        };
    }

    async getMonthlyRevenue(year: number) {
        try {
            const results = await RevenueSummary.findAll({
                attributes: [
                    [RevenueSummary.sequelize.fn('MONTH', RevenueSummary.sequelize.col('summary_date')), 'month'],
                    [RevenueSummary.sequelize.fn('SUM', RevenueSummary.sequelize.col('total_revenue')), 'total_revenue'],
                    [RevenueSummary.sequelize.fn('SUM', RevenueSummary.sequelize.col('room_revenue')), 'room_revenue'],
                    [RevenueSummary.sequelize.fn('SUM', RevenueSummary.sequelize.col('food_revenue')), 'food_revenue'],
                    [RevenueSummary.sequelize.fn('SUM', RevenueSummary.sequelize.col('other_revenue')), 'other_revenue'],
                    [RevenueSummary.sequelize.fn('SUM', RevenueSummary.sequelize.col('total_expenses')), 'total_expenses'],
                    [RevenueSummary.sequelize.fn('SUM', RevenueSummary.sequelize.col('net_profit')), 'net_profit'],
                ],
                where: RevenueSummary.sequelize.where(RevenueSummary.sequelize.fn('YEAR', RevenueSummary.sequelize.col('summary_date')), year),
                group: [RevenueSummary.sequelize.fn('MONTH', RevenueSummary.sequelize.col('summary_date'))],
                order: [RevenueSummary.sequelize.fn('MONTH', RevenueSummary.sequelize.col('summary_date'))]
            });

            return results;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get monthly revenue: ${error.message}`);
            } else {
                throw new Error('Failed to get monthly revenue: Unknown error');
            }
        }
    }

    async getMonthlyBreakdown(year: number) {
        const results = await this.getMonthlyRevenue(year);
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        const months = results.map(result => ({
            month: result.month,
            monthName: monthNames[result.month - 1],
            revenue: result.total_revenue,
            expenses: result.total_expenses,
            profit: result.net_profit,
            breakdown: {
                room: result.room_revenue,
                food: result.food_revenue,
                other: result.other_revenue
            }
        }));

        const annualTotals = months.reduce((acc, month) => ({
            revenue: acc.revenue + month.revenue,
            expenses: acc.expenses + month.expenses,
            profit: acc.profit + month.profit
        }), { revenue: 0, expenses: 0, profit: 0 });

        return {
            year,
            months,
            annualTotals
        };
    }

    async getCurrentMonthRevenue() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        const monthlyData = await this.getMonthlyRevenue(currentYear);
        const monthlyDataPlain = monthlyData.map(m => m.get({ plain: true }));

        const currentMonthData = monthlyDataPlain.find(m => m.month === currentMonth);

        return {
            month: currentMonth,
            year: currentYear,
            totalRevenue: currentMonthData?.total_revenue || 0,
            breakdown: {
                room: currentMonthData?.room_revenue || 0,
                food: currentMonthData?.food_revenue || 0,
                other: currentMonthData?.other_revenue || 0
            }
        };
    }


    async getYearOverYearComparison(years: number[]) {
        try {
            const results = await Promise.all(years.map(async year => {
                const data = await this.getMonthlyRevenue(year);
                return { year, data };
            }));

            return results;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get year-over-year comparison: ${error.message}`);
            } else {
                throw new Error('Failed to get year-over-year comparison: Unknown error');
            }
        }
    }

    async getKPIs(startDate: Date, endDate: Date) {
        try {
            const summaries = await this.getRevenueData(startDate, endDate);

            if (summaries.length === 0) {
                return null;
            }

            const totalRevenue = summaries.reduce((sum, s) => sum + s.total_revenue, 0);
            const totalExpenses = summaries.reduce((sum, s) => sum + s.total_expenses, 0);
            const netProfit = totalRevenue - totalExpenses;
            const avgDailyRevenue = totalRevenue / summaries.length;
            const occupancyRate = await this.calculateOccupancyRate(startDate, endDate);
            const availableRoomNights = await this.getAvailableRoomNights(startDate, endDate);

            return {
                totalRevenue,
                totalExpenses,
                netProfit,
                avgDailyRevenue,
                occupancyRate,
                revenuePerAvailableRoom: availableRoomNights > 0 ? totalRevenue / availableRoomNights : 0
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to calculate KPIs: ${error.message}`);
            } else {
                throw new Error('Failed to calculate KPIs: Unknown error');
            }
        }
    }
}

export default new RevenueService();