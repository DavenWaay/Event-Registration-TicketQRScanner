import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

export default function RegisterTicketPage({ onRegistered }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('${API_URL}/api/events')
      .then(r => setEvents(r.data))
      .catch(() => setEvents([]));
  }, []);

  function handleSelectEvent(ev) {
    setSelectedEvent(ev);
    setStep(2);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/registrations/${selectedEvent.id}/register`, form);
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  function handleBackToTickets() {
    onRegistered && onRegistered();
  }

  if (step === 1) {
    return (
      <div>
        <h2 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#fff'}}>Register for an Event</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:20}}>
          {events.map(ev => (
            <div key={ev.id} style={{
              background:'#2d2d2d',
              border:'1px solid #404040',
              borderRadius:16,
              padding:24,
              boxShadow:'0 4px 12px rgba(0,0,0,0.2)',
              transition:'all 0.3s'
            }}>
              <h3 style={{margin:'0 0 12px 0',fontSize:20,fontWeight:600,color:'#fff'}}>{ev.title}</h3>
              <div style={{fontSize:14,color:'#b0b0b0',marginBottom:16}}>
                <p style={{margin:'6px 0'}}>📅 {new Date(ev.date).toLocaleDateString()}</p>
                <p style={{margin:'6px 0'}}>📍 {ev.location}</p>
                <p style={{margin:'6px 0'}}>👥 {ev.attendeesCount || 0} / {ev.capacity}</p>
              </div>
              <button onClick={()=>handleSelectEvent(ev)} style={{
                width:'100%',
                padding:'14px',
                background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color:'#fff',
                border:'none',
                borderRadius:10,
                cursor:'pointer',
                fontSize:16,
                fontWeight:600
              }}>Register</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 2 && selectedEvent) {
    return (
      <div style={{maxWidth:800,margin:'0 auto',padding:'0 20px'}}>
        <h2 style={{marginBottom:32,fontSize:28,fontWeight:700,color:'#fff'}}>Register for Event</h2>
        
        {/* Event Info Card */}
        <div style={{background:'#2d2d2d',padding:24,borderRadius:12,border:'1px solid #404040',marginBottom:24}}>
          <h3 style={{margin:'0 0 12px 0',fontSize:20,fontWeight:600,color:'#667eea'}}>{selectedEvent.title}</h3>
          <div style={{display:'flex',gap:16,fontSize:14,color:'#b0b0b0',flexWrap:'wrap'}}>
            <span>📅 {new Date(selectedEvent.date).toLocaleDateString()}, {new Date(selectedEvent.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            <span>📍 {selectedEvent.location}</span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{background:'#2d2d2d',padding:'40px',borderRadius:16,border:'1px solid #404040',boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>
          <h3 style={{margin:'0 0 28px 0',fontSize:18,fontWeight:600,color:'#fff'}}>Attendee Information</h3>
          
          <div style={{marginBottom:24}}>
            <label style={{display:'block',marginBottom:10,color:'#b0b0b0',fontSize:14,fontWeight:500}}>Full Name *</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              style={{
                width:'calc(100% - 32px)',
                padding:'12px 16px',
                borderRadius:8,
                background:'#1a1a1a',
                border:'1px solid #404040',
                color:'#e0e0e0',
                fontSize:15,
                outline:'none',
                boxSizing:'border-box',
                transition:'border-color 0.2s',
                marginLeft:16,
                marginRight:16
              }} 
              onFocus={e=>e.target.style.borderColor='#667eea'} 
              onBlur={e=>e.target.style.borderColor='#404040'} 
            />
          </div>
          
          <div style={{marginBottom:24}}>
            <label style={{display:'block',marginBottom:10,color:'#b0b0b0',fontSize:14,fontWeight:500}}>Email Address *</label>
            <input 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              style={{
                width:'calc(100% - 32px)',
                padding:'12px 16px',
                borderRadius:8,
                background:'#1a1a1a',
                border:'1px solid #404040',
                color:'#e0e0e0',
                fontSize:15,
                outline:'none',
                boxSizing:'border-box',
                transition:'border-color 0.2s',
                marginLeft:16,
                marginRight:16
              }} 
              onFocus={e=>e.target.style.borderColor='#667eea'} 
              onBlur={e=>e.target.style.borderColor='#404040'} 
            />
          </div>
          
          <div style={{marginBottom:32}}>
            <label style={{display:'block',marginBottom:10,color:'#b0b0b0',fontSize:14,fontWeight:500}}>Company/Organization (Optional)</label>
            <input 
              name="company" 
              value={form.company} 
              onChange={handleChange} 
              style={{
                width:'calc(100% - 32px)',
                padding:'12px 16px',
                borderRadius:8,
                background:'#1a1a1a',
                border:'1px solid #404040',
                color:'#e0e0e0',
                fontSize:15,
                outline:'none',
                boxSizing:'border-box',
                transition:'border-color 0.2s',
                marginLeft:16,
                marginRight:16
              }} 
              onFocus={e=>e.target.style.borderColor='#667eea'} 
              onBlur={e=>e.target.style.borderColor='#404040'} 
            />
          </div>
          
          {error && (
            <div style={{
              color:'#ff6b6b',
              marginBottom:20,
              padding:'12px 16px',
              background:'rgba(255,107,107,0.1)',
              borderRadius:8,
              fontSize:14,
              border:'1px solid rgba(255,107,107,0.3)'
            }}>{error}</div>
          )}
          
          <div style={{display:'flex',gap:12}}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{
                flex:1,
                padding:'16px',
                fontSize:16,
                fontWeight:600,
                color:'white',
                background: loading ? '#555' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border:'none',
                borderRadius:10,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition:'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(102,126,234,0.4)'
              }}
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
            <button 
              type="button"
              onClick={()=>setStep(1)}
              style={{
                padding:'16px 24px',
                fontSize:16,
                fontWeight:500,
                color:'#e0e0e0',
                background:'#3a3a3a',
                border:'1px solid #505050',
                borderRadius:10,
                cursor:'pointer',
                transition:'all 0.2s'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div style={{textAlign:'center',padding:40}}>
        <div style={{fontSize:64,marginBottom:16}}>✅</div>
        <h2 style={{color:'#4ade80',marginBottom:16,fontSize:28,fontWeight:700}}>Registration Successful!</h2>
        <p style={{color:'#b0b0b0',fontSize:16,marginBottom:32}}>Your ticket will now appear in your My Tickets list.</p>
        <button onClick={handleBackToTickets} style={{marginTop:24,padding:'14px 28px',background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:16,cursor:'pointer',boxShadow:'0 4px 12px rgba(102,126,234,0.4)',transition:'all 0.2s'}}>Back to My Tickets</button>
      </div>
    );
  }

  return null;
}

