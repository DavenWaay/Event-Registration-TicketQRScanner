const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { readDb, getEvent, getTicketsForEvent, findTicketByEmail, createTicket: dbCreateTicket, getTicketsByAttendee, getAttendee } = require('../db');
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

// Get tickets for logged-in attendee or admin (MUST come before /:eventId)
router.get('/my-tickets', async (req, res) => {
  try {
    console.log('my-tickets route hit')
    // Try attendee first
    const attendee = getAttendeeFromToken(req)
    if (attendee) {
      console.log('Attendee found:', attendee.sub)
      const tickets = getTicketsByAttendee(attendee.sub)
      // Add QR codes to tickets
      const ticketsWithQR = await Promise.all(tickets.map(async t => {
        try {
          const qrDataUrl = await QRCode.toDataURL(t.id)
          return { ...t, qr: qrDataUrl }
        } catch (err) {
          return t
        }
      }))
      return res.json(ticketsWithQR)
    }

    // Try admin/organizer by user token
    console.log('Checking admin/organizer token')
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ message: 'Authentication required' })
    const parts = auth.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid token' })
    
    let payload
    try {
      payload = jwt.verify(parts[1], JWT_SECRET)
    } catch (err) {
      console.log('Token verification failed:', err.message)
      return res.status(401).json({ message: 'Token expired or invalid', expired: err.name === 'TokenExpiredError' })
    }
    console.log('Token payload:', { role: payload.role, email: payload.email })
    if ((payload.role === 'admin' || payload.role === 'organizer') && payload.email) {
      // Find tickets by admin/organizer email
      const db = readDb()
      const userTickets = db.tickets.filter(t => t.email === payload.email)
      console.log('Found tickets for', payload.email, ':', userTickets.length)
      // Add QR codes to tickets
      const ticketsWithQR = await Promise.all(userTickets.map(async t => {
        try {
          const qrDataUrl = await QRCode.toDataURL(t.id)
          return { ...t, qr: qrDataUrl }
        } catch (err) {
          return t
        }
      }))
      return res.json(ticketsWithQR)
    }

    return res.status(401).json({ message: 'Authentication required' })
  } catch (e) {
    console.error('Error in my-tickets route:', e)
    return res.status(500).json({ message: 'Internal server error', error: e.message })
  }
})

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

// Update a ticket (owner attendee or admin/organizer with matching email)
router.patch('/:ticketId', async (req, res) => {
  const { ticketId } = req.params
  const { name, email, company } = req.body
  const { getTicket, updateTicket } = require('../db')
  const t = getTicket(ticketId)
  if (!t) return res.status(404).json({ message: 'Ticket not found' })

  // Check attendee token
  const attendee = getAttendeeFromToken(req)
  if (attendee) {
    if (String(attendee.sub) !== String(t.attendeeId)) return res.status(403).json({ message: 'Forbidden' })
    const updated = updateTicket(ticketId, { name: name || t.name, email: email || t.email, company: company || t.company })
    return res.json(updated)
  }

  // Try admin/organizer token
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ message: 'Authentication required' })
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid token' })
  try{
    const payload = jwt.verify(parts[1], JWT_SECRET)
    if ((payload.role === 'admin' || payload.role === 'organizer') && payload.email === t.email){
      const updated = updateTicket(ticketId, { name: name || t.name, email: email || t.email, company: company || t.company })
      return res.json(updated)
    }
    return res.status(403).json({ message: 'Forbidden' })
  }catch(err){
    return res.status(401).json({ message: 'Token expired or invalid' })
  }
})

// Delete (cancel) a ticket
router.delete('/:ticketId', (req, res) => {
  const { ticketId } = req.params
  const { getTicket, deleteTicket } = require('../db')
  const t = getTicket(ticketId)
  if (!t) return res.status(404).json({ message: 'Ticket not found' })

  const attendee = getAttendeeFromToken(req)
  if (attendee) {
    if (String(attendee.sub) !== String(t.attendeeId)) return res.status(403).json({ message: 'Forbidden' })
    const ok = deleteTicket(ticketId)
    return res.json({ success: ok })
  }

  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ message: 'Authentication required' })
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid token' })
  try{
    const payload = jwt.verify(parts[1], JWT_SECRET)
    if ((payload.role === 'admin' || payload.role === 'organizer') && payload.email === t.email){
      const ok = deleteTicket(ticketId)
      return res.json({ success: ok })
    }
    return res.status(403).json({ message: 'Forbidden' })
  }catch(err){
    return res.status(401).json({ message: 'Token expired or invalid' })
  }
})

module.exports = router;
