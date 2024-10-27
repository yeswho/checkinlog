import { Request, Response, NextFunction } from 'express';
import { customerSchema, customerUpdateSchema } from '@validator/schema/customerSchema';
import {floorSchema, floorUpdateSchema} from '@validator/schema/floorSchema';
import {roomTypeSchema, roomTypeUpdateSchema} from '@validator/schema/roomTypeSchema'
import { roomSchema, roomUpdateSchema } from './schema/roomSchema';
import { bookingSchema, bookingUpdateSchema } from './schema/bookingSchema';

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
