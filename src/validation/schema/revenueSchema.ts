import Joi from 'joi';

// Common date validation
const dateSchema = Joi.date().iso().required()
    .messages({
        'date.base': 'Must be a valid date',
        'date.format': 'Must be in ISO format (YYYY-MM-DD)',
        'any.required': 'Date is required'
    });

export const dailySummarySchema = Joi.object({
    date: dateSchema
});

export const dateRangeSchema = Joi.object({
    startDate: dateSchema,
    endDate: dateSchema.when('startDate', {
        is: Joi.exist(),
        then: Joi.date().min(Joi.ref('startDate'))
            .message('End date must be after or equal to start date')
    })
});

export const yearParamSchema = Joi.object({
    year: Joi.number().integer().min(2000).max(2100).required()
        .messages({
            'number.base': 'Year must be a number',
            'number.integer': 'Year must be an integer',
            'number.min': 'Year must be 2000 or later',
            'number.max': 'Year must be 2100 or earlier',
            'any.required': 'Year is required'
        })
});

export const yearComparisonSchema = Joi.object({
    years: Joi.string().pattern(/^(\d{4})(,\s*\d{4})*$/)
        .required()
        .messages({
            'string.pattern.base': 'Years must be comma-separated 4-digit years',
            'any.required': 'Years parameter is required'
        })
});

export const revenueGenerateSchema = Joi.object({
    date: dateSchema
});