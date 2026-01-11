import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Html5Qrcode } from 'html5-qrcode'
import confirmModal from '../utils/confirm'
import alertModal from '../utils/alert'

function setAuthHeader(){
  const token = localStorage.getItem('token')
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default function OrganizerPanel(){
  const [activeSection, setActiveSection] = useState('events')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    const savedRole = localStorage.getItem('userRole')
    if (token && (savedRole === 'organizer' || savedRole === 'admin')) {
      setIsLoggedIn(true)
      setUserRole(savedRole)
      setAuthHeader()
    }
  }, [])

  function handleLogin(role){
    setIsLoggedIn(true)
    setUserRole(role)
    setAuthHeader()
  }

  function handleLogout(){
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setIsLoggedIn(false)
    setUserRole(null)
    setActiveSection('events')
    // notify top-level app to update auth state and show Landing
    try{ window.dispatchEvent(new Event('user-logged-out')) }catch(e){}
  }

  if (!isLoggedIn || (userRole !== 'organizer' && userRole !== 'admin')) {
    return null
  }

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'#1a1a1a'}}>
      {/* Sidebar */}
      <aside style={{
        width:260,
        background:'#2d2d2d',
        borderRight:'1px solid #404040',
        padding:24,
        display:'flex',
        flexDirection:'column'
      }}>
        <h2 style={{margin:'0 0 32px 0',fontSize:22,fontWeight:700,color:'#fff'}}>Organizer Panel</h2>
        <nav style={{flex:1}}>
          <SidebarItem label="My Events" active={activeSection==='events'} onClick={()=>setActiveSection('events')} />
          <SidebarItem label="Attendees" active={activeSection==='attendees'} onClick={()=>setActiveSection('attendees')} />
          <SidebarItem label="Check-in Scanner" active={activeSection==='scanner'} onClick={()=>setActiveSection('scanner')} />
          <SidebarItem label="Reports/Export" active={activeSection==='export'} onClick={()=>setActiveSection('export')} />
          <SidebarItem label="Announcements" active={activeSection==='announcements'} onClick={()=>setActiveSection('announcements')} />
        </nav>
        <button onClick={handleLogout} style={{
          marginTop:'auto',
          padding:'12px',
          background:'#dc3545',
          color:'#fff',
          border:'none',
          borderRadius:8,
          fontWeight:600,
          cursor:'pointer'
        }}>Logout</button>
      </aside>

      {/* Main Content */}
      <main style={{flex:1,padding:32,overflowY:'auto',background:'#1a1a1a'}}>
        {activeSection === 'events' && <MyEventsSection />}
        {activeSection === 'attendees' && <AttendeesSection />}
        {activeSection === 'scanner' && <ScannerSection />}
        {activeSection === 'export' && <ExportSection />}
        {activeSection === 'announcements' && <AnnouncementsSection />}
      </main>
    </div>
  )
}

function SidebarItem({ label, active, onClick }){
  return (
    <div
      onClick={onClick}
      style={{
        padding:'14px 16px',
        margin:'6px 0',
        cursor:'pointer',
        borderRadius:8,
        background: active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
        color: active ? '#fff' : '#b0b0b0',
        fontWeight: active ? 600 : 500,
        transition: 'all 0.2s',
        fontSize:15
      }}
      onMouseEnter={e=>{
        if(!active) e.currentTarget.style.background='#3a3a3a'
      }}
      onMouseLeave={e=>{
        if(!active) e.currentTarget.style.background='transparent'
      }}
    >
      {label}
    </div>
  )
}

// === SECTIONS ===

function MyEventsSection(){
  const [events, setEvents] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [viewEvent, setViewEvent] = useState(null)

  useEffect(()=>{ fetchEvents() }, [])

  function fetchEvents(){
    axios.get('http://localhost:4000/api/events')
      .then(r=>setEvents(r.data))
      .catch(()=>setEvents([]))
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{margin:0,fontSize:28,fontWeight:700,color:'#fff'}}>My Events</h2>
        <button onClick={()=>setShowCreate(true)} style={{
          padding:'12px 24px',
          background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color:'#fff',
          border:'none',
          borderRadius:8,
          cursor:'pointer',
          fontSize:15,
          fontWeight:600,
          boxShadow:'0 4px 12px rgba(102,126,234,0.4)'
        }}>+ Create Event</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:20}}>
        {events.map(ev=> (
          <div key={ev.id} style={{
            background:'#2d2d2d',
            border:'1px solid #404040',
            borderRadius:12,
            padding:20,
            transition:'all 0.3s',
            boxShadow:'0 4px 12px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={e=>{
            e.currentTarget.style.transform='translateY(-4px)'
            e.currentTarget.style.boxShadow='0 8px 24px rgba(102,126,234,0.4)'
            e.currentTarget.style.borderColor='#667eea'
          }}
          onMouseLeave={e=>{
            e.currentTarget.style.transform='translateY(0)'
            e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'
            e.currentTarget.style.borderColor='#404040'
          }}>
            <h3 style={{margin:'0 0 12px 0',fontSize:20,fontWeight:600,color:'#fff'}}>{ev.title}</h3>
            <p style={{margin:'4px 0',fontSize:14,color:'#b0b0b0'}}>
              📅 {new Date(ev.date).toLocaleDateString()} • 📍 {ev.location}
            </p>
            <p style={{margin:'8px 0',fontSize:14,color:'#b0b0b0'}}>
              👥 Capacity: {ev.attendeesCount || 0} / {ev.capacity}
            </p>
            <p style={{margin:'4px 0',fontSize:14}}>
              📊 Fill Rate: <span style={{color:'#667eea',fontWeight:600}}>{((ev.attendeesCount||0)/ev.capacity*100).toFixed(1)}%</span>
            </p>
            <p style={{margin:'4px 0',fontSize:14,color:'#b0b0b0'}}>
              Status: <strong style={{color:'#fff'}}>{ev.status || 'upcoming'}</strong>
            </p>
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button onClick={()=>setViewEvent(ev)} style={{
                flex:1,
                padding:'10px',
                background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color:'#fff',
                border:'none',
                borderRadius:8,
                cursor:'pointer',
                fontSize:14,
                fontWeight:600
              }}>View</button>
              <button onClick={()=>setEditEvent(ev)} style={{
                flex:1,
                padding:'10px',
                background:'#3a3a3a',
                color:'#e0e0e0',
                border:'1px solid #505050',
                borderRadius:8,
                cursor:'pointer',
                fontSize:14,
                fontWeight:500
              }}>Edit</button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && <p style={{color:'#888',fontSize:16}}>No events yet. Create your first event!</p>}

      {showCreate && <EventFormModal onClose={()=>{setShowCreate(false); fetchEvents()}} />}
      {editEvent && <EventFormModal event={editEvent} onClose={()=>{setEditEvent(null); fetchEvents()}} />}
      {viewEvent && <EventDetailsModal event={viewEvent} onClose={()=>{setViewEvent(null); fetchEvents()}} />}
    </div>
  )
}

function EventDetailsModal({ event, onClose }){
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({...event})

  async function handleSave(){
    try{
      await axios.put('http://localhost:4000/api/events/' + event.id, formData)
      await alertModal('Event updated')
      setEditing(false)
      onClose()
    }catch(err){
      await alertModal('Update failed: ' + (err && err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message))
    }
  }

  async function handleDelete(){
    if (!(await confirmModal('Delete this event? This cannot be undone.'))) return
    try{
      await axios.delete('http://localhost:4000/api/events/' + event.id)
      await alertModal('Event deleted')
      onClose()
    }catch(err){
      await alertModal('Delete failed: ' + (err && err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message))
    }
  }

  const fillPercent = Math.min(100, Math.round(((event.attendeesCount||0)/(event.capacity||1))*100))

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div style={{width:'95%',maxWidth:760,maxHeight:'86vh',overflowY:'auto',background:'#121212',borderRadius:12,padding:24,border:'1px solid rgba(255,255,255,0.04)',boxShadow:'0 12px 30px rgba(0,0,0,0.6)',fontFamily:'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial',color:'#e6e6e6'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h2 style={{margin:0,color:'#fff',fontSize:32,fontWeight:800,letterSpacing:0.5}}>Event Details</h2>
          <button onClick={onClose} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontSize:16}}>Close</button>
        </div>

        {!editing ? (
          <div style={{color:'#e6e6e6'}}>
            <h3 style={{margin:'6px 0 12px 0',fontSize:26,fontWeight:800,letterSpacing:0.2}}>{event.title}</h3>
            <p style={{color:'#bdbdbd',lineHeight:1.6,marginBottom:16}}>{event.description}</p>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,fontSize:14,color:'#cfcfcf'}}>
              <div style={{padding:6}}>
                <div style={{fontSize:15,color:'#9aa4ff',marginBottom:6,letterSpacing:0.8,fontWeight:700}}>DATE & TIME</div>
                <div style={{fontWeight:600}}>{new Date(event.date).toLocaleString()}</div>
              </div>
              <div style={{padding:6}}>
                <div style={{fontSize:15,color:'#9aa4ff',marginBottom:6,letterSpacing:0.8,fontWeight:700}}>LOCATION</div>
                <div style={{fontWeight:600}}>{event.location}</div>
              </div>
            </div>

            <div style={{marginTop:18}}>
              <div style={{fontSize:15,color:'#9aa4ff',marginBottom:8,letterSpacing:0.8,fontWeight:700}}>ATTENDANCE</div>
              <div style={{height:12,background:'#0f0f0f',borderRadius:8,overflow:'hidden',border:'1px solid rgba(255,255,255,0.03)'}}>
                <div style={{height:'100%',background:'linear-gradient(90deg,#667eea,#764ba2)',width:fillPercent + '%'}} />
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8,color:'#9fb0ff'}}>
                <div style={{fontSize:15,color:'#7fb0ff'}}>{Math.max(0, (event.capacity || 0) - (event.attendeesCount || 0))} spots remaining</div>
                <div style={{fontSize:15,color:'#cfcfcf'}}>{event.attendeesCount || 0} / {event.capacity || 0}</div>
              </div>
            </div>

            <div style={{display:'flex',gap:12,marginTop:20,alignItems:'center'}}>
              <button onClick={()=>setEditing(true)} style={{flex:1,padding:'14px 18px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:15}}>Edit</button>
              <button onClick={handleDelete} style={{padding:'10px 14px',background:'#171717',color:'#ff6b6b',border:'1px solid rgba(255,107,107,0.12)',borderRadius:8,cursor:'pointer',fontWeight:700}}>Delete</button>
            </div>
            <div style={{marginTop:12,color:event.status === 'checked-in' ? '#4ade80' : '#9aa4ff',fontWeight:700,fontSize:16}}>{event.status || 'upcoming'}</div>
          </div>
        ) : (
          <div style={{color:'#e6e6e6'}}>
            <div style={{background:'#161616',padding:16,borderRadius:10,border:'1px solid rgba(255,255,255,0.02)'}}>
              <div style={{display:'grid',gap:10}}>
                <div>
                  <label style={{display:'block',marginBottom:8,color:'#bfc6d8',fontSize:13}}>Title</label>
                  <input value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} style={{width:'100%',padding:'14px 18px',borderRadius:10,background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',outline:'none',fontSize:16,marginBottom:2,boxSizing:'border-box'}} />
                </div>
                <div>
                  <label style={{display:'block',marginBottom:8,color:'#bfc6d8',fontSize:13}}>Description</label>
                  <textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} style={{width:'100%',minHeight:120,padding:'14px 18px',borderRadius:10,background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',outline:'none',fontSize:16,marginBottom:2,boxSizing:'border-box'}} />
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    <label style={{display:'block',marginBottom:6,color:'#bfc6d8',fontSize:13}}>Date</label>
                    <input type="datetime-local" value={formData.date?.slice(0,16)} onChange={e=>setFormData({...formData,date:new Date(e.target.value).toISOString()})} style={{width:'100%',padding:'12px 16px',borderRadius:10,background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',boxSizing:'border-box',fontSize:15}} />
                  </div>
                  <div>
                    <label style={{display:'block',marginBottom:6,color:'#bfc6d8',fontSize:13}}>Location</label>
                    <input value={formData.location} onChange={e=>setFormData({...formData,location:e.target.value})} style={{width:'100%',padding:'12px 16px',borderRadius:10,background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',boxSizing:'border-box',fontSize:15}} />
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    <label style={{display:'block',marginBottom:6,color:'#bfc6d8',fontSize:13}}>Capacity</label>
                    <input type="number" value={formData.capacity} onChange={e=>setFormData({...formData,capacity:parseInt(e.target.value)})} style={{width:'100%',padding:'12px 16px',borderRadius:10,background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',boxSizing:'border-box',fontSize:15}} />
                  </div>
                  <div>
                    <label style={{display:'block',marginBottom:6,color:'#bfc6d8',fontSize:13}}>Status</label>
                    <select value={formData.status || 'upcoming'} onChange={e=>setFormData({...formData,status:e.target.value})} style={{width:'100%',padding:'12px 16px',borderRadius:10,background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',boxSizing:'border-box',fontSize:15}}>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{display:'flex',gap:12,marginTop:16,justifyContent:'flex-end'}}>
                <button onClick={handleSave} style={{padding:'10px 18px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700}}>Save</button>
                <button onClick={handleDelete} style={{padding:'10px 18px',background:'#dc3545',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700}}>Delete</button>
                <button onClick={onClose} style={{padding:'10px 18px',background:'#2a2a2a',color:'#fff',border:'1px solid rgba(255,255,255,0.03)',borderRadius:8,cursor:'pointer'}}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EventFormModal({ event, onClose }){
  const isEdit = !!event
  const [formData, setFormData] = useState(event || {
    title: '', description: '', date: '', location: '', capacity: 50, status: 'upcoming'
  })

  async function handleSave(){
      if (!formData.title || !formData.date || !formData.location) {
      await alertModal('Title, date, and location are required')
      return
    }
    try{
      if (isEdit) {
        await axios.put(`http://localhost:4000/api/events/${event.id}`, formData)
        await alertModal('Event updated')
      } else {
        await axios.post('http://localhost:4000/api/events', formData)
        await alertModal('Event created')
      }
      onClose()
    }catch(err){
      await alertModal('Save failed: ' + (err?.response?.data?.message || err.message))
    }
  }

  async function handleDelete(){
    if (!(await confirmModal('Delete this event? This cannot be undone.'))) return
    try{
      await axios.delete(`http://localhost:4000/api/events/${event.id}`)
      await alertModal('Event deleted')
      onClose()
    }catch(err){
      await alertModal('Delete failed')
    }
  }

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div style={{width:'95%',maxWidth:760,maxHeight:'86vh',overflowY:'auto',background:'#121212',borderRadius:12,padding:24,border:'1px solid rgba(255,255,255,0.04)',boxShadow:'0 12px 30px rgba(0,0,0,0.6)',fontFamily:'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial',color:'#e6e6e6'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h2 style={{margin:0,color:'#fff',fontSize:32,fontWeight:800,letterSpacing:0.5}}>Event Details</h2>
          <button onClick={onClose} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontSize:16}}>Close</button>
        </div>

        <div style={{color:'#e6e6e6'}}>
          <div style={{background:'#161616',padding:16,borderRadius:10,border:'1px solid rgba(255,255,255,0.02)'}}>
            <div style={{display:'grid',gap:10}}>
              <div>
                <label style={{display:'block',marginBottom:8,color:'#bfc6d8',fontSize:13}}>Title</label>
                <input value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} style={{width:'100%',padding:'14px 18px',borderRadius:10,background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',outline:'none',fontSize:16,marginBottom:2,boxSizing:'border-box'}} />
              </div>
              <div>
                <label style={{display:'block',marginBottom:8,color:'#bfc6d8',fontSize:13}}>Description</label>
                <textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} style={{width:'100%',minHeight:120,padding:'14px 18px',borderRadius:10,background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',outline:'none',fontSize:16,marginBottom:2,boxSizing:'border-box'}} />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={{display:'block',marginBottom:6,color:'#bfc6d8',fontSize:13}}>Date</label>
                  <input type="datetime-local" value={formData.date?.slice(0,16)} onChange={e=>setFormData({...formData,date:new Date(e.target.value).toISOString()})} style={{width:'100%',padding:'12px 16px',borderRadius:10,background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',boxSizing:'border-box',fontSize:15}} />
                </div>
                <div>
                  <label style={{display:'block',marginBottom:6,color:'#bfc6d8',fontSize:13}}>Location</label>
                  <input value={formData.location} onChange={e=>setFormData({...formData,location:e.target.value})} style={{width:'100%',padding:'12px 16px',borderRadius:10,background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',boxSizing:'border-box',fontSize:15}} />
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={{display:'block',marginBottom:6,color:'#bfc6d8',fontSize:13}}>Capacity</label>
                  <input type="number" value={formData.capacity} onChange={e=>setFormData({...formData,capacity:parseInt(e.target.value)})} style={{width:'100%',padding:'12px 16px',borderRadius:10,background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',boxSizing:'border-box',fontSize:15}} />
                </div>
                <div>
                  <label style={{display:'block',marginBottom:6,color:'#bfc6d8',fontSize:13}}>Status</label>
                  <select value={formData.status || 'upcoming'} onChange={e=>setFormData({...formData,status:e.target.value})} style={{width:'100%',padding:'12px 16px',borderRadius:10,background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',boxSizing:'border-box',fontSize:15}}>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{display:'flex',gap:12,marginTop:16,justifyContent:'flex-end'}}>
              <button onClick={handleSave} style={{padding:'10px 18px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700}}>Save</button>
              {isEdit && <button onClick={handleDelete} style={{padding:'10px 18px',background:'#dc3545',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700}}>Delete</button>}
              <button onClick={onClose} style={{padding:'10px 18px',background:'#2a2a2a',color:'#fff',border:'1px solid rgba(255,255,255,0.03)',borderRadius:8,cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AttendeesSection(){
  const [events, setEvents] = useState([])
  const [attendees, setAttendees] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [attendeeSearch, setAttendeeSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(()=>{
    axios.get('http://localhost:4000/api/events')
      .then(r=>setEvents(r.data))
      .catch(()=>setEvents([]))
  }, [])

  function viewAttendees(event){
    setSelectedEvent(event)
    axios.get(`http://localhost:4000/api/registrations/${event.id}`)
      .then(r=>setAttendees(r.data))
      .catch(()=>setAttendees([]))
  }

  function closeAttendeeView(){
    setSelectedEvent(null)
    setAttendees([])
    setAttendeeSearch('')
    setFilterStatus('all')
  }

  const filteredEvents = events.filter(e=> 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAttendees = attendees.filter(a=>{
    const matchesSearch = a.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
                         a.email.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
                         (a.id && a.id.toLowerCase().includes(attendeeSearch.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (selectedEvent) {
    return (
      <div>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24}}>
          <button onClick={closeAttendeeView} style={{
            padding:'10px 16px',
            background:'#3a3a3a',
            color:'#e0e0e0',
            border:'1px solid #505050',
            borderRadius:8,
            cursor:'pointer',
            fontSize:14,
            fontWeight:500
          }}>← Back to Events</button>
          <h2 style={{margin:0,fontSize:28,fontWeight:700,color:'#fff'}}>{selectedEvent.title} - Attendees</h2>
        </div>

        <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
          <input
            type="text"
            placeholder="🔍 Search by name, email, or ticket ID..."
            value={attendeeSearch}
            onChange={e=>setAttendeeSearch(e.target.value)}
            style={{
              flex:1,
              minWidth:250,
              padding:'12px 16px',
              background:'#1a1a1a',
              border:'1px solid #404040',
              borderRadius:10,
              color:'#e0e0e0',
              fontSize:15
            }}
          />
          <select 
            value={filterStatus} 
            onChange={e=>setFilterStatus(e.target.value)}
            style={{
              padding:'12px 16px',
              background:'#1a1a1a',
              border:'1px solid #404040',
              borderRadius:10,
              color:'#e0e0e0',
              fontSize:15,
              cursor:'pointer'
            }}
          >
            <option value="all">All Status ({attendees.length})</option>
            <option value="checked-in">Checked-In ({attendees.filter(a=>a.status==='checked-in').length})</option>
            <option value="issued">Pending ({attendees.filter(a=>a.status!=='checked-in').length})</option>
          </select>
        </div>

        {filteredAttendees.length === 0 && <p style={{color:'#888'}}>No attendees found.</p>}
        
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {filteredAttendees.map(a=> (
            <div key={a.id} style={{
              background:'#2d2d2d',
              border:'1px solid #404040',
              borderRadius:12,
              padding:20,
              boxShadow:'0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:8}}>
                <div>
                  <h4 style={{margin:'0 0 8px 0',fontSize:18,fontWeight:600,color:'#fff'}}>{a.name}</h4>
                  <p style={{margin:'4px 0',fontSize:14,color:'#b0b0b0'}}>📧 {a.email}</p>
                  {a.phone && <p style={{margin:'4px 0',fontSize:14,color:'#b0b0b0'}}>📞 {a.phone}</p>}
                  {a.company && <p style={{margin:'4px 0',fontSize:14,color:'#b0b0b0'}}>🏢 {a.company}</p>}
                </div>
                <div style={{
                  padding:'6px 12px',
                  background: a.status === 'checked-in' ? 'rgba(40,167,69,0.15)' : 'rgba(102,126,234,0.15)',
                  border: `1px solid ${a.status === 'checked-in' ? '#28a745' : '#667eea'}`,
                  borderRadius:6,
                  fontSize:13,
                  fontWeight:600,
                  color: a.status === 'checked-in' ? '#4ade80' : '#667eea'
                }}>
                  {a.status === 'checked-in' ? '✓ Checked In' : 'Pending'}
                </div>
              </div>
              <p style={{margin:'8px 0 0 0',fontSize:13,color:'#888'}}>Ticket ID: {a.id.slice(0,24)}...</p>
              {a.checkedInAt && (
                <p style={{margin:'4px 0 0 0',fontSize:13,color:'#888'}}>Checked in: {new Date(a.checkedInAt).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#fff'}}>Registered Attendees</h2>

      <div style={{marginBottom:24}}>
        <input
          type="text"
          placeholder="🔍 Search events..."
          value={searchTerm}
          onChange={e=>setSearchTerm(e.target.value)}
          style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:10,
            color:'#e0e0e0',
            fontSize:15
          }}
        />
      </div>

      {filteredEvents.length === 0 && <p style={{color:'#888'}}>No events found.</p>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:20}}>
        {filteredEvents.map(event=> (
          <div key={event.id} style={{
            background:'#2d2d2d',
            border:'1px solid #404040',
            borderRadius:16,
            padding:24,
            boxShadow:'0 4px 12px rgba(0,0,0,0.2)',
            transition:'all 0.3s'
          }}>
            <h3 style={{margin:'0 0 12px 0',fontSize:20,fontWeight:600,color:'#fff'}}>{event.title}</h3>
            <div style={{fontSize:14,color:'#b0b0b0',marginBottom:16}}>
              <p style={{margin:'6px 0'}}>📅 {new Date(event.date).toLocaleDateString()}</p>
              <p style={{margin:'6px 0'}}>📍 {event.location}</p>
              <p style={{margin:'6px 0'}}>👥 {event.attendeesCount || 0} / {event.capacity}</p>
            </div>
            <button onClick={()=>viewAttendees(event)} style={{
              width:'100%',
              padding:'14px',
              background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color:'#fff',
              border:'none',
              borderRadius:10,
              cursor:'pointer',
              fontSize:16,
              fontWeight:600
            }}>👥 View Attendees</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScannerSection(){
  const [events, setEvents] = useState([])
  const [attendees, setAttendees] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const scannerRef = useRef(null)
  const html5QrCode = useRef(null)
  const [lastScan, setLastScan] = useState('')

  useEffect(()=>{
    axios.get('http://localhost:4000/api/events')
      .then(r=>setEvents(r.data))
      .catch(()=>setEvents([]))
  }, [])

  function loadAttendees(eventId){
    axios.get(`http://localhost:4000/api/registrations/${eventId}`)
      .then(r=>setAttendees(r.data))
      .catch(()=>setAttendees([]))
  }

  function openScanner(event){
    setSelectedEvent(event)
    loadAttendees(event.id)
    setScannerOpen(true)
  }

  function closeScanner(){
    if (html5QrCode.current) {
      html5QrCode.current.stop().then(()=>{
        html5QrCode.current = null
      }).catch(()=>{
        html5QrCode.current = null
      })
    }
    setScannerOpen(false)
    setLastScan('')
    setSelectedEvent(null)
  }

  async function startScanner(){
    if (!html5QrCode.current) {
      html5QrCode.current = new Html5Qrcode('qr-reader')
    }
    try{
      await html5QrCode.current.start(
        { facingMode: 'environment' },
        { fps:10, qrbox:250 },
        onScanSuccess,
        ()=>{}
      )
    }catch(err){
      await alertModal('Failed to start camera: ' + err.message)
    }
  }

  function stopScanner(){
    if (html5QrCode.current) {
      html5QrCode.current.stop().catch(()=>{})
    }
  }

  async function onScanSuccess(decodedText){
    if (!selectedEvent) return
    setLastScan(`Scanned: ${decodedText.slice(0,20)}...`)
      try{
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        await axios.post('http://localhost:4000/api/verify', { ticketId: (decodedText || '').trim() }, { headers })
        setLastScan('✓ Check-in successful!')
        loadAttendees(selectedEvent.id)
      }catch(err){
        setLastScan('✗ Check-in failed: ' + (err.response?.data?.message || 'Unknown error'))
      }
  }

  const filteredEvents = events.filter(e=> 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <h2 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#fff'}}>Check-In Scanner</h2>

      <div style={{marginBottom:24}}>
        <input
          type="text"
          placeholder="🔍 Search events..."
          value={searchTerm}
          onChange={e=>setSearchTerm(e.target.value)}
          style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:10,
            color:'#e0e0e0',
            fontSize:15
          }}
        />
      </div>

      {filteredEvents.length === 0 && <p style={{color:'#888'}}>No events found.</p>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:20}}>
        {filteredEvents.map(event=> (
          <div key={event.id} style={{
            background:'#2d2d2d',
            border:'1px solid #404040',
            borderRadius:16,
            padding:24,
            boxShadow:'0 4px 12px rgba(0,0,0,0.2)',
            transition:'all 0.3s'
          }}>
            <h3 style={{margin:'0 0 12px 0',fontSize:20,fontWeight:600,color:'#fff'}}>{event.title}</h3>
            <div style={{fontSize:14,color:'#b0b0b0',marginBottom:16}}>
              <p style={{margin:'6px 0'}}>📅 {new Date(event.date).toLocaleDateString()}</p>
              <p style={{margin:'6px 0'}}>📍 {event.location}</p>
              <p style={{margin:'6px 0'}}>👥 {event.attendeesCount || 0} / {event.capacity}</p>
            </div>
            <button onClick={()=>openScanner(event)} style={{
              width:'100%',
              padding:'14px',
              background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color:'#fff',
              border:'none',
              borderRadius:10,
              cursor:'pointer',
              fontSize:16,
              fontWeight:600
            }}>📷 Scan Attendees</button>
          </div>
        ))}
      </div>

      {scannerOpen && (
        <div style={{
          position:'fixed',
          top:0,
          left:0,
          right:0,
          bottom:0,
          background:'rgba(0,0,0,0.9)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          zIndex:1000,
          padding:'20px'
        }}>
          <div style={{
            background:'#2d2d2d',
            border:'1px solid #404040',
            borderRadius:16,
            padding:'24px',
            maxWidth:'600px',
            width:'100%',
            maxHeight:'90vh',
            overflowY:'auto',
            boxShadow:'0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <h3 style={{margin:0,color:'#fff',fontSize:24,flex:1}}>🎫 {selectedEvent?.title}</h3>
              <button onClick={closeScanner} style={{
                background:'#3a3a3a',
                border:'1px solid #505050',
                color:'#e0e0e0',
                fontSize:24,
                cursor:'pointer',
                borderRadius:'8px',
                width:'36px',
                height:'36px',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                padding:0,
                lineHeight:1
              }}>×</button>
            </div>
            
            <div id="qr-reader" style={{marginBottom:20,borderRadius:12,overflow:'hidden',width:'100%'}}></div>
            
            <div style={{display:'flex',gap:12,marginBottom:16}}>
              <button onClick={startScanner} style={{
                flex:1,
                padding:'14px',
                background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color:'#fff',
                border:'none',
                borderRadius:10,
                cursor:'pointer',
                fontSize:15,
                fontWeight:600
              }}>Start Scanner</button>
              <button onClick={stopScanner} style={{
                flex:1,
                padding:'14px',
                background:'#3a3a3a',
                color:'#e0e0e0',
                border:'1px solid #505050',
                borderRadius:10,
                cursor:'pointer',
                fontSize:15,
                fontWeight:500
              }}>Stop Scanner</button>
            </div>

            {lastScan && (
              <div style={{
                padding:'12px 16px',
                background: lastScan.includes('✓') ? 'rgba(40,167,69,0.15)' : lastScan.includes('✗') ? 'rgba(220,53,69,0.15)' : 'rgba(102,126,234,0.15)',
                border: `1px solid ${lastScan.includes('✓') ? '#28a745' : lastScan.includes('✗') ? '#dc3545' : '#667eea'}`,
                borderRadius:8,
                color: lastScan.includes('✓') ? '#4ade80' : lastScan.includes('✗') ? '#f87171' : '#667eea',
                fontSize:14,
                fontWeight:600,
                marginBottom:16
              }}>{lastScan}</div>
            )}

            <div style={{maxHeight:'200px',overflowY:'auto',background:'#1a1a1a',borderRadius:10,padding:16}}>
              <h4 style={{margin:'0 0 12px 0',color:'#fff',fontSize:16}}>Checked-In Attendees ({attendees.filter(a=>a.status==='checked-in').length})</h4>
              {attendees.filter(a=>a.status==='checked-in').map(a=> (
                <div key={a.id} style={{padding:'8px 0',borderBottom:'1px solid #404040',color:'#b0b0b0',fontSize:14}}>
                  ✓ {a.name} ({a.email})
                </div>
              ))}
              {attendees.filter(a=>a.status==='checked-in').length === 0 && (
                <p style={{color:'#888',fontSize:14,margin:0}}>No checked-in attendees yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ExportSection(){
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(()=>{
    axios.get('http://localhost:4000/api/events')
      .then(r=>setEvents(r.data))
      .catch(()=>setEvents([]))
  }, [])

  async function exportCSV(eventId){
    try{
      const res = await axios.get(`http://localhost:4000/api/reports/${eventId}/export`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `event-${eventId}-attendees.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    }catch(err){
      await alertModal('Export failed')
    }
  }

  async function exportPDF(eventId){
    try{
      const res = await axios.get(`http://localhost:4000/api/reports/${eventId}/export-pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `event-${eventId}-attendees.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    }catch(err){
      await alertModal('PDF export failed: ' + (err.response?.data?.message || err.message || 'Unknown error'))
    }
  }

  const filteredEvents = events.filter(e=> 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <h2 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#fff'}}>Reports/Export</h2>

      <div style={{marginBottom:24}}>
        <input
          type="text"
          placeholder="🔍 Search events..."
          value={searchTerm}
          onChange={e=>setSearchTerm(e.target.value)}
          style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:10,
            color:'#e0e0e0',
            fontSize:15
          }}
        />
      </div>

      {filteredEvents.length === 0 && <p style={{color:'#888'}}>No events available.</p>}

      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        {filteredEvents.map(event=> (
          <div key={event.id} style={{
            background:'#2d2d2d',
            border:'1px solid #404040',
            borderRadius:12,
            padding:24,
            boxShadow:'0 4px 12px rgba(0,0,0,0.2)',
            transition:'all 0.3s'
          }}>
            <div style={{marginBottom:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:12}}>
                <h3 style={{margin:0,fontSize:22,fontWeight:600,color:'#fff'}}>{event.title}</h3>
                <span style={{
                  padding:'6px 12px',
                  background:'rgba(102,126,234,0.15)',
                  color:'#667eea',
                  borderRadius:6,
                  fontSize:14,
                  fontWeight:600
                }}>{event.status || 'upcoming'}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:16,marginTop:16}}>
                <div>
                  <p style={{margin:'4px 0',fontSize:14,color:'#b0b0b0'}}>📅 Date</p>
                  <p style={{margin:'4px 0',fontSize:15,color:'#e0e0e0',fontWeight:500}}>{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p style={{margin:'4px 0',fontSize:14,color:'#b0b0b0'}}>📍 Location</p>
                  <p style={{margin:'4px 0',fontSize:15,color:'#e0e0e0',fontWeight:500}}>{event.location}</p>
                </div>
                <div>
                  <p style={{margin:'4px 0',fontSize:14,color:'#b0b0b0'}}>👥 Registered</p>
                  <p style={{margin:'4px 0',fontSize:15,color:'#e0e0e0',fontWeight:500}}>{event.attendeesCount || 0} / {event.capacity}</p>
                </div>
                <div>
                  <p style={{margin:'4px 0',fontSize:14,color:'#b0b0b0'}}>📊 Fill Rate</p>
                  <p style={{margin:'4px 0',fontSize:15,color:'#667eea',fontWeight:600}}>{((event.attendeesCount||0)/event.capacity*100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
            
            <div style={{borderTop:'1px solid #404040',paddingTop:16,display:'flex',gap:12}}>
              <button onClick={()=>exportPDF(event.id)} style={{
                flex:1,
                padding:'12px',
                background:'#3a3a3a',
                color:'#e0e0e0',
                border:'1px solid #505050',
                borderRadius:8,
                cursor:'pointer',
                fontSize:15,
                fontWeight:500
              }}>📄 Export PDF</button>
              <button onClick={()=>exportCSV(event.id)} style={{
                flex:1,
                padding:'12px',
                background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color:'#fff',
                border:'none',
                borderRadius:8,
                cursor:'pointer',
                fontSize:15,
                fontWeight:600
              }}>📊 Export CSV</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnnouncementsSection(){
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  useEffect(()=>{
    axios.get('http://localhost:4000/api/events')
      .then(r=>setEvents(r.data))
      .catch(()=>setEvents([]))
  }, [])

  function viewDetails(event){
    setSelectedEvent(event)
    setShowForm(false)
  }

  function openAnnounceForm(event){
    setSelectedEvent(event)
    setShowForm(true)
    setSubject('')
    setMessage('')
  }

  async function sendAnnouncement(){
    if (!selectedEvent || !subject || !message) {
      await alertModal('Event, subject, and message are required')
      return
    }
    
    try {
      setAuthHeader()
      const res = await axios.post('http://localhost:4000/api/announcements', {
        eventId: selectedEvent.id,
        subject,
        message
      })
      
      await alertModal(res.data.message || `Announcement sent to ${res.data.recipientCount} attendee(s)`)
      setShowForm(false)
      setSelectedEvent(null)
      setSubject('')
      setMessage('')
    } catch (err) {
      await alertModal(err?.response?.data?.message || 'Failed to send announcement')
    }
  }

  function closeAnnouncementForm(){
    setShowForm(false)
    setSelectedEvent(null)
    setSubject('')
    setMessage('')
  }

  const filteredEvents = events.filter(e=> 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <h2 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#fff'}}>Announcements</h2>

      <div style={{marginBottom:24}}>
        <input
          type="text"
          placeholder="🔍 Search events..."
          value={searchTerm}
          onChange={e=>setSearchTerm(e.target.value)}
          style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:10,
            color:'#e0e0e0',
            fontSize:15
          }}
        />
      </div>

      {filteredEvents.length === 0 && <p style={{color:'#888'}}>No events available.</p>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:20}}>
        {filteredEvents.map(event=> (
          <div key={event.id} style={{
            background:'#2d2d2d',
            border:'1px solid #404040',
            borderRadius:16,
            padding:24,
            boxShadow:'0 4px 12px rgba(0,0,0,0.2)',
            transition:'all 0.3s'
          }}>
            <h3 style={{margin:'0 0 12px 0',fontSize:20,fontWeight:600,color:'#fff'}}>{event.title}</h3>
            <div style={{fontSize:14,color:'#b0b0b0',marginBottom:16}}>
              <p style={{margin:'6px 0'}}>📅 {new Date(event.date).toLocaleDateString()}</p>
              <p style={{margin:'6px 0'}}>📍 {event.location}</p>
              <p style={{margin:'6px 0'}}>👥 {event.attendeesCount || 0} attendees</p>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>viewDetails(event)} style={{
                flex:1,
                padding:'12px',
                background:'#3a3a3a',
                color:'#e0e0e0',
                border:'1px solid #505050',
                borderRadius:8,
                cursor:'pointer',
                fontSize:14,
                fontWeight:500
              }}>📋 View Details</button>
              <button onClick={()=>openAnnounceForm(event)} style={{
                flex:1,
                padding:'12px',
                background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color:'#fff',
                border:'none',
                borderRadius:8,
                cursor:'pointer',
                fontSize:14,
                fontWeight:600
              }}>📣 Announce</button>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && !showForm && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{width:'95%',maxWidth:760,maxHeight:'86vh',overflowY:'auto',background:'#121212',borderRadius:12,padding:24,border:'1px solid rgba(255,255,255,0.04)',boxShadow:'0 12px 30px rgba(0,0,0,0.6)',fontFamily:'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial',color:'#e6e6e6'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h2 style={{margin:0,color:'#fff',fontSize:32,fontWeight:800,letterSpacing:0.5}}>Event Details</h2>
              <button onClick={()=>setSelectedEvent(null)} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.06)',color:'#fff',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontSize:16}}>Close</button>
            </div>

            <div style={{color:'#e6e6e6'}}>
              <h3 style={{margin:'6px 0 12px 0',fontSize:26,fontWeight:800,letterSpacing:0.2}}>{selectedEvent.title}</h3>
              <p style={{color:'#bdbdbd',lineHeight:1.6,marginBottom:16}}>{selectedEvent.description}</p>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,fontSize:14,color:'#cfcfcf'}}>
                <div style={{padding:6}}>
                  <div style={{fontSize:15,color:'#9aa4ff',marginBottom:6,letterSpacing:0.8,fontWeight:700}}>DATE & TIME</div>
                  <div style={{fontWeight:600}}>{new Date(selectedEvent.date).toLocaleString()}</div>
                </div>
                <div style={{padding:6}}>
                  <div style={{fontSize:15,color:'#9aa4ff',marginBottom:6,letterSpacing:0.8,fontWeight:700}}>LOCATION</div>
                  <div style={{fontWeight:600}}>{selectedEvent.location}</div>
                </div>
              </div>

              <div style={{marginTop:18}}>
                <div style={{fontSize:15,color:'#9aa4ff',marginBottom:8,letterSpacing:0.8,fontWeight:700}}>ATTENDANCE</div>
                <div style={{height:12,background:'#0f0f0f',borderRadius:8,overflow:'hidden',border:'1px solid rgba(255,255,255,0.03)'}}>
                  <div style={{height:'100%',background:'linear-gradient(90deg,#667eea,#764ba2)',width:Math.min(100, Math.round(((selectedEvent.attendeesCount||0)/(selectedEvent.capacity||1))*100)) + '%'}} />
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8,color:'#9fb0ff'}}>
                  <div style={{fontSize:15,color:'#7fb0ff'}}>{Math.max(0, (selectedEvent.capacity || 0) - (selectedEvent.attendeesCount || 0))} spots remaining</div>
                  <div style={{fontSize:15,color:'#cfcfcf'}}>{selectedEvent.attendeesCount || 0} / {selectedEvent.capacity || 0}</div>
                </div>
              </div>

              <button onClick={()=>openAnnounceForm(selectedEvent)} style={{width:'100%',marginTop:20,padding:'14px 18px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:15}}>Make Announcement</button>
              <div style={{marginTop:12,color:selectedEvent.status === 'checked-in' ? '#4ade80' : '#9aa4ff',fontWeight:700,fontSize:16}}>{selectedEvent.status || 'upcoming'}</div>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && showForm && (
        <div style={{
          position:'fixed',
          top:0,
          left:0,
          right:0,
          bottom:0,
          background:'rgba(0,0,0,0.85)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          zIndex:1000,
          padding:20
        }}>
          <div style={{
            background:'#2d2d2d',
            border:'1px solid #404040',
            borderRadius:16,
            padding:32,
            maxWidth:600,
            width:'100%',
            boxShadow:'0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <h3 style={{margin:0,color:'#fff',fontSize:24}}>📣 Send Announcement</h3>
              <button onClick={closeAnnouncementForm} style={{
                background:'transparent',
                border:'none',
                color:'#888',
                fontSize:28,
                cursor:'pointer'
              }}>×</button>
            </div>
            
            <div style={{marginBottom:20}}>
              <h4 style={{margin:'0 0 8px 0',fontSize:18,fontWeight:600,color:'#fff'}}>{selectedEvent.title}</h4>
              <p style={{margin:'0 0 20px 0',fontSize:14,color:'#888'}}>This will send an email to all {selectedEvent.attendeesCount || 0} registered attendees.</p>
              
              <div style={{marginBottom:16}}>
                <label style={{display:'block',marginBottom:8,fontSize:14,fontWeight:500,color:'#b0b0b0'}}>Subject</label>
                <input 
                  type="text"
                  value={subject} 
                  onChange={e=>setSubject(e.target.value)} 
                  placeholder="Event Update"
                  style={{
                    width:'calc(100% - 32px)',
                    padding:'12px 16px',
                    background:'#1a1a1a',
                    border:'1px solid #404040',
                    borderRadius:10,
                    color:'#e0e0e0',
                    fontSize:15
                  }}
                />
              </div>

              <div style={{marginBottom:20}}>
                <label style={{display:'block',marginBottom:8,fontSize:14,fontWeight:500,color:'#b0b0b0'}}>Message</label>
                <textarea 
                  value={message} 
                  onChange={e=>setMessage(e.target.value)} 
                  rows={8}
                  placeholder="Enter your announcement message..."
                  style={{
                    width:'calc(100% - 32px)',
                    padding:'12px 16px',
                    background:'#1a1a1a',
                    border:'1px solid #404040',
                    borderRadius:10,
                    color:'#e0e0e0',
                    fontSize:15,
                    fontFamily:'inherit',
                    resize:'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{display:'flex',gap:12}}>
              <button onClick={closeAnnouncementForm} style={{
                flex:1,
                padding:'12px',
                background:'#3a3a3a',
                color:'#e0e0e0',
                border:'1px solid #505050',
                borderRadius:10,
                cursor:'pointer',
                fontSize:15,
                fontWeight:500
              }}>Cancel</button>
              <button onClick={sendAnnouncement} style={{
                flex:1,
                padding:'12px',
                background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color:'#fff',
                border:'none',
                borderRadius:10,
                cursor:'pointer',
                fontSize:15,
                fontWeight:600
              }}>Send to All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OrganizerLogin({ onLogin }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function doLogin(){
    try{
      const res = await axios.post('http://localhost:4000/api/auth/login', { username, password })
      const { token, role } = res.data
      
      if (role !== 'organizer' && role !== 'admin') {
        await alertModal('Access denied. Organizer or admin role required.')
        return
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('userRole', role)
      onLogin && onLogin(role)
    }catch(err){ await alertModal(err?.response?.data?.message || 'Login failed') }
  }

  return (
    <div>
      <div><input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} /></div>
      <div><input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
      <div style={{marginTop:12}}><button onClick={doLogin}>Login</button></div>
    </div>
  )
}
