import BillingService from '@services/billingService';
import logger from '@src/utils/logger';
import { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

export class BillingController {

    
    // Get printable bill by booking ID
    getPrintableBill = async (req: Request, res: Response, next: NextFunction) => {
        const { bookingId } = req.params;
        try {
            const printableBill = await BillingService.getPrintableBill(Number(bookingId));
            res.json(printableBill);
        } catch (error) {
            next(error);
        }
    };

    //Get all printable bills
    getAllPrintableBills = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const billings = await BillingService.getAllPrintableBills();
            res.json(billings);
        } catch(error){
            next(error);
        }
    }

    // Get all billings
    getAllBillings = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const billings = await BillingService.findAll();
            res.json(billings);
        } catch (error) {
            next(error);
        }
    };

    // Get billing by ID
    getBillingById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const billing = await BillingService.findById(Number(id));
            res.json(billing);
        } catch (error) {
            next(error);
        }
    };

    // Add a billing
    addBilling = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newBilling = await BillingService.create(req.body);
            res.status(201).json(newBilling);
        } catch (error) {
            next(error);
        }
    };

    // Update a billing
    updateBilling = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const updatedBilling = await BillingService.update(Number(id), req.body);
            res.json(updatedBilling);
        } catch (error) {
            next(error);
        }
    };

    // Delete a billing
    deleteBilling = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            await BillingService.delete(Number(id));
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    sendEmailWithPdf = async (req: Request, res: Response, next: NextFunction) => {
        const { to, subject, text } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "No PDF file uploaded" });
        }

        console.log(req.file);
        

        try {
            logger.info('Creating transporter...');
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
    
            logger.info('Sending email...');
            const info = await transporter.sendMail({
                from: `"Hotel JanakpurInn" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                text,
                attachments: [
                    {
                        filename: "bill.pdf",
                        content: req.file.buffer, 
                    },
                ],
    
            });
    
            logger.info('Email sent successfully');
            res.json({ message: 'Email sent successfully', info });
        } catch (error) {
            logger.error('Error in sendEmailWithPdf:', error);
            next(error);
        }
    };
}