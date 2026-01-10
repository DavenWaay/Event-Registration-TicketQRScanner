const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const { getTicket, checkInTicket } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function requireAuth(req, res, next){
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ message: 'Authorization required' })
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid auth format' })
  try{
    const payload = jwt.verify(parts[1], JWT_SECRET)
    req.user = payload
    next()
  }catch(err){
    res.status(401).json({ message: 'Invalid token' })
  }
}

router.post('/', requireAuth, (req, res) => {
  const { ticketId } = req.body;
  if (!ticketId) return res.status(400).json({ message: 'ticketId required' });
  const ticket = getTicket(ticketId);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  if (ticket.status === 'checked-in') return res.status(409).json({ message: 'Ticket already checked in' });
  const updated = checkInTicket(ticketId);
  res.json({ message: 'OK', ticket: updated });
});

module.exports = router;
