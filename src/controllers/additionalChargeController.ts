import { Request, Response, NextFunction } from 'express';
import AdditionalChargeService from '@src/services/additionalChargeService';
import { CustomError } from '@src/middleware/errorHandler';

class AdditionalChargeController {
  /**
   * Get all additional charges for a booking.
   */
  async getAdditionalCharges(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;

      if (!bookingId || isNaN(Number(bookingId))) {
        throw new CustomError('Invalid booking ID', 400);
      }

      const additionalCharges = await AdditionalChargeService.getAdditionalCharges(Number(bookingId));

      res.json({
        additionalCharges,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a new additional charge for a booking.
   */
  async addAdditionalCharge(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const { description, amount, isFood } = req.body;

      if (!bookingId || isNaN(Number(bookingId))) {
        throw new CustomError('Invalid booking ID', 400);
      }

      const newCharge = await AdditionalChargeService.addAdditionalCharge(Number(bookingId), {
        description,
        amount,
        isFood,
      });

      res.status(201).json({
        status: 'success',
        data: newCharge,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing additional charge.
   */
  async updateAdditionalCharge(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId, chargeId } = req.params;
      const { description, amount, isFood } = req.body;

      if (!bookingId || isNaN(Number(bookingId)) || !chargeId || isNaN(Number(chargeId))) {
        throw new CustomError('Invalid booking ID or charge ID', 400);
      }

      const updatedCharge = await AdditionalChargeService.updateAdditionalCharge(Number(bookingId), Number(chargeId), {
        description,
        amount,
        isFood,
      });

      res.status(200).json({
        status: 'success',
        data: updatedCharge,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an additional charge.
   */
  async deleteAdditionalCharge(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId, chargeId } = req.params;

      if (!bookingId || isNaN(Number(bookingId)) || !chargeId || isNaN(Number(chargeId))) {
        throw new CustomError('Invalid booking ID or charge ID', 400);
      }

      await AdditionalChargeService.deleteAdditionalCharge(Number(bookingId), Number(chargeId));

      res.status(204).json({
        status: 'success',
        message: 'Additional charge deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AdditionalChargeController;