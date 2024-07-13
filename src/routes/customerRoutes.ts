import { Router } from 'express';
import { CustomError } from '@middleware/errorHandler';

const router = Router();

// Get all customers
router.get('/', (req, res, next) => {
    try {
        res.send('Get all customers');
        throw new CustomError('No customers', 400);
    } catch (error) {
        next(error);
    }
});

// Get a specific customer
router.get('/:id', (req, res) => {
    res.send(`Get customer with ID ${req.params.id}`);
});

// Create a new customer
router.post('/', (req, res) => {
    res.send('Create a new customer');
});

// Update a customer
router.put('/:id', (req, res) => {
    res.send(`Update customer with ID ${req.params.id}`);
});

// Delete a customer
router.delete('/:id', (req, res) => {
    res.send(`Delete customer with ID ${req.params.id}`);
});

export default router;
