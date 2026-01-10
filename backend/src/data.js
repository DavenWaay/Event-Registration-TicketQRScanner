const { v4: uuidv4 } = require('uuid');

const events = [
  {
    id: 'evt-1',
    title: 'Community Tech Meetup',
    description: 'An evening of talks and networking.',
    date: '2026-03-12T18:00:00Z',
    location: 'Community Hall',
    capacity: 100,
    attendeesCount: 0
  }
];

const tickets = []; // { id, eventId, name, email, company, status }

function createTicket(eventId, name, email, company) {
  const id = uuidv4();
  const ticket = { id, eventId, name, email, company, status: 'issued', createdAt: new Date().toISOString() };
  tickets.push(ticket);
  const ev = events.find(e => e.id === eventId);
  if (ev) ev.attendeesCount = (ev.attendeesCount || 0) + 1;
  return ticket;
}

module.exports = { events, tickets, createTicket };
