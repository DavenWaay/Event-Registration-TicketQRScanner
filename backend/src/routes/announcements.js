const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getEvent, getTicketsForEvent } = require('../db');
const { sendAnnouncement } = require('../services/email');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Send announcement to event attendees
router.post('/', async (req, res) => {
  try {
    // Verify user is organizer or admin
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'Authentication required' });
    
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    let payload;
    try {
      payload = jwt.verify(parts[1], JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token expired or invalid' });
    }
    
    if (payload.role !== 'organizer' && payload.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Organizer or admin role required' });
    }
    
    const { eventId, subject, message } = req.body;
    
    if (!eventId || !subject || !message) {
      return res.status(400).json({ message: 'Event ID, subject, and message are required' });
    }
    
    // Get event
    const event = getEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get all registered attendees for this event
    const tickets = getTicketsForEvent(eventId);
    
    if (tickets.length === 0) {
      return res.status(400).json({ message: 'No attendees registered for this event' });
    }
    
    // Extract unique emails
    const emails = [...new Set(tickets.map(t => t.email))];
    
    // Send announcement
    const result = await sendAnnouncement({
      to: emails,
      eventTitle: event.title,
      subject,
      message
    });
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: `Announcement sent to ${result.count} recipient(s)`,
        recipientCount: result.count
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: result.reason || result.error || 'Failed to send announcement' 
      });
    }
    
  } catch (err) {
    console.error('Announcement error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports = router;
