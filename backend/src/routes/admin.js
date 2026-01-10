const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { listUsers, createUser, updateUser } = require('../db')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function requireAuth(role){
  return (req, res, next) => {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ message: 'Authorization required' })
    const parts = auth.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid auth format' })
    try{
      const payload = jwt.verify(parts[1], JWT_SECRET)
      if (role && payload.role !== role) return res.status(403).json({ message: 'Forbidden' })
      req.user = payload
      next()
    }catch(err){
      res.status(401).json({ message: 'Invalid token' })
    }
  }
}

// list users (admin only)
router.get('/users', requireAuth('admin'), (req, res) => {
  res.json(listUsers())
})

// create user (admin only)
router.post('/users', requireAuth('admin'), async (req, res) => {
  const { username, password, role } = req.body
  if (!username || !password) return res.status(400).json({ message: 'username and password required' })
  const hash = await bcrypt.hash(password, 10)
  const user = createUser(username, hash, role || 'organizer', true)
  res.status(201).json(user)
})

// update user (admin only)
router.patch('/users/:id', requireAuth('admin'), (req, res) => {
  const { id } = req.params
  const { role, active } = req.body
  const updated = updateUser(id, { role, active })
  if (!updated) return res.status(404).json({ message: 'User not found' })
  res.json(updated)
})

module.exports = router
