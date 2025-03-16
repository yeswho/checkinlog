import Joi from 'joi';

// Create complaint schema
export const complaintSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    status: Joi.string().valid('open', 'in_progress', 'resolved').default('open'),
    priority: Joi.string().valid('low', 'medium', 'high').default('low'),
    roomId: Joi.number().optional(),
    customerId: Joi.number().optional(),
    createdAt: Joi.date().iso().optional(),
    updatedAt: Joi.date().iso().optional()
}).messages({
    'string.base': 'Field must be a string',
    'any.required': 'Field is required',
    'any.only': 'Invalid value'
});

// Update complaint schema
export const complaintUpdateSchema = Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(500).optional(),
    status: Joi.string().valid('open', 'in_progress', 'resolved').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    roomId: Joi.number().optional(),
    customerId: Joi.number().optional(),
    updatedAt: Joi.date().iso().optional()
}).or('title', 'description', 'status', 'priority', 'roomId', 'customerId')
  .messages({
    'string.base': 'Field must be a string',
    'any.required': 'Field is required',
    'any.only': 'Invalid value'
});