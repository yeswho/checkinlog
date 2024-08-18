import { Request, Response, NextFunction } from 'express';
import { customerSchema, customerUpdateSchema } from '@validator/schema/customerSchema';
import {floorSchema, floorUpdateSchema} from '@validator/schema/floorSchema';



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
