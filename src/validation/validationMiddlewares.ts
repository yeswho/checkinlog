import { Request, Response, NextFunction } from 'express';
import { customerSchema, customerUpdateSchema } from '@validator/schema/customerSchema';
import {floorSchema, floorUpdateSchema} from '@validator/schema/floorSchema';
import {roomTypeSchema, roomTypeUpdateSchema} from '@validator/schema/roomTypeSchema'
import { roomSchema, roomUpdateSchema } from './schema/roomSchema';
import { bookingSchema, bookingUpdateSchema } from './schema/bookingSchema';
import { complaintSchema, complaintUpdateSchema } from './schema/complaintSchema';
import { maintenanceSchema, maintenanceUpdateSchema } from './schema/maintenanceSchema';
import {billingSchema, billingUpdateSchema} from './schema/billingSchema';
import { employeeCreateSchema, employeeUpdateSchema } from './schema/employeeSchema';
import { salaryCreateSchema, salaryUpdateSchema } from './schema/salarySchema';
import { expenseCreateSchema, expenseUpdateSchema } from './schema/expenseSchema';
import { dailySummarySchema, dateRangeSchema, revenueGenerateSchema, yearComparisonSchema, yearParamSchema } from './schema/revenueSchema';
import { CustomError } from '@src/middleware/errorHandler';

export const validateCustomer = (req: Request, res: Response, next: NextFunction) => {
    const { error } = customerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

export const validateCustomerUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { error } = customerUpdateSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

export const validateFloor = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = floorSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateUpdateFloor = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = floorUpdateSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateRoomType = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = roomTypeSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateUpdateRoomType = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = roomTypeUpdateSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateRoom = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = roomSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateUpdateRoom = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = roomUpdateSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateBooking = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = bookingSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateUpdateBooking = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = bookingUpdateSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateComplaint = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = complaintSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateComplaintUpdate = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = complaintUpdateSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateMaintenance = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = maintenanceSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateMaintenanceUpdate = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = maintenanceUpdateSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateBilling = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = billingSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateBillingUpdate = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = billingUpdateSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateEmployee = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = employeeCreateSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateEmployeeUpdate = (req: Request, res: Response, next:NextFunction)=>{
    const {error} = employeeUpdateSchema.validate(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    next();
}

export const validateSalary = (req: Request, res: Response, next: NextFunction) => {
    const { error } = salaryCreateSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

export const validateSalaryUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { error } = salaryUpdateSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

export const validateExpense = (req: Request, res: Response, next: NextFunction) => {
    const { error } = expenseCreateSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

export const validateExpenseUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { error } = expenseUpdateSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

export const validateDailySummary = (req: Request, res: Response, next: NextFunction) => {
    const { error } = dailySummarySchema.validate(req.query);
    if (error) {
        throw new CustomError(error.details[0].message, 400);
    }
    next();
};

export const validateDateRange = (req: Request, res: Response, next: NextFunction) => {
    const { error } = dateRangeSchema.validate(req.query);
    if (error) {
        throw new CustomError(error.details[0].message, 400);
    }
    next();
};

export const validateYearParam = (req: Request, res: Response, next: NextFunction) => {
    const { error } = yearParamSchema.validate(req.params);
    if (error) {
        throw new CustomError(error.details[0].message, 400);
    }
    next();
};

export const validateYearComparison = (req: Request, res: Response, next: NextFunction) => {
    const { error } = yearComparisonSchema.validate(req.query);
    if (error) {
        throw new CustomError(error.details[0].message, 400);
    }
    next();
};

export const validateRevenueGenerate = (req: Request, res: Response, next: NextFunction) => {
    const { error } = revenueGenerateSchema.validate(req.body);
    if (error) {
        throw new CustomError(error.details[0].message, 400);
    }
    next();
};
