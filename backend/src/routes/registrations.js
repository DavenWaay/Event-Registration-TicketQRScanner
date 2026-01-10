const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { getEvent, getTicketsForEvent, findTicketByEmail, createTicket: dbCreateTicket, getTicketsByAttendee, getAttendee } = require('../db');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function getAttendeeFromToken(req){
  const auth = req.headers.authorization
  if (!auth) return null
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  try{
    const payload = jwt.verify(parts[1], JWT_SECRET)
    return payload.role === 'attendee' ? payload : null
  }catch(_){
    return null
  }
}

// Get registrations (tickets) for an event
router.get('/:eventId', (req, res) => {
  const { eventId } = req.params;
  const ev = getEvent(eventId);
  if (!ev) return res.status(404).json({ message: 'Event not found' });
  const list = getTicketsForEvent(eventId);
  res.json(list);
});

// Register for an event
router.post('/:eventId/register', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, email, company } = req.body;
    const ev = getEvent(eventId);
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    // Get attendee from token if available
    const attendeeFromToken = getAttendeeFromToken(req)
    const attendeeId = attendeeFromToken ? attendeeFromToken.sub : null
    
    // Use token data or request body
    const finalEmail = attendeeFromToken ? attendeeFromToken.email : email
    const attendeeData = attendeeId ? getAttendee(attendeeId) : null
    const finalName = name || (attendeeData ? attendeeData.name : '')
    const finalCompany = company || (attendeeData ? attendeeData.company : '')
    
    if (!finalName || !finalEmail) {
      return res.status(400).json({ message: 'Name and email required' })
    }

    // Duplicate registration check (same email for same event)
    const existing = findTicketByEmail(eventId, finalEmail);
    if (existing) return res.status(409).json({ message: 'Already registered with this email' });

    // Capacity check
    if (ev.capacity && ev.attendeesCount >= ev.capacity) return res.status(400).json({ message: 'Event is full' });

    const ticket = { 
      id: uuidv4(), 
      eventId, 
      attendeeId,
      eventTitle: ev.title,
      name: finalName, 
      email: finalEmail, 
      company: finalCompany, 
      status: 'issued', 
      createdAt: new Date().toISOString() 
    };
    dbCreateTicket(ticket);
    try {
      const qrDataUrl = await QRCode.toDataURL(ticket.id);
      res.status(201).json({ ticket: { ...ticket, qr: qrDataUrl } });
    } catch (err) {
      console.error('QR generation failed', err)
      res.status(500).json({ message: 'Failed to generate QR' });
    }
  } catch (err) {
    console.error('Registration error', err)
    res.status(500).json({ message: 'Registration failed' })
  }
});

// Get tickets for logged-in attendee
router.get('/my-tickets', (req, res) => {
  const attendee = getAttendeeFromToken(req)
  if (!attendee) return res.status(401).json({ message: 'Authentication required' })
  
  const tickets = getTicketsByAttendee(attendee.sub)
  res.json(tickets)
})

module.exports = router;
