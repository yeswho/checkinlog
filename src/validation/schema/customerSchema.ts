import { GENDER } from '@src/enums/database';
import Joi from 'joi';
import { UpdatedAt } from 'sequelize-typescript';
// Create customer schema
export const customerSchema = Joi.object({
    firstname: Joi.string().min(3).max(30).required(),
    lastname: Joi.string().min(3).max(30).required(),
    address: Joi.string().max(255),
    company: Joi.string().max(100),
    email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(100)
    .required(),
    contact: Joi.string()
        .pattern(new RegExp('^\\+?[0-9]{1,4}\\s?[0-9]{10}$'))
        .required(),
    dateofbirth: Joi.date()
        .less('now')
        .iso()
        .required(),
    gender: Joi.string()
        .valid(...Object.values(GENDER))
        .required()
}).messages({
    'string.pattern.base': 'Contact number must include a country code followed by 10 digits',
    'date.less': 'Date of birth must be a valid past date in ISO format',
    'string.base': 'Field must be a string',
    'any.required': 'Field is required',
    'any.only': 'Invalid value'
});
// Update customer schema
export const customerUpdateSchema = Joi.object({
    firstname: Joi.string().min(3).max(30).optional(),
    lastname: Joi.string().min(3).max(30).optional(),
    address: Joi.string().max(255),
    email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(100),
    company: Joi.string().max(100),
    contact: Joi.string()
        .pattern(new RegExp('^\\+?[0-9]{1,4}\\s?[0-9]{10}$'))
        .optional(),
    dateofbirth: Joi.date()
        .less('now')
        .iso()
        .optional(),
    gender: Joi.string()
        .valid(...Object.values(GENDER))
        .optional(),
    updatedAt: Joi.date()
        .iso(),
}).or('firstname', 'lastname', 'email', 'contact', 'dateofbirth', 'gender', 'address')
    .messages({
        'string.pattern.base': 'Contact number must include a country code followed by 10 digits',
        'date.less': 'Date of birth must be a valid past date in ISO format',
        'string.base': 'Field must be a string',
        'any.required': 'Field is required',
        'any.only': 'Invalid value'
    });