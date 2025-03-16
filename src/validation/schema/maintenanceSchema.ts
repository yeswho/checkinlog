import Joi from 'joi';

// Create maintenance schema
export const maintenanceSchema = Joi.object({
  room_id: Joi.number().required(),
  reason: Joi.string().min(3).max(500).required(),
  startDate: Joi.date().iso().required(),
  expectedEndDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
}).messages({
  'string.base': 'Field must be a string',
  'any.required': 'Field is required',
  'date.base': 'Field must be a valid date',
  'date.min': 'End date must be after start date',
});

// Update maintenance schema
export const maintenanceUpdateSchema = Joi.object({
  room_id: Joi.number().optional(), 
  reason: Joi.string().min(3).max(500).optional(),
  startDate: Joi.date().iso().optional(),
  expectedEndDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  updatedAt: Joi.date().iso().optional(),
})
  .or('room_id', 'reason', 'startDate', 'expectedEndDate')
  .messages({
    'string.base': 'Field must be a string',
    'any.required': 'Field is required',
    'date.base': 'Field must be a valid date',
    'date.min': 'End date must be after start date',
  });