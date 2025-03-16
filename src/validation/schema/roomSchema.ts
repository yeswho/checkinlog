import { UpdatedAt } from '@sequelize/core/decorators-legacy';
import { ROOM_STATUS } from '@src/enums/database';
import Joi from 'joi';

// Create Room schema
export const roomSchema = Joi.object({
  name: Joi.string().max(100).required().messages({
    'string.base': 'Name must be a valid string',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),
  floor_id: Joi.number().integer().required().messages({
    'number.base': 'Floor ID must be a valid number',
    'any.required': 'Floor ID is required',
  }),
  roomType_id: Joi.number().integer().required().messages({
    'number.base': 'Room Type ID must be a valid number',
    'any.required': 'Room Type ID is required',
  }),
  rate: Joi.number().positive().required().messages({
    'number.base': 'Rate must be a valid number',
    'number.positive': 'Rate must be a positive number',
    'any.required': 'Rate is required',
  }),
  status: Joi.string().valid(...Object.values(ROOM_STATUS)).required().messages({
    'any.only': 'Status must be one of the following: ' + Object.values(ROOM_STATUS).join(', '),
    'any.required': 'Status is required',
  }),
});

// Update Room schema
export const roomUpdateSchema = Joi.object({

    name: Joi.string().max(100).optional().messages({
      'string.base': 'Name must be a valid string',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    floor_id: Joi.number().integer().optional().messages({
      'number.base': 'Floor ID must be a valid number',
    }),
    roomType_id: Joi.number().integer().optional().messages({
      'number.base': 'Room Type ID must be a valid number',
    }),
    rate: Joi.number().positive().optional().messages({
      'number.base': 'Rate must be a valid number',
      'number.positive': 'Rate must be a positive number',
    }),
    status: Joi.string().valid(...Object.values(ROOM_STATUS)).optional().messages({
      'any.only': 'Status must be one of the following: ' + Object.values(ROOM_STATUS).join(', '),
    }),
    updatedAt: Joi.date().iso().optional().messages({
      'date.base': 'Updated At must be a valid date',
    }),
  }).or('floor_id', 'roomType_id', 'rate', 'status', 'name', 'updatedAt');
