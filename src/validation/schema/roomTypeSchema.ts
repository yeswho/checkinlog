import Joi from 'joi';

// Create RoomType schema
export const roomTypeSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Room type name must be at least 3 characters long',
    'string.max': 'Room type name must be no longer than 100 characters',
    'any.required': 'Room type name is required',
  }),
  bed: Joi.number().integer().min(1).max(20).required().messages({
    'number.base': 'Bed count must be a valid number',
    'number.min': 'Bed count must be at least 1',
    'number.max': 'Bed count cannot exceed 20',
    'any.required': 'Bed count is required',
  }),
  ac: Joi.boolean().default(false).messages({
    'boolean.base': 'AC field must be a boolean (true or false)',
  }),
  bathroom: Joi.boolean().default(false).messages({
    'boolean.base': 'Bathroom field must be a boolean (true or false)',
  }),
});

// Update RoomType schema
export const roomTypeUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    'string.min': 'Room type name must be at least 3 characters long',
    'string.max': 'Room type name must be no longer than 100 characters',
  }),
  bed: Joi.number().integer().min(1).max(20).optional().messages({
    'number.base': 'Bed count must be a valid number',
    'number.min': 'Bed count must be at least 1',
    'number.max': 'Bed count cannot exceed 20',
  }),
  ac: Joi.boolean().optional().messages({
    'boolean.base': 'AC field must be a boolean (true or false)',
  }),
  bathroom: Joi.boolean().optional().messages({
    'boolean.base': 'Bathroom field must be a boolean (true or false)',
  }),
}).or('name', 'bed', 'ac', 'bathroom');
