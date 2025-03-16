// Billing service

import { BOOKING_STATUS, TAX_RATES } from '@src/enums/database';
import { CustomError } from '@src/middleware/errorHandler';
import { Floor, RoomType } from '@src/sequelize/models';
import { Billing } from '@src/sequelize/models/billings';
import { Booking } from '@src/sequelize/models/bookingsModel';
import { Customer } from '@src/sequelize/models/customerModel';
import { Room } from '@src/sequelize/models/roomsModel';
import BaseService from '@src/services/baseService';

class BillingService extends BaseService<Billing> {
    constructor() {
        super(Billing);
    }

    async getPrintableBill(bookingId: number): Promise<any> {
        try {
            const booking = await Booking.findOne({
                where: { id: bookingId },
                include: [
                    {
                        model: Customer,
                        attributes: ['id', 'firstname', 'lastname', 'email', 'contact'],
                    },
                    {
                        model: Room,
                        include: [
                            { model: Floor, attributes: ['name'] },
                            { model: RoomType, attributes: ['name'] },
                        ],
                        through: { attributes: [] },
                    },
                ],
            });

            if (!booking) {
                throw new CustomError('Booking not found', 404);
            }

            // Check 1: Ensure the booking status is 'COMPLETED'
            if (booking.status !== BOOKING_STATUS.COMPLETED) {
                throw new CustomError('Bill can only be generated for COMPLETED bookings', 400);
            }

            // Check 2: Query the Billing model to see if a billing record exists for this booking
            const billing = await Billing.findOne({
                where: { booking_id: bookingId },
            });

            if (!billing) {
                throw new CustomError('Billing not generated for this booking', 400);
            }

            // Check 3: Ensure the booking has at least one room
            if (booking.rooms.length === 0) {
                throw new CustomError('No rooms associated with this booking', 400);
            }

            // Check 4: check-in and check-out dates are valid
            const checkIn = new Date(booking.check_in);
            const checkOut = new Date(booking.check_out);
            const checkInNepal = new Date(checkIn.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
            const checkOutNepal = new Date(checkOut.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
            const checkInDateOnly = new Date(checkInNepal.getFullYear(), checkInNepal.getMonth(), checkInNepal.getDate());
            const checkOutDateOnly = new Date(checkOutNepal.getFullYear(), checkOutNepal.getMonth(), checkOutNepal.getDate());
            if (checkInDateOnly >= checkOutDateOnly) {
                throw new CustomError('Invalid check-in or check-out dates', 400);
            }

            const duration = (checkOutDateOnly.getTime() - checkInDateOnly.getTime()) / (1000 * 3600 * 24);

            const TAX_RATE = TAX_RATES.TAX_RATE;
            const VAT_RATE = TAX_RATES.VAT_RATE;
            const SERVICE_CHARGE_RATE = TAX_RATES.SERVICE_CHARGE;

            const totalRoomCharges = booking.rooms.reduce((sum, room) => sum + ((room.rate || 0) * duration), 0);
            const tax = totalRoomCharges * TAX_RATE;
            const vat = totalRoomCharges * VAT_RATE;
            const serviceCharge = totalRoomCharges * SERVICE_CHARGE_RATE;

            const subtotal = totalRoomCharges + tax + vat + serviceCharge;
            const finalAmount = subtotal - billing.discount + billing.extra_charge;

            const printableBill = {
                customer: {
                    name: `${booking.customer.firstname} ${booking.customer.lastname}`,
                    email: booking.customer.email,
                    contact: booking.customer.contact,
                },
                booking: {
                    checkIn: booking.check_in.toISOString().split('T')[0],
                    checkOut: booking.check_out.toISOString().split('T')[0],
                    duration: `${duration} days`,
                },
                rooms: booking.rooms.map((room) => ({
                    name: room.name,
                    floor: room.floor.name,
                    roomType: room.roomType.name,
                    rate: room.rate,
                    total: (room.rate || 0) * duration,
                })),
                charges: {
                    totalRoomCharges: totalRoomCharges.toFixed(2),
                    tax: tax.toFixed(2),
                    vat: vat.toFixed(2),
                    serviceCharge: serviceCharge.toFixed(2),
                    subtotal: subtotal.toFixed(2),
                },
                billing: {
                    discount: billing.discount.toFixed(2),
                    extraCharge: billing.extra_charge.toFixed(2),
                    finalAmount: finalAmount.toFixed(2),
                    remarks: billing.remarks,
                    billingDate: billing.billing_date.toISOString().split('T')[0],
                },
            };

            return printableBill;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to generate printable bill', 500);
        }
    }

    async getAllPrintableBills(): Promise<any[]> {
        try {
            // Fetch all completed bookings
            const completedBookings = await Booking.findAll({
                where: { status: BOOKING_STATUS.COMPLETED },
                include: [
                    {
                        model: Customer,
                        attributes: ['id', 'firstname', 'lastname', 'email', 'contact'],
                    },
                    {
                        model: Room,
                        include: [
                            { model: Floor, attributes: ['name'] },
                            { model: RoomType, attributes: ['name'] },
                        ],
                        through: { attributes: [] },
                    },
                ],
            });

            if (!completedBookings || completedBookings.length === 0) {
                return [];
            }

            // Generate printable bills for each completed booking
            const printableBills = await Promise.all(
                completedBookings.map(async (booking) => {
                    const billing = await Billing.findOne({
                        where: { booking_id: booking.id },
                    });

                    if (!billing) {
                        throw new CustomError(`Billing not found for booking ID: ${booking.id}`, 404);
                    }

                    // Check 4: check-in and check-out dates are valid
                    const checkIn = new Date(booking.check_in);
                    const checkOut = new Date(booking.check_out);
                    const checkInNepal = new Date(checkIn.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
                    const checkOutNepal = new Date(checkOut.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
                    const checkInDateOnly = new Date(checkInNepal.getFullYear(), checkInNepal.getMonth(), checkInNepal.getDate());
                    const checkOutDateOnly = new Date(checkOutNepal.getFullYear(), checkOutNepal.getMonth(), checkOutNepal.getDate());
                    if (checkInDateOnly >= checkOutDateOnly) {
                        throw new CustomError(`Invalid check-in or check-out dates for booking ID: ${booking.id}`, 400);
                    }

                    const duration = (checkOutDateOnly.getTime() - checkInDateOnly.getTime()) / (1000 * 3600 * 24);

                    const TAX_RATE = TAX_RATES.TAX_RATE;
                    const VAT_RATE = TAX_RATES.VAT_RATE;
                    const SERVICE_CHARGE_RATE = TAX_RATES.SERVICE_CHARGE;

                    const totalRoomCharges = booking.rooms.reduce((sum, room) => sum + ((room.rate || 0) * duration), 0);
                    const tax = totalRoomCharges * TAX_RATE;
                    const vat = totalRoomCharges * VAT_RATE;
                    const serviceCharge = totalRoomCharges * SERVICE_CHARGE_RATE;

                    const subtotal = totalRoomCharges + tax + vat + serviceCharge;
                    const finalAmount = subtotal - billing.discount + billing.extra_charge;

                    return {
                        customer: {
                            name: `${booking.customer.firstname} ${booking.customer.lastname}`,
                            email: booking.customer.email,
                            contact: booking.customer.contact,
                        },
                        booking: {
                            checkIn: booking.check_in.toISOString().split('T')[0],
                            checkOut: booking.check_out.toISOString().split('T')[0],
                            duration: `${duration} days`,
                        },
                        rooms: booking.rooms.map((room) => ({
                            name: room.name,
                            floor: room.floor.name,
                            roomType: room.roomType.name,
                            rate: room.rate,
                            total: (room.rate || 0) * duration,
                        })),
                        charges: {
                            totalRoomCharges: totalRoomCharges.toFixed(2),
                            tax: tax.toFixed(2),
                            vat: vat.toFixed(2),
                            serviceCharge: serviceCharge.toFixed(2),
                            subtotal: subtotal.toFixed(2),
                        },
                        billing: {
                            discount: billing.discount.toFixed(2),
                            extraCharge: billing.extra_charge.toFixed(2),
                            finalAmount: finalAmount.toFixed(2),
                            remarks: billing.remarks,
                            billingDate: billing.billing_date.toISOString().split('T')[0],
                        },
                    };
                })
            );

            return printableBills;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to fetch all printable bills', 500);
        }
    }
    
}
export default new BillingService();