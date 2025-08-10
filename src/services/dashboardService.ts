import { QueryTypes } from '@sequelize/core';
import { Room } from '@models/roomsModel';
import { Booking } from '@src/sequelize/models';
import { RoomType } from '@src/sequelize/models/roomTypesModel';
import { Customer } from '@src/sequelize/models/customerModel';
import { CustomError } from '../middleware/errorHandler';

class DashboardService {
    // Keep existing methods that you're not removing
    static async getRoomOccupancy() {
        try {
            return await Room.sequelize.query(`
        SELECT 
          rt.name as roomType,
          COUNT(CASE WHEN r.status = 'OCCUPIED' THEN 1 END) as occupied,
          COUNT(CASE WHEN r.status = 'AVAILABLE' THEN 1 END) as available,
          COUNT(CASE WHEN r.status = 'MAINTENANCE' THEN 1 END) as maintenance
        FROM rooms r
        JOIN RoomType rt ON r.roomType_id = rt.id
        GROUP BY rt.name
      `, { type: QueryTypes.SELECT });
        } catch (error) {
            throw new CustomError('Failed to fetch room occupancy', 500);
        }
    }

    static async getBookingTrends(startDate: Date, endDate: Date) {
        try {
            return await Booking.sequelize.query(`
        SELECT 
          DATE(check_in) as date,
          COUNT(*) as bookings
        FROM bookings
        WHERE check_in BETWEEN :startDate AND :endDate
        GROUP BY DATE(check_in)
        ORDER BY date
      `, {
                replacements: { startDate, endDate },
                type: QueryTypes.SELECT
            });
        } catch (error) {
            throw new CustomError('Failed to fetch booking trends', 500);
        }
    }

    static async getCustomerDemographics() {
        try {
            return await Booking.sequelize.query(`
        SELECT 
          CASE
            WHEN TIMESTAMPDIFF(YEAR, c.dateofbirth, CURDATE()) BETWEEN 18 AND 24 THEN '18-24'
            WHEN TIMESTAMPDIFF(YEAR, c.dateofbirth, CURDATE()) BETWEEN 25 AND 34 THEN '25-34'
            WHEN TIMESTAMPDIFF(YEAR, c.dateofbirth, CURDATE()) BETWEEN 35 AND 44 THEN '35-44'
            WHEN TIMESTAMPDIFF(YEAR, c.dateofbirth, CURDATE()) BETWEEN 45 AND 54 THEN '45-54'
            ELSE '55+'
          END as ageGroup,
          COUNT(*) as count
        FROM bookings b
        JOIN Customers c ON b.customer_id = c.id
        GROUP BY ageGroup
        ORDER BY ageGroup
      `, { type: QueryTypes.SELECT });
        } catch (error) {
            throw new CustomError('Failed to fetch customer demographics', 500);
        }
    }

    // New methods for dashboard
    static async getTodaysSnapshot() {
        try {
            // Define Nepal "today" and "tomorrow" boundaries in UTC
            const nepalOffsetMs = 5.75 * 60 * 60 * 1000; // +05:45
            const now = new Date();
            const todayNepal = new Date(now.getTime());
            todayNepal.setUTCHours(0, 0, 0, 0);
            const todayUTC = new Date(todayNepal.getTime() - nepalOffsetMs);
            const tomorrowUTC = new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000);

            const [checkIns, checkOuts, roomStats, arrivals, departures] = await Promise.all([
                // Check-ins today (Nepal Time in UTC range)
                Booking.sequelize.query<{ count: number }>(`
                SELECT COUNT(*) AS count
                FROM bookings
                WHERE check_in >= :todayUTC
                  AND check_in < :tomorrowUTC
                  AND status = 'Checked in';
            `, {
                    type: QueryTypes.SELECT,
                    replacements: { todayUTC, tomorrowUTC }
                }),

                // Check-outs today (Nepal Time in UTC range)
                Booking.sequelize.query<{ count: number }>(`
                SELECT COUNT(*) AS count
                FROM bookings
                WHERE check_out >= :todayUTC
                  AND check_out < :tomorrowUTC
                  AND status = 'Checked in';
            `, {
                    type: QueryTypes.SELECT,
                    replacements: { todayUTC, tomorrowUTC }
                }),

                // Room statistics
                Room.sequelize.query<{ totalRooms: number; occupiedRooms: number }>(`
                SELECT 
                  COUNT(*) AS totalRooms,
                  SUM(CASE WHEN status = 'OCCUPIED' THEN 1 ELSE 0 END) AS occupiedRooms
                FROM rooms;
            `, { type: QueryTypes.SELECT }),

                // Expected arrivals today (Nepal Time)
                Booking.sequelize.query<{ count: number }>(`
                SELECT COUNT(*) AS count
                FROM bookings
                WHERE check_in >= :todayUTC
                  AND check_in < :tomorrowUTC
                  AND status = 'Booked';
            `, {
                    type: QueryTypes.SELECT,
                    replacements: { todayUTC, tomorrowUTC }
                }),

                // Expected departures today (Nepal Time)
                Booking.sequelize.query<{ count: number }>(`
                SELECT COUNT(*) AS count
                FROM bookings
                WHERE check_out >= :todayUTC
                  AND check_out < :tomorrowUTC
                  AND status = 'Checked in';
            `, {
                    type: QueryTypes.SELECT,
                    replacements: { todayUTC, tomorrowUTC }
                }),
            ]);

            return {
                checkInsToday: checkIns[0].count,
                checkOutsToday: checkOuts[0].count,
                occupancyRate: roomStats[0].occupiedRooms / roomStats[0].totalRooms * 100,
                expectedArrivals: arrivals[0].count,
                expectedDepartures: departures[0].count
            };
        } catch (error) {
            throw new CustomError('Failed to fetch today\'s snapshot', 500);
        }
    }


    static async getRoomAvailability() {
        try {
            return await Room.sequelize.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM rooms
        GROUP BY status
      `, { type: QueryTypes.SELECT });
        } catch (error) {
            throw new CustomError('Failed to fetch room availability', 500);
        }
    }

    static async getUpcomingReservations() {
        try {
            return await Booking.sequelize.query(`
        SELECT 
          b.id,
          c.firstname as guestName,
          rt.name as roomType,
          b.check_in,
          b.check_out,
          b.status
        FROM bookings b
        JOIN Customers c ON b.customer_id = c.id
        JOIN booking_rooms br ON b.id = br.booking_id
        JOIN rooms r ON br.room_id = r.id
        JOIN RoomType rt ON r.roomType_id = rt.id
        WHERE b.check_in BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
          AND b.status = 'Booked'
        ORDER BY b.check_in
        LIMIT 10
      `, { type: QueryTypes.SELECT });
        } catch (error) {
            console.log("ERROR IS :", error);
            throw new CustomError('Failed to fetch upcoming reservations', 500);
        }
    }

    static async getRecentBookings() {
        try {
            return await Booking.sequelize.query(`
        SELECT 
          b.id,
          c.firstname as guestName,
          GROUP_CONCAT(DISTINCT rt.name) as roomTypes,
          b.check_in,
          b.check_out,
          b.status,
          b.createdAt
        FROM bookings b
        JOIN Customers c ON b.customer_id = c.id
        JOIN booking_rooms br ON b.id = br.booking_id
        JOIN rooms r ON br.room_id = r.id
        JOIN RoomType rt ON r.roomType_id = rt.id
        WHERE b.status IN ('Booked', 'Checked in')
        GROUP BY b.id
        ORDER BY b.createdAt DESC
        LIMIT 10
      `, { type: QueryTypes.SELECT });
        } catch (error) {
            throw new CustomError('Failed to fetch recent bookings', 500);
        }
    }

    static async getCancellations(period: string = 'today') {
        try {
            const whereClause = period === 'today'
                ? 'DATE(cancelled_at) = CURDATE()'
                : 'cancelled_at BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE()';

            return await Booking.sequelize.query(`
        SELECT 
          b.id,
          c.firstname as guestName,
          b.check_in,
          b.check_out,
          b.cancelled_at,
          b.cancellation_reason
        FROM bookings b
        JOIN Customers c ON b.customer_id = c.id
        WHERE b.status = 'Cancelled'
          AND ${whereClause}
        ORDER BY b.cancelled_at DESC
      `, { type: QueryTypes.SELECT });
        } catch (error) {
            throw new CustomError('Failed to fetch cancellations', 500);
        }
    }

    static async getNotifications() {
        try {
            const [checkInAlerts, checkOutAlerts, sources, unpaidBills] = await Promise.all([
                // Upcoming check-ins (next 24 hours)
                Booking.sequelize.query(`
          SELECT 
            b.id,
            c.firstname as guestName,
            b.check_in,
            rt.name as roomType
          FROM bookings b
          JOIN Customers c ON b.customer_id = c.id
          JOIN booking_rooms br ON b.id = br.booking_id
          JOIN rooms r ON br.room_id = r.id
          JOIN RoomType rt ON r.roomType_id = rt.id
          WHERE b.check_in BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
            AND b.status = 'Booked'
          ORDER BY b.check_in
        `, { type: QueryTypes.SELECT }),

                // Upcoming check-outs (next 24 hours)
                Booking.sequelize.query(`
          SELECT 
            b.id,
            c.firstname as guestName,
            b.check_out,
            rt.name as roomType
          FROM bookings b
          JOIN Customers c ON b.customer_id = c.id
          JOIN booking_rooms br ON b.id = br.booking_id
          JOIN rooms r ON br.room_id = r.id
          JOIN RoomType rt ON r.roomType_id = rt.id
          WHERE b.check_out BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
            AND b.status = 'Checked in'
          ORDER BY b.check_out
        `, { type: QueryTypes.SELECT }),

                // Special requests
                Booking.sequelize.query(`
                SELECT 
                    b.id,
                    c.firstname as guestName,
                    b.source
                FROM bookings b
                JOIN Customers c ON b.customer_id = c.id
                WHERE b.source IS NOT NULL
                    AND b.source != ''
                    AND b.status IN ('BOOKED', 'CHECKED_IN')
                ORDER BY b.check_in
            `, { type: QueryTypes.SELECT }),

                // Unpaid bills (simplified example)
                Booking.sequelize.query(`
          SELECT 
            b.id,
            c.firstname as guestName,
            b.rate as amountDue
          FROM bookings b
          JOIN Customers c ON b.customer_id = c.id
          WHERE b.status IN ('Checked in')
          ORDER BY b.check_out
        `, { type: QueryTypes.SELECT })
            ]);

            return {
                checkInAlerts,
                checkOutAlerts,
                sources,
                unpaidBills
            };
        } catch (error) {
            console.log("ERROR IS :", error);
            throw new CustomError('Failed to fetch notifications', 500);
        }
    }
}

export default DashboardService;