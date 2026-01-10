const express = require('express');
const router = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../db');
const { v4: uuidv4 } = require('uuid');

router.get('/', (req, res) => {
  res.json(getEvents());
});

router.get('/:id', (req, res) => {
  const ev = getEvent(req.params.id);
  if (!ev) return res.status(404).json({ message: 'Event not found' });
  res.json(ev);
});

router.post('/', (req, res) => {
  const { title, description, date, location, capacity, status } = req.body;
  const id = `evt-${Date.now()}`;
  const newEvent = { id, title, description, date, location, capacity: capacity || 0, status: status || 'upcoming', attendeesCount: 0 };
  createEvent(newEvent);
  res.status(201).json(newEvent);
});

router.put('/:id', (req, res) => {
  const updated = updateEvent(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Event not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const deleted = deleteEvent(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Event not found' });
  res.json({ message: 'Event deleted' });
});

module.exports = router;
