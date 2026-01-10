import React, { useState, useEffect } from 'react'
import axios from 'axios'

function setAuthHeader(){
  const token = localStorage.getItem('token')
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default function AdminPanel(){
  const [activeSection, setActiveSection] = useState('home')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    const savedRole = localStorage.getItem('userRole')
    if (token && savedRole === 'admin') {
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
    setActiveSection('home')
  }

  if (!isLoggedIn || userRole !== 'admin') {
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
        <h2 style={{margin:'0 0 32px 0',fontSize:22,fontWeight:700,color:'#fff'}}>Admin Panel</h2>
        <nav style={{flex:1}}>
          <SidebarItem label="Home" active={activeSection==='home'} onClick={()=>setActiveSection('home')} />
          <SidebarItem label="My Tickets" active={activeSection==='tickets'} onClick={()=>setActiveSection('tickets')} />
          <SidebarItem label="Organizer Dashboard" active={activeSection==='organizer'} onClick={()=>setActiveSection('organizer')} />
          <SidebarItem label="Manage Users" active={activeSection==='users'} onClick={()=>setActiveSection('users')} />
          <SidebarItem label="Reports" active={activeSection==='reports'} onClick={()=>setActiveSection('reports')} />
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
        {activeSection === 'home' && <EventsListSection />}
        {activeSection === 'tickets' && <MyTicketsSection />}
        {activeSection === 'organizer' && <OrganizerDashboardSection />}
        {activeSection === 'users' && <ManageUsersSection />}
        {activeSection === 'reports' && <ReportsSection />}
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

function EventsListSection(){
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(()=>{ fetchEvents() }, [])

  function fetchEvents(){
    axios.get('http://localhost:4000/api/events')
      .then(r=>setEvents(r.data))
      .catch(()=>setEvents([]))
  }

  const filtered = events.filter(e=>{
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                        e.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div>
      <h2 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#fff'}}>Events List</h2>
      
      <div style={{display:'flex',gap:12,marginBottom:24}}>
        <input
          placeholder="Search events..."
          value={search}
          onChange={e=>setSearch(e.target.value)}
          style={{
            flex:1,
            padding:'12px 16px',
            background:'#2d2d2d',
            border:'1px solid #404040',
            borderRadius:8,
            color:'#e0e0e0',
            fontSize:15,
            outline:'none'
          }}
          onFocus={e=>e.target.style.borderColor='#667eea'}
          onBlur={e=>e.target.style.borderColor='#404040'}
        />
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{
          padding:'12px 16px',
          background:'#2d2d2d',
          border:'1px solid #404040',
          borderRadius:8,
          color:'#e0e0e0',
          fontSize:15,
          outline:'none',
          cursor:'pointer'
        }}>
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:20}}>
        {filtered.map(ev=> (
          <EventCard key={ev.id} event={ev} onUpdate={fetchEvents} />
        ))}
      </div>

      {filtered.length === 0 && <p style={{color:'#888',fontSize:16}}>No events found.</p>}
    </div>
  )
}

function EventCard({ event, onUpdate }){
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <div style={{
        background:'#2d2d2d',
        border:'1px solid #404040',
        borderRadius:12,
        padding:20,
        transition:'all 0.3s',
        cursor:'pointer',
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
        <h3 style={{margin:'0 0 12px 0',fontSize:20,fontWeight:600,color:'#fff'}}>{event.title}</h3>
        <p style={{margin:'4px 0',fontSize:14,color:'#b0b0b0'}}>
          📅 {new Date(event.date).toLocaleDateString()} • 📍 {event.location}
        </p>
        <p style={{margin:'8px 0',fontSize:14,color:'#b0b0b0'}}>
          👥 Capacity: {event.attendeesCount || 0} / {event.capacity}
        </p>
        <p style={{margin:'4px 0',fontSize:14}}>
          Status: <strong style={{color:'#667eea'}}>{event.status || 'upcoming'}</strong>
        </p>
        <div style={{display:'flex',gap:10,marginTop:16}}>
          <button onClick={()=>setShowDetails(true)} style={{
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
          <button onClick={()=>setShowDetails(true)} style={{
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
      {showDetails && <EventDetailsModal event={event} onClose={()=>{setShowDetails(false); onUpdate()}} />}
    </>
  )
}

function EventDetailsModal({ event, onClose }){
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({...event})

  async function handleSave(){
    try{
      await axios.put(`http://localhost:4000/api/events/${event.id}`, formData)
      alert('Event updated')
      setEditing(false)
      onClose()
    }catch(err){
      alert('Update failed: ' + (err?.response?.data?.message || err.message))
    }
  }

  async function handleDelete(){
    if (!confirm('Delete this event? This cannot be undone.')) return
    try{
      await axios.delete(`http://localhost:4000/api/events/${event.id}`)
      alert('Event deleted')
      onClose()
    }catch(err){
      alert('Delete failed: ' + (err?.response?.data?.message || err.message))
    }
  }

  return (
    <div style={{
      position:'fixed',top:0,left:0,right:0,bottom:0,
      background:'rgba(0,0,0,0.5)',
      display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:1000
    }}>
      <div className="card" style={{width:'90%',maxWidth:600,maxHeight:'80vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h2 style={{margin:0}}>Event Details</h2>
          <button onClick={onClose}>Close</button>
        </div>

        {!editing ? (
          <div>
            <p><strong>Title:</strong> {event.title}</p>
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Capacity:</strong> {event.capacity}</p>
            <p><strong>Attendees:</strong> {event.attendeesCount || 0}</p>
            <p><strong>Status:</strong> {event.status || 'upcoming'}</p>
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <button onClick={()=>setEditing(true)}>Edit</button>
              <button onClick={handleDelete} style={{background:'#dc3545'}}>Delete</button>
            </div>
          </div>
        ) : (
          <div>
            <div><label>Title</label><input value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} /></div>
            <div><label>Description</label><textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} /></div>
            <div><label>Date</label><input type="datetime-local" value={formData.date?.slice(0,16)} onChange={e=>setFormData({...formData,date:new Date(e.target.value).toISOString()})} /></div>
            <div><label>Location</label><input value={formData.location} onChange={e=>setFormData({...formData,location:e.target.value})} /></div>
            <div><label>Capacity</label><input type="number" value={formData.capacity} onChange={e=>setFormData({...formData,capacity:parseInt(e.target.value)})} /></div>
            <div><label>Status</label>
              <select value={formData.status || 'upcoming'} onChange={e=>setFormData({...formData,status:e.target.value})}>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <button onClick={handleSave}>Save</button>
              <button onClick={()=>setEditing(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MyTicketsSection(){
  const [tickets, setTickets] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetchData()
  }, [])

  async function fetchData(){
    try{
      const [ticketsRes, eventsRes] = await Promise.all([
        axios.get('http://localhost:4000/api/registrations/my-tickets'),
        axios.get('http://localhost:4000/api/events')
      ])
      setTickets(ticketsRes.data)
      setEvents(eventsRes.data)
    }catch(err){
      console.error('Failed to fetch:', err)
    }finally{
      setLoading(false)
    }
  }

  if (loading) {
    return <div><h2 style={{color:'#fff'}}>My Tickets</h2><p style={{color:'#888'}}>Loading...</p></div>
  }

  return (
    <div>
      <h2 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#fff'}}>My Tickets</h2>
      {tickets.length === 0 && (
        <div style={{
          textAlign:'center',
          padding:'60px 20px',
          background:'#2d2d2d',
          border:'1px solid #404040',
          borderRadius:16,
          boxShadow:'0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{fontSize:64,marginBottom:16}}>🎫</div>
          <h3 style={{color:'#fff',marginBottom:8}}>No tickets yet</h3>
          <p style={{color:'#888',margin:0}}>Register for an event to get your tickets!</p>
        </div>
      )}
      
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))',gap:20}}>
        {tickets.map(t=>{
          const ev = events.find(e=>e.id===t.eventId)
          if(!ev) return null
          return (
            <div key={t.id} style={{
              background:'#2d2d2d',
              border:'1px solid #404040',
              borderRadius:16,
              padding:24,
              boxShadow:'0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <h4 style={{margin:'0 0 16px 0',fontSize:20,fontWeight:600,color:'#fff'}}>{t.eventTitle || ev.title}</h4>
              <div style={{fontSize:14,color:'#b0b0b0',marginBottom:16}}>
                <p style={{margin:'0 0 8px 0'}}><strong style={{color:'#999'}}>Name:</strong> {t.name}</p>
                <p style={{margin:'0 0 8px 0'}}><strong style={{color:'#999'}}>Email:</strong> {t.email}</p>
                {t.company && <p style={{margin:'0 0 8px 0'}}><strong style={{color:'#999'}}>Company:</strong> {t.company}</p>}
                <p style={{margin:'0 0 8px 0'}}><strong style={{color:'#999'}}>Ticket ID:</strong> {t.id.slice(0,16)}...</p>
              </div>
              {t.qr && (
                <div style={{textAlign:'center',marginBottom:16,padding:16,background:'#fff',borderRadius:12}}>
                  <img src={t.qr} alt="QR Code" style={{width:180,height:180,display:'block',margin:'0 auto'}} />
                </div>
              )}
              <div style={{
                padding:'12px 16px',
                background: t.status === 'checked-in' ? 'rgba(40,167,69,0.15)' : 'rgba(102,126,234,0.15)',
                border: `1px solid ${t.status === 'checked-in' ? '#28a745' : '#667eea'}`,
                borderRadius:8,
                textAlign:'center'
              }}>
                <span style={{
                  fontSize:14,
                  fontWeight:600,
                  color: t.status === 'checked-in' ? '#4ade80' : '#667eea'
                }}>
                  {t.status === 'checked-in' ? '✓ Checked In' : 'Ready to Scan'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrganizerDashboardSection(){
  const [events, setEvents] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [editEvent, setEditEvent] = useState(null)

  useEffect(()=>{ fetchEvents() }, [])

  function fetchEvents(){
    axios.get('http://localhost:4000/api/events')
      .then(r=>setEvents(r.data))
      .catch(()=>setEvents([]))
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{margin:0,fontSize:28,fontWeight:700,color:'#fff'}}>Organizer Dashboard</h2>
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
            <p style={{margin:'4px 0',fontSize:14}}>
              Status: <strong style={{color:'#667eea'}}>{ev.status || 'upcoming'}</strong>
            </p>
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button onClick={()=>setEditEvent(ev)} style={{
                flex:1,
                padding:'10px',
                background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color:'#fff',
                border:'none',
                borderRadius:8,
                cursor:'pointer',
                fontSize:14,
                fontWeight:600
              }}>Edit</button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div style={{
          textAlign:'center',
          padding:'60px 20px',
          background:'#2d2d2d',
          border:'1px solid #404040',
          borderRadius:16,
          boxShadow:'0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{fontSize:64,marginBottom:16}}>📅</div>
          <h3 style={{color:'#fff',marginBottom:8}}>No events yet</h3>
          <p style={{color:'#888',margin:0}}>Create your first event to get started!</p>
        </div>
      )}

      {showCreate && <EventFormModal onClose={()=>{setShowCreate(false); fetchEvents()}} />}
      {editEvent && <EventFormModal event={editEvent} onClose={()=>{setEditEvent(null); fetchEvents()}} />}
    </div>
  )
}

function ManageUsersSection(){
  const [users, setUsers] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('organizer')

  useEffect(()=>{ fetchUsers() }, [])

  async function fetchUsers(){
    try{
      const res = await axios.get('http://localhost:4000/api/admin/users')
      setUsers(res.data)
    }catch(err){
      alert('Failed to load users')
    }
  }

  async function createUser(){
    if (!username || !password) return alert('username and password required')
    try{
      await axios.post('http://localhost:4000/api/admin/users', { username, password, role })
      setUsername(''); setPassword(''); setRole('organizer')
      fetchUsers()
    }catch(err){ alert('Create failed') }
  }

  async function toggleActive(u){
    try{
      await axios.patch(`http://localhost:4000/api/admin/users/${u.id}`, { active: !u.active })
      fetchUsers()
    }catch(err){ alert('Update failed') }
  }

  async function changeRole(u, newRole){
    try{
      await axios.patch(`http://localhost:4000/api/admin/users/${u.id}`, { role: newRole })
      fetchUsers()
    }catch(err){ alert('Update failed') }
  }

  return (
    <div>
      <h2 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#fff'}}>Manage Users</h2>

      <div style={{
        background:'#2d2d2d',
        border:'1px solid #404040',
        borderRadius:12,
        padding:24,
        marginBottom:20,
        boxShadow:'0 4px 12px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{margin:'0 0 20px 0',fontSize:20,color:'#fff'}}>Create User</h3>
        <div style={{marginBottom:16}}>
          <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:8,
            color:'#e0e0e0',
            fontSize:15,
            outline:'none'
          }} />
        </div>
        <div style={{marginBottom:16}}>
          <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:8,
            color:'#e0e0e0',
            fontSize:15,
            outline:'none'
          }} />
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:'block',marginBottom:8,color:'#b0b0b0',fontSize:14}}>Role</label>
          <select value={role} onChange={e=>setRole(e.target.value)} style={{
            width:'100%',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:8,
            color:'#e0e0e0',
            fontSize:15,
            outline:'none',
            cursor:'pointer'
          }}>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button onClick={createUser} style={{
          padding:'12px 24px',
          background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color:'#fff',
          border:'none',
          borderRadius:8,
          cursor:'pointer',
          fontSize:15,
          fontWeight:600
        }}>Create</button>
      </div>

      <div style={{
        background:'#2d2d2d',
        border:'1px solid #404040',
        borderRadius:12,
        padding:24,
        boxShadow:'0 4px 12px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{margin:'0 0 20px 0',fontSize:20,color:'#fff'}}>Users</h3>
        {users.map(u=> (
          <div key={u.id} style={{display:'flex',gap:12,alignItems:'center',padding:'16px 0',borderBottom:'1px solid #404040'}}>
            <div style={{flex:1}}>
              <strong style={{color:'#fff',fontSize:16}}>{u.username}</strong>
              <span style={{marginLeft:12,fontSize:14,color:'#667eea',padding:'4px 8px',background:'rgba(102,126,234,0.15)',borderRadius:4}}>{u.role}</span>
              <span style={{marginLeft:12,fontSize:14,color:u.active?'#4ade80':'#ff6b6b',fontWeight:500}}>
                {u.active ? '● Active' : '● Disabled'}
              </span>
            </div>
            <button onClick={()=>toggleActive(u)} style={{
              padding:'8px 16px',
              background:u.active?'#dc3545':'#28a745',
              color:'#fff',
              border:'none',
              borderRadius:6,
              cursor:'pointer',
              fontSize:14,
              fontWeight:500
            }}>{u.active ? 'Disable' : 'Enable'}</button>
            <select value={u.role} onChange={e=>changeRole(u, e.target.value)} style={{
              padding:'8px 12px',
              background:'#1a1a1a',
              border:'1px solid #404040',
              borderRadius:6,
              color:'#e0e0e0',
              fontSize:14,
              outline:'none',
              cursor:'pointer'
            }}>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
      {showCreate && <EventFormModal onClose={()=>{setShowCreate(false); fetchEvents()}} />}
      {editEvent && <EventFormModal event={editEvent} onClose={()=>{setEditEvent(null); fetchEvents()}} />}
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
      return alert('Title, date, and location are required')
    }
    try{
      if (isEdit) {
        await axios.put(`http://localhost:4000/api/events/${event.id}`, formData)
        alert('Event updated')
      } else {
        await axios.post('http://localhost:4000/api/events', formData)
        alert('Event created')
      }
      onClose()
    }catch(err){
      alert('Save failed: ' + (err?.response?.data?.message || err.message))
    }
  }

  async function handleDelete(){
    if (!confirm('Delete this event? This cannot be undone.')) return
    try{
      await axios.delete(`http://localhost:4000/api/events/${event.id}`)
      alert('Event deleted')
      onClose()
    }catch(err){
      alert('Delete failed')
    }
  }

  return (
    <div style={{
      position:'fixed',top:0,left:0,right:0,bottom:0,
      background:'rgba(0,0,0,0.85)',
      display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:1000,
      backdropFilter:'blur(4px)'
    }}>
      <div style={{
        background:'#2d2d2d',
        border:'1px solid #404040',
        borderRadius:16,
        padding:32,
        width:'90%',
        maxWidth:600,
        maxHeight:'80vh',
        overflowY:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{margin:'0 0 24px 0',fontSize:24,color:'#fff'}}>{isEdit ? 'Edit Event' : 'Create Event'}</h2>
        <div style={{marginBottom:16}}>
          <label style={{display:'block',marginBottom:8,color:'#b0b0b0',fontSize:14}}>Title *</label>
          <input value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:8,
            color:'#e0e0e0',
            fontSize:15,
            outline:'none'
          }} />
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:'block',marginBottom:8,color:'#b0b0b0',fontSize:14}}>Description</label>
          <textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:8,
            color:'#e0e0e0',
            fontSize:15,
            outline:'none',
            minHeight:80,
            resize:'vertical'
          }} />
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:'block',marginBottom:8,color:'#b0b0b0',fontSize:14}}>Date & Time *</label>
          <input type="datetime-local" value={formData.date?.slice(0,16)} onChange={e=>setFormData({...formData,date:new Date(e.target.value).toISOString()})} style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:8,
            color:'#e0e0e0',
            fontSize:15,
            outline:'none'
          }} />
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:'block',marginBottom:8,color:'#b0b0b0',fontSize:14}}>Location *</label>
          <input value={formData.location} onChange={e=>setFormData({...formData,location:e.target.value})} style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:8,
            color:'#e0e0e0',
            fontSize:15,
            outline:'none'
          }} />
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:'block',marginBottom:8,color:'#b0b0b0',fontSize:14}}>Capacity</label>
          <input type="number" value={formData.capacity} onChange={e=>setFormData({...formData,capacity:parseInt(e.target.value)})} style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:8,
            color:'#e0e0e0',
            fontSize:15,
            outline:'none'
          }} />
        </div>
        <div style={{marginBottom:24}}>
          <label style={{display:'block',marginBottom:8,color:'#b0b0b0',fontSize:14}}>Status</label>
          <select value={formData.status || 'upcoming'} onChange={e=>setFormData({...formData,status:e.target.value})} style={{
            width:'100%',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:8,
            color:'#e0e0e0',
            fontSize:15,
            outline:'none',
            cursor:'pointer'
          }}>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div style={{display:'flex',gap:12,borderTop:'1px solid #404040',paddingTop:20}}>
          <button onClick={handleSave} style={{
            flex:1,
            padding:'12px',
            background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color:'#fff',
            border:'none',
            borderRadius:8,
            cursor:'pointer',
            fontSize:15,
            fontWeight:600
          }}>{isEdit ? 'Save Changes' : 'Create Event'}</button>
          {isEdit && <button onClick={handleDelete} style={{
            padding:'12px 24px',
            background:'#dc3545',
            color:'#fff',
            border:'none',
            borderRadius:8,
            cursor:'pointer',
            fontSize:15,
            fontWeight:600
          }}>Delete</button>}
          <button onClick={onClose} style={{
            padding:'12px 24px',
            background:'#3a3a3a',
            color:'#e0e0e0',
            border:'1px solid #505050',
            borderRadius:8,
            cursor:'pointer',
            fontSize:15,
            fontWeight:500
          }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function ReportsSection(){
  const [events, setEvents] = useState([])

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
      link.setAttribute('download', `event-${eventId}-report.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    }catch(err){
      alert('Export failed')
    }
  }

  async function exportPDF(eventId){
    alert('PDF export coming soon! Use CSV for now.')
  }

  return (
    <div>
      <h2 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#fff'}}>Reports & Exports</h2>

      {events.length === 0 && <p style={{color:'#888'}}>No events available.</p>}

      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        {events.map(event=> (
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

function AdminLogin({ onLogin }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function doLogin(){
    try{
      const res = await axios.post('http://localhost:4000/api/auth/login', { username, password })
      const { token, role } = res.data
      
      if (role !== 'admin') {
        alert('Access denied. Admin role required.')
        return
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('userRole', role)
      onLogin && onLogin(role)
    }catch(err){ alert(err?.response?.data?.message || 'Login failed') }
  }

  return (
    <div>
      <div><input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} /></div>
      <div><input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
      <div style={{marginTop:12}}><button onClick={doLogin}>Login</button></div>
    </div>
  )
}
