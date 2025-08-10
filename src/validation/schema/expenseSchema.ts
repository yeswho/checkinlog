import Joi from 'joi';
import { EXPENSE_CATEGORY } from '@src/enums/database';

export const expenseCreateSchema = Joi.object({
    name: Joi.string().max(255).required(),
    amount: Joi.number().positive().required(),
    expense_date: Joi.date().iso().required(),
    category: Joi.string().valid(...Object.values(EXPENSE_CATEGORY)).required(),
    remarks: Joi.string().max(255).required(),
    createdAt: Joi.date().iso().optional(),
    updatedAt: Joi.date().iso().optional(),
}).messages({
    'string.base': 'Field must be a string',
    'string.max': 'Field must not exceed {#limit} characters',
    'number.base': 'Field must be a number',
    'number.positive': 'Field must be a positive number',
    'date.base': 'Field must be a valid date',
    'any.required': 'Field is required',
    'any.only': 'Field must be a valid expense category',
});

export const expenseUpdateSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    amount: Joi.number().positive().optional(),
    expense_date: Joi.date().iso().optional(),
    category: Joi.string().valid(...Object.values(EXPENSE_CATEGORY)).optional(),
    remarks: Joi.string().max(255).optional(),
    updatedAt: Joi.date().iso().optional(),
})
    .or('name', 'amount', 'expense_date', 'category', 'remarks')
    .messages({
        'string.base': 'Field must be a string',
        'string.max': 'Field must not exceed {#limit} characters',
        'number.base': 'Field must be a number',
        'number.positive': 'Field must be a positive number',
        'date.base': 'Field must be a valid date',
        'any.only': 'Field must be a valid expense category',
        'object.missing': 'At least one field must be provided for update',
    });