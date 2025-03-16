import Joi from 'joi';

// Create billing schema
export const billingSchema = Joi.object({
    booking_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Booking ID must be a number',
            'number.integer': 'Booking ID must be an integer',
            'number.positive': 'Booking ID must be a positive number',
            'any.required': 'Booking ID is required',
        }),
    total_amount: Joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'Total amount must be a number',
            'number.positive': 'Total amount must be a positive number',
            'any.required': 'Total amount is required',
        }),
    discount: Joi.number()
        .min(0)
        .default(0)
        .messages({
            'number.base': 'Discount must be a number',
            'number.min': 'Discount cannot be negative',
        }),
    extra_charge: Joi.number()
        .min(0)
        .default(0)
        .messages({
            'number.base': 'Extra charge must be a number',
            'number.min': 'Extra charge cannot be negative',
        }),
    final_amount: Joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'Final amount must be a number',
            'number.positive': 'Final amount must be a positive number',
            'any.required': 'Final amount is required',
        }),
    remarks: Joi.string()
        .max(255)
        .allow('')
        .optional()
        .messages({
            'string.base': 'Remarks must be a string',
            'string.max': 'Remarks cannot exceed 255 characters',
        }),
    billing_date: Joi.date()
        .iso()
        .required()
        .messages({
            'date.base': 'Billing date must be a valid date',
            'date.iso': 'Billing date must be in ISO format (YYYY-MM-DD)',
            'any.required': 'Billing date is required',
        }),
}).messages({
    'any.required': 'Field is required',
    'any.only': 'Invalid value',
});

// Update billing schema
export const billingUpdateSchema = Joi.object({
    booking_id: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'Booking ID must be a number',
            'number.integer': 'Booking ID must be an integer',
            'number.positive': 'Booking ID must be a positive number',
        }),
    total_amount: Joi.number()
        .positive()
        .optional()
        .messages({
            'number.base': 'Total amount must be a number',
            'number.positive': 'Total amount must be a positive number',
        }),
    discount: Joi.number()
        .min(0)
        .optional()
        .messages({
            'number.base': 'Discount must be a number',
            'number.min': 'Discount cannot be negative',
        }),
    extra_charge: Joi.number()
        .min(0)
        .optional()
        .messages({
            'number.base': 'Extra charge must be a number',
            'number.min': 'Extra charge cannot be negative',
        }),
    final_amount: Joi.number()
        .positive()
        .optional()
        .messages({
            'number.base': 'Final amount must be a number',
            'number.positive': 'Final amount must be a positive number',
        }),
    remarks: Joi.string()
        .max(255)
        .allow('')
        .optional()
        .messages({
            'string.base': 'Remarks must be a string',
            'string.max': 'Remarks cannot exceed 255 characters',
        }),
    billing_date: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.base': 'Billing date must be a valid date',
            'date.iso': 'Billing date must be in ISO format (YYYY-MM-DD)',
        }),
}).or('booking_id', 'total_amount', 'discount', 'extra_charge', 'final_amount', 'remarks', 'billing_date')
  .messages({
    'object.missing': 'At least one field must be provided for update',
});