import Joi from "joi";

// Create floor schema
export const floorSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
}).messages({
    'string.base': 'Field must be a string',
    'any.required': 'Field is required',
    'any.only': 'Invalid value'
});
// Update floor schema
export const floorUpdateSchema = Joi.object({
    name: Joi.string().min(3).max(30).optional(),
}).messages({
        'string.base': 'Field must be a string',
        'any.required': 'Field is required',
        'any.only': 'Invalid value'
    });

