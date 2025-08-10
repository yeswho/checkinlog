import Joi from 'joi';

export const salaryCreateSchema = Joi.object({
    employee_id: Joi.number().integer().positive().required(),
    basic_salary: Joi.number().positive().required(),
    bonus: Joi.number().min(0).optional(),
    advance: Joi.number().min(0).optional(),
    overtime: Joi.number().min(0).optional(),
    total_salary: Joi.number().positive().required(),
    salary_date: Joi.date().iso().required(),
    createdAt: Joi.date().iso().optional(),
    updatedAt: Joi.date().iso().optional(),
}).messages({
    'number.base': 'Field must be a number',
    'number.positive': 'Field must be a positive number',
    'number.min': 'Field must be greater than or equal to {#limit}',
    'date.base': 'Field must be a valid date',
    'any.required': 'Field is required',
});

export const salaryUpdateSchema = Joi.object({
    employee_id: Joi.number().integer().positive().optional(),
    basic_salary: Joi.number().positive().optional(),
    bonus: Joi.number().min(0).optional(),
    advance: Joi.number().min(0).optional(),
    overtime: Joi.number().min(0).optional(),
    total_salary: Joi.number().positive().optional(),
    salary_date: Joi.date().iso().optional(),
    updatedAt: Joi.date().iso().optional(),
})
    .or('employee_id', 'basic_salary', 'bonus', 'advance', 'overtime', 'total_salary', 'salary_date')
    .messages({
        'number.base': 'Field must be a number',
        'number.positive': 'Field must be a positive number',
        'number.min': 'Field must be greater than or equal to {#limit}',
        'date.base': 'Field must be a valid date',
        'object.missing': 'At least one field must be provided for update',
    });