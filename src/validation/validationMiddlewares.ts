import { Request, Response, NextFunction } from 'express';
import { customerSchema, customerUpdateSchema } from '@validator/schema/customerSchema';
import {floorSchema, floorUpdateSchema} from '@validator/schema/floorSchema';
import {roomTypeSchema, roomTypeUpdateSchema} from '@validator/schema/roomTypeSchema'
import { roomSchema, roomUpdateSchema } from './schema/roomSchema';
import { bookingSchema, bookingUpdateSchema } from './schema/bookingSchema';
import { complaintSchema, complaintUpdateSchema } from './schema/complaintSchema';
import { maintenanceSchema, maintenanceUpdateSchema } from './schema/maintenanceSchema';
import {billingSchema, billingUpdateSchema} from './schema/billingSchema';

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

