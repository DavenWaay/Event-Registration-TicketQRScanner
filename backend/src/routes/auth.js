const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { createUser, findUser, findUserByEmail, createAttendee, findAttendeeByEmail } = require('../db')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// Attendee signup
router.post('/signup', async (req, res) => {
  const { name, email, company, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' })
  
  const existing = findAttendeeByEmail(email)
  if (existing) return res.status(409).json({ message: 'Email already registered' })
  
  const hash = await bcrypt.hash(password, 10)
  const attendee = createAttendee(name, email, company || '', hash)
  
  const token = jwt.sign({ sub: attendee.id, email: attendee.email, role: 'attendee' }, JWT_SECRET, { expiresIn: '8h' })
  res.status(201).json({ token, role: 'attendee', user: attendee })
})

// Organizer/Admin registration (admin-only)
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body
  if (!username || !password) return res.status(400).json({ message: 'username and password required' })
  const existing = findUser(username)
  if (existing) return res.status(409).json({ message: 'User exists' })
  const hash = await bcrypt.hash(password, 10)
  createUser(username, hash, role || 'organizer')
  res.status(201).json({ message: 'created' })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
  
  // Try attendee first
  const attendee = findAttendeeByEmail(email)
  if (attendee) {
    const ok = await bcrypt.compare(password, attendee.password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ sub: attendee.id, email: attendee.email, role: 'attendee' }, JWT_SECRET, { expiresIn: '8h' })
    return res.json({ token, role: 'attendee', user: { id: attendee.id, name: attendee.name, email: attendee.email, company: attendee.company } })
  }
  
  // Try user (organizer/admin) by email or username
  let user = findUserByEmail(email)
  if (!user) user = findUser(email) // fallback to username lookup
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
  if (!user.active) return res.status(403).json({ message: 'Account disabled' })
  const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' })
  res.json({ token, role: user.role, user: { id: user.id, username: user.username, role: user.role } })
})

module.exports = router
