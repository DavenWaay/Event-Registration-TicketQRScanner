import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MonitorAttendeesSection() {
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    axios.get('http://localhost:4000/api/events')
      .then(r => setEvents(r.data))
      .catch(() => setEvents([]));
  }, []);

  function viewAttendees(event) {
    setSelectedEvent(event);
    axios.get(`http://localhost:4000/api/registrations/${event.id}`)
      .then(r => setAttendees(r.data))
      .catch(() => setAttendees([]));
  }

  function closeAttendeeView() {
    setSelectedEvent(null);
    setAttendees([]);
    setAttendeeSearch('');
    setFilterStatus('all');
  }

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      (a.id && a.id.toLowerCase().includes(attendeeSearch.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (selectedEvent) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={closeAttendeeView} style={{
            padding: '10px 16px',
            background: '#3a3a3a',
            color: '#e0e0e0',
            border: '1px solid #505050',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500
          }}>← Back to Events</button>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#fff' }}>{selectedEvent.title} - Attendees</h2>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Search by name, email, or ticket ID..."
            value={attendeeSearch}
            onChange={e => setAttendeeSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 250,
              padding: '12px 16px',
              background: '#1a1a1a',
              border: '1px solid #404040',
              borderRadius: 10,
              color: '#e0e0e0',
              fontSize: 15
            }}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: '12px 16px',
              background: '#1a1a1a',
              border: '1px solid #404040',
              borderRadius: 10,
              color: '#e0e0e0',
              fontSize: 15,
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status ({attendees.length})</option>
            <option value="checked-in">Checked-In ({attendees.filter(a => a.status === 'checked-in').length})</option>
            <option value="issued">Pending ({attendees.filter(a => a.status !== 'checked-in').length})</option>
          </select>
        </div>

        {filteredAttendees.length === 0 && <p style={{ color: '#888' }}>No attendees found.</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredAttendees.map(a => (
            <div key={a.id} style={{
              background: '#2d2d2d',
              border: '1px solid #404040',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600, color: '#fff' }}>{a.name}</h4>
                  <p style={{ margin: '4px 0', fontSize: 14, color: '#b0b0b0' }}>📧 {a.email}</p>
                  {a.phone && <p style={{ margin: '4px 0', fontSize: 14, color: '#b0b0b0' }}>📞 {a.phone}</p>}
                  {a.company && <p style={{ margin: '4px 0', fontSize: 14, color: '#b0b0b0' }}>🏢 {a.company}</p>}
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: a.status === 'checked-in' ? 'rgba(40,167,69,0.15)' : 'rgba(102,126,234,0.15)',
                  border: `1px solid ${a.status === 'checked-in' ? '#28a745' : '#667eea'}`,
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: a.status === 'checked-in' ? '#4ade80' : '#667eea'
                }}>
                  {a.status === 'checked-in' ? '✓ Checked In' : 'Pending'}
                </div>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#888' }}>Ticket ID: {a.id.slice(0, 24)}...</p>
              {a.checkedInAt && (
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#888' }}>Checked in: {new Date(a.checkedInAt).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 28, fontWeight: 700, color: '#fff' }}>Monitor Attendees</h2>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="🔍 Search events..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: 'calc(100% - 32px)',
            padding: '12px 16px',
            background: '#1a1a1a',
            border: '1px solid #404040',
            borderRadius: 10,
            color: '#e0e0e0',
            fontSize: 15
          }}
        />
      </div>

      {filteredEvents.length === 0 && <p style={{ color: '#888' }}>No events found.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 20 }}>
        {filteredEvents.map(event => (
          <div key={event.id} style={{
            background: '#2d2d2d',
            border: '1px solid #404040',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'all 0.3s'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 20, fontWeight: 600, color: '#fff' }}>{event.title}</h3>
            <div style={{ fontSize: 14, color: '#b0b0b0', marginBottom: 16 }}>
              <p style={{ margin: '6px 0' }}>📅 {new Date(event.date).toLocaleDateString()}</p>
              <p style={{ margin: '6px 0' }}>📍 {event.location}</p>
              <p style={{ margin: '6px 0' }}>👥 {event.attendeesCount || 0} / {event.capacity}</p>
            </div>
            <button onClick={() => viewAttendees(event)} style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 600
            }}>👥 View Attendees</button>
          </div>
        ))}
      </div>
    </div>
  );
}
