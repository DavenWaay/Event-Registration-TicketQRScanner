const { v4: uuidv4 } = require('uuid');

const events = [
  {
    id: 'evt-1',
    title: 'Community Tech Meetup',
    description: 'An evening of talks and networking.',
    date: '2026-03-12T18:00:00Z',
    location: 'Community Hall',
    capacity: 100,
    attendeesCount: 5
  },
  {
    id: 'evt-2',
    title: 'Ninjas in Paris',
    description: 'A themed meetup celebrating programming and partnerships.',
    date: '2026-04-15T19:00:00Z',
    location: 'Paris Conference Center',
    capacity: 50,
    attendeesCount: 3
  },
  {
    id: 'evt-3',
    title: 'Admin Workshop',
    description: 'Hands-on admin & organizer workflow session.',
    date: '2026-05-20T14:00:00Z',
    location: 'Organizer Lab',
    capacity: 60,
    attendeesCount: 6
  }
  ,
  {
    id: 'evt-4',
    title: 'Design Systems Summit',
    description: 'A day focused on design systems and component architecture.',
    date: '2026-06-10T09:30:00Z',
    location: 'Design Hub',
    capacity: 200,
    attendeesCount: 0
  },
  {
    id: 'evt-5',
    title: 'Cloud Native Meetup',
    description: 'Talks on containerization, observability, and CI/CD.',
    date: '2026-07-22T18:00:00Z',
    location: 'Tech Center',
    capacity: 150,
    attendeesCount: 2
  },
  {
    id: 'evt-6',
    title: 'Frontend Frameworks Showdown',
    description: 'A friendly comparison of modern frontend frameworks.',
    date: '2026-08-05T17:00:00Z',
    location: 'Conference Room A',
    capacity: 120,
    attendeesCount: 1
  }
];
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
