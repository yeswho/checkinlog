import { Router } from 'express';

const router = Router();

// Get all rooms
router.get('/', (req, res) => {
  res.send('Get all rooms');
});

// Get a specific room
router.get('/:id', (req, res) => {
  res.send(`Get room with ID ${req.params.id}`);
});

// Create a new room
router.post('/', (req, res) => {
  res.send('Create a new room');
});

// Update a room
router.put('/:id', (req, res) => {
  res.send(`Update room with ID ${req.params.id}`);
});

// Delete a room
router.delete('/:id', (req, res) => {
  res.send(`Delete room with ID ${req.params.id}`);
});

export default router;
