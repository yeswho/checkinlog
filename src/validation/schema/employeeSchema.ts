import Joi from 'joi';
import { DESIGNATIONS } from '@src/enums/database';

export const employeeCreateSchema = Joi.object({
    name: Joi.string().max(255).required(),
    designation: Joi.string()
        .valid(...Object.values(DESIGNATIONS))
        .required(),
    basic_salary: Joi.number().positive().required(),
    createdAt: Joi.date().iso().optional(),
    updatedAt: Joi.date().iso().optional(),
}).messages({
    'string.base': 'Field must be a string',
    'number.base': 'Field must be a number',
    'number.positive': 'Basic salary must be a positive number',
    'any.required': 'Field is required',
    'any.only': 'Invalid designation value',
});

export const employeeUpdateSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    designation: Joi.string()
        .valid(...Object.values(DESIGNATIONS))
        .optional(),
    basic_salary: Joi.number().positive().optional(),
    updatedAt: Joi.date().iso().optional(),
}).or('name', 'designation', 'basic_salary')
  .messages({
    'string.base': 'Field must be a string',
    'number.base': 'Field must be a number',
    'number.positive': 'Basic salary must be a positive number',
    'any.only': 'Invalid designation value',
    'object.missing': 'At least one field must be provided for update',
});