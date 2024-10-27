import Joi from 'joi';
import { PAYMENT_MODE } from '@src/enums/database';

// Create Booking schema
export const bookingSchema = Joi.object({
  customer_id: Joi.number().integer().required().messages({
    'number.base': 'Customer ID must be a valid number',
    'any.required': 'Customer ID is required',
  }),
  room_id: Joi.number().integer().required().messages({
    'number.base': 'Room ID must be a valid number',
    'any.required': 'Room ID is required',
  }),
  check_in: Joi.date().iso().required().messages({
    'date.base': 'Check-in date must be a valid date',
    'any.required': 'Check-in date is required',
  }),
  check_out: Joi.date().iso().greater(Joi.ref('check_in')).required().messages({
    'date.base': 'Check-out date must be a valid date',
    'date.greater': 'Check-out date must be after check-in date',
    'any.required': 'Check-out date is required',
  }),
  payment_mode: Joi.string().valid(...Object.values(PAYMENT_MODE)).required().messages({
    'any.only': 'Payment mode must be one of the following: ' + Object.values(PAYMENT_MODE).join(', '),
    'any.required': 'Payment mode is required',
  }),
});

// Update Booking schema
export const bookingUpdateSchema = Joi.object({
    customer_id: Joi.number().integer().optional().messages({
      'number.base': 'Customer ID must be a valid number',
    }),
    room_id: Joi.number().integer().optional().messages({
      'number.base': 'Room ID must be a valid number',
    }),
    check_in: Joi.date().iso().optional().messages({
      'date.base': 'Check-in date must be a valid date',
    }),
    check_out: Joi.date().iso().greater(Joi.ref('check_in')).optional().messages({
      'date.base': 'Check-out date must be a valid date',
      'date.greater': 'Check-out date must be after check-in date',
    }),
    payment_mode: Joi.string().valid(...Object.values(PAYMENT_MODE)).optional().messages({
      'any.only': 'Payment mode must be one of the following: ' + Object.values(PAYMENT_MODE).join(', '),
    }),
  }).or('customer_id', 'room_id', 'check_in', 'check_out', 'payment_mode');
  