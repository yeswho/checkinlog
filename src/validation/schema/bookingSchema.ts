import Joi from 'joi';
import { BOOKING_STATUS, PAYMENT_MODE } from '@src/enums/database';
import { UpdatedAt } from 'sequelize-typescript';

// Create Booking schema
export const bookingSchema = Joi.object({
  customer_id: Joi.number().integer().required().messages({
    'number.base': 'Customer ID must be a valid number',
    'any.required': 'Customer ID is required',
  }),
  room_id: Joi.array().items(Joi.number().integer().messages({
    'number.base': 'Each Room ID must be a valid number',
  })).required().messages({
    'array.base': 'Room ID must be an array of valid numbers',
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
  pax: Joi.number().integer().required().messages({
    'number.base': 'pax must be a valid number',
    'any.required': 'pax is required',
  }),
  status: Joi.string().valid(...Object.values(BOOKING_STATUS)).required().messages({
    'any.only': 'Status must be one of the following: ' + Object.values(BOOKING_STATUS).join(', '),
    'any.required': 'Status is required',
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
  room_id: Joi.array()
    .items(Joi.number().integer())
    .optional()
    .messages({
      'array.base': 'Room ID must be an array of valid numbers',
    }),
  pax: Joi.number().integer().optional().messages({
    'number.base': 'pax must be a valid number',
  }),
  check_in: Joi.date().iso().optional().messages({
    'date.base': 'Check-in date must be a valid date',
  }),
  check_out: Joi.date()
    .iso()
    .greater(Joi.ref('check_in'))
    .optional()
    .messages({
      'date.base': 'Check-out date must be a valid date',
      'date.greater': 'Check-out date must be after check-in date',
    }),
  status: Joi.string()
    .valid(...Object.values(BOOKING_STATUS))
    .optional()
    .messages({
      'any.only': 'Status must be one of the following: ' + Object.values(BOOKING_STATUS).join(', '),
    }),
  payment_mode: Joi.string()
    .valid(...Object.values(PAYMENT_MODE))
    .optional()
    .messages({
      'any.only': 'Payment mode must be one of the following: ' + Object.values(PAYMENT_MODE).join(', '),
    }),
  updatedAt: Joi.date().iso().optional().messages({
    'date.base': 'Updated At must be a valid date',
  }),
}).or('customer_id', 'room_id', 'pax', 'check_in', 'check_out', 'status', 'payment_mode');