import { Router } from 'express';

const router = Router();

// Get all bookings
router.get('/', (req, res) => {
  res.send('Get all bookings');
});

// Get a specific booking
router.get('/:id', (req, res) => {
  res.send(`Get booking with ID ${req.params.id}`);
});

// Create a new booking
router.post('/', (req, res) => {
  res.send('Create a new booking');
});

// Update a booking
router.put('/:id', (req, res) => {
  res.send(`Update booking with ID ${req.params.id}`);
});

// Delete a booking
router.delete('/:id', (req, res) => {
  res.send(`Delete booking with ID ${req.params.id}`);
});

export default router;
