import { BOOKING_STATUS } from '@src/enums/database';
import { CustomError } from '@src/middleware/errorHandler';
import { AdditionalCharge } from '@src/sequelize/models/additionalCharge';
import { Booking } from '@src/sequelize/models/bookingsModel';
import BaseService from '@src/services/baseService';

class AdditionalChargeService extends BaseService<AdditionalCharge> {
    constructor() {
        super(AdditionalCharge);
    }

    /**
     * Get all additional charges for a booking.
     */
    async getAdditionalCharges(bookingId: number) {
        try {
            const booking = await Booking.findOne({
                where: { id: bookingId },
                include: [
                    {
                        model: AdditionalCharge,
                        attributes: ['id', 'description', 'amount', 'isFood', 'createdAt', 'updatedAt'],
                    },
                ],
            });

            if (!booking) {
                throw new CustomError('Booking not found', 404);
            }

            return booking.additionalCharges;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to fetch additional charges', 500);
        }
    }

    /**
     * Add a new additional charge for a booking.
     */
    async addAdditionalCharge(bookingId: number, chargeData: { description: string; amount: number; isFood: boolean }) {
        try {
            const booking = await Booking.findByPk(bookingId);

            if (!booking) {
                throw new CustomError('Booking not found', 404);
            }

            if (booking.status != BOOKING_STATUS.CHECKED_IN) {
                throw new CustomError('Booking status should be Check-in to add additional charges', 400);
            }

            const newCharge = await AdditionalCharge.create({
                booking_id: bookingId,
                ...chargeData,
            });

            return newCharge;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to add additional charge', 500);
        }
    }

    /**
     * Update an existing additional charge.
     */
    async updateAdditionalCharge(bookingId: number, chargeId: number, chargeData: { description?: string; amount?: number; isFood?: boolean }) {
        try {

            const booking = await Booking.findByPk(bookingId);

            if (!booking) {
                throw new CustomError('Booking not found', 404);
            }

            if (booking.status != BOOKING_STATUS.CHECKED_IN) {
                throw new CustomError('Booking status should be Check-in to update additional charges', 400);
            }

            const charge = await AdditionalCharge.findOne({
                where: { id: chargeId, booking_id: bookingId },
            });

            if (!charge) {
                throw new CustomError('Additional charge not found', 404);
            }

            await charge.update(chargeData);

            return charge;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to update additional charge', 500);
        }
    }

    /**
     * Delete an additional charge.
     */
    async deleteAdditionalCharge(bookingId: number, chargeId: number) {
        try {

            const booking = await Booking.findByPk(bookingId);

            if (!booking) {
                throw new CustomError('Booking not found', 404);
            }

            if (booking.status != BOOKING_STATUS.CHECKED_IN) {
                throw new CustomError('Booking status should be Check-in to delete additional charges', 400);
            }

            const charge = await AdditionalCharge.findOne({
                where: { id: chargeId, booking_id: bookingId },
            });

            if (!charge) {
                throw new CustomError('Additional charge not found', 404);
            }

            await charge.destroy();

            return charge;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to delete additional charge', 500);
        }
    }
}

export default new AdditionalChargeService();