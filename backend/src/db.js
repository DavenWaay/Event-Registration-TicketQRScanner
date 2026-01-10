const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'data', 'db.json')
fs.mkdirSync(path.dirname(file), { recursive: true })

function readDb(){
  try{
    const raw = fs.readFileSync(file, 'utf8')
    const data = JSON.parse(raw)
    // Ensure all collections exist
    data.users = data.users || []
    data.attendees = data.attendees || []
    data.events = data.events || []
    data.tickets = data.tickets || []
    return data
  }catch(_){
    return { users: [], attendees: [], events: [], tickets: [] }
  }
}

function writeDb(db){
  fs.writeFileSync(file, JSON.stringify(db, null, 2), 'utf8')
}

// ensure seed (events + admin user)
const bcrypt = require('bcryptjs')
const DB = readDb()
DB.users = DB.users || []
DB.attendees = DB.attendees || []
DB.events = DB.events || []
DB.tickets = DB.tickets || []
let needsWrite = false

if (DB.events.length === 0){
  DB.events.push({
    id: 'evt-1',
    title: 'Community Tech Meetup',
    description: 'An evening of talks and networking.',
    date: '2026-03-12T18:00:00Z',
    location: 'Community Hall',
    capacity: 100,
    attendeesCount: 0
  })
  needsWrite = true
}

// seed admin user if missing or update existing one with email
const existingAdmin = DB.users.find(u=>u.username === 'admin')
if (!existingAdmin){
  const hash = bcrypt.hashSync('admin123', 10)
  DB.users.push({ id: Date.now(), username: 'admin', email: 'admin@event.com', password: hash, role: 'admin', active: true })
  needsWrite = true
} else if (!existingAdmin.email) {
  // Add email to existing admin user
  existingAdmin.email = 'admin@event.com'
  needsWrite = true
}

if (needsWrite) writeDb(DB)

function getEvents(){ const db = readDb(); return db.events }
function getEvent(id){ const db = readDb(); return db.events.find(e=>e.id===id) }
function createEvent(ev){ const db = readDb(); db.events.push(ev); writeDb(db); }

function getTicketsForEvent(eventId){ const db = readDb(); return db.tickets.filter(t=>t.eventId===eventId) }
function getTicket(id){ const db = readDb(); return db.tickets.find(t=>t.id===id) }
function createTicket(ticket){ const db = readDb(); db.tickets.push(ticket); const ev = db.events.find(e=>e.id===ticket.eventId); if (ev) ev.attendeesCount = (ev.attendeesCount||0)+1; writeDb(db); }
function checkInTicket(id){ const db = readDb(); const t = db.tickets.find(x=>x.id===id); if (t){ t.status='checked-in'; t.checkedInAt = new Date().toISOString(); writeDb(db); } return t }
function findTicketByEmail(eventId, email){ const db = readDb(); return db.tickets.find(t=>t.eventId===eventId && t.email===email) }
function getTicketsByAttendee(attendeeId){ const db = readDb(); return db.tickets.filter(t=>t.attendeeId===attendeeId) }

function createUser(username, passwordHash, role='organizer', active=true){ const db = readDb(); const id = Date.now() + Math.floor(Math.random()*1000); const user = { id, username, password: passwordHash, role, active }; db.users.push(user); writeDb(db); return { id: user.id, username: user.username, role: user.role, active: user.active } }
function findUser(username){ const db = readDb(); return db.users.find(u=>u.username===username) }
function findUserByEmail(email){ const db = readDb(); return db.users.find(u=>u.email===email) }

function listUsers(){ const db = readDb(); return db.users.map(u=>({ id: u.id, username: u.username, role: u.role, active: u.active })) }

function updateUser(id, fields){ const db = readDb(); const u = db.users.find(x=>x.id==id); if(!u) return null; Object.assign(u, fields); writeDb(db); return { id: u.id, username: u.username, role: u.role, active: u.active } }

function updateEvent(id, updates){ const db = readDb(); const ev = db.events.find(e=>e.id===id); if(!ev) return null; Object.assign(ev, updates); writeDb(db); return ev }

function deleteEvent(id){ const db = readDb(); const idx = db.events.findIndex(e=>e.id===id); if(idx===-1) return false; db.events.splice(idx, 1); writeDb(db); return true }

// Attendee functions
function createAttendee(name, email, company, passwordHash){ const db = readDb(); const id = Date.now() + Math.floor(Math.random()*1000); const attendee = { id, name, email, company, password: passwordHash }; db.attendees.push(attendee); writeDb(db); return { id: attendee.id, name: attendee.name, email: attendee.email, company: attendee.company } }
function findAttendeeByEmail(email){ const db = readDb(); return db.attendees.find(a=>a.email===email) }
function getAttendee(id){ const db = readDb(); return db.attendees.find(a=>a.id==id) }

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getTicketsForEvent, getTicket, createTicket, checkInTicket, findTicketByEmail, getTicketsByAttendee, createUser, findUser, findUserByEmail, listUsers, updateUser, createAttendee, findAttendeeByEmail, getAttendee }
