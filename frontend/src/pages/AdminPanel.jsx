import React, { useState, useEffect, lazy, Suspense } from 'react'
import axios from 'axios'
import MonitorAttendeesSection from './MonitorAttendeesSection'
import confirmModal from '../utils/confirm'
import alertModal from '../utils/alert'
import { API_URL } from '../config/api'

function setAuthHeader(){
  const token = localStorage.getItem('token')
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

async function downloadImage(url, filename = 'ticket-qr.png'){
  try{
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement('a')
    const objectUrl = URL.createObjectURL(blob)
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
  }catch(err){
    await alertModal('Failed to download QR')
  }
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
    // notify top-level app to update auth state and show Landing
    try{ window.dispatchEvent(new Event('user-logged-out')) }catch(e){}
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
          <SidebarItem label="Monitor Attendees" active={activeSection==='monitor'} onClick={()=>setActiveSection('monitor')} />
          <SidebarItem label="Manage Users" active={activeSection==='users'} onClick={()=>setActiveSection('users')} />
          <SidebarItem label="Reports/Export" active={activeSection==='reports'} onClick={()=>setActiveSection('reports')} />
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
        {activeSection === 'monitor' && <MonitorAttendeesSection />}
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
    axios.get('${API_URL}/api/events')
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
  const [initialEditing, setInitialEditing] = useState(false)

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
        <p style={{margin:'4px 0',fontSize:14,color:'#b0b0b0'}}>
          Status: <strong style={{color:'#fff'}}>{event.status || 'upcoming'}</strong>
        </p>
        <div style={{display:'flex',gap:10,marginTop:16}}>
          <button onClick={()=>{ setInitialEditing(false); setShowDetails(true); }} style={{
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
          <button onClick={()=>{ setInitialEditing(true); setShowDetails(true); }} style={{
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
      {showDetails && <EventDetailsModal event={event} initialEditing={initialEditing} onClose={()=>{setShowDetails(false); setInitialEditing(false); onUpdate()}} />}
    </>
  )
}

function EventDetailsModal({ event, onClose, initialEditing = false }){
  const [editing, setEditing] = useState(Boolean(initialEditing))
  const [formData, setFormData] = useState({...event})

  async function handleSave(){
    try{
      await axios.put(`${API_URL}/api/events/` + event.id, formData)
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
      await axios.delete(`${API_URL}/api/events/` + event.id)
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

function MyTicketsSection(){
  const [tickets, setTickets] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(()=>{
    fetchData()
  }, [])

  async function fetchData(){
    try{
      setAuthHeader() // Set authorization header before making requests
      const [ticketsRes, eventsRes] = await Promise.all([
        axios.get('${API_URL}/api/registrations/my-tickets'),
        axios.get('${API_URL}/api/events')
      ])
      setTickets(ticketsRes.data)
      setEvents(eventsRes.data)
    }catch(err){
      console.error('Failed to fetch:', err)
      // If token expired or invalid, clear token and reload
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        window.location.reload()
      }
    }finally{
      setLoading(false)
    }
  }

  if (loading) {
    return <div><h2 style={{color:'#fff'}}>My Tickets</h2><p style={{color:'#888'}}>Loading...</p></div>;
  }

  const RegisterTicketPage = lazy(() => import('./RegisterTicketPage'));
  if (showRegister) {
    return (
      <Suspense fallback={<div style={{color:'#fff'}}>Loading registration form...</div>}>
        <RegisterTicketPage onRegistered={() => { setShowRegister(false); fetchData(); }} />
      </Suspense>
    );
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{margin:0,fontSize:28,fontWeight:700,color:'#fff'}}>My Tickets</h2>
        <button onClick={()=>setShowRegister(true)} style={{
          padding:'12px 24px',
          background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color:'#fff',
          border:'none',
          borderRadius:8,
          cursor:'pointer',
          fontSize:15,
          fontWeight:600,
          boxShadow:'0 4px 12px rgba(102,126,234,0.4)'
        }}>Register for a Ticket</button>
      </div>
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
          return <AdminTicketCard key={t.id} t={t} ev={ev} fetchData={fetchData} />
        })}
      </div>
    </div>
  );
}

function AdminTicketCard({ t, ev, fetchData }){
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: t.name, email: t.email, company: t.company })
  const [saving, setSaving] = useState(false)

  async function save(){
    setSaving(true)
    try{
      const token = localStorage.getItem('token')
      if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      await axios.patch(`${API_URL}/api/registrations/${t.id}`, form)
      await alertModal('Updated')
      setEditing(false)
      fetchData()
    }catch(err){
      await alertModal(err?.response?.data?.message || 'Update failed')
    }finally{ setSaving(false) }
  }

  async function cancelRegistration(){
    if(!(await confirmModal('Cancel this registration?'))) return
    try{
      const token = localStorage.getItem('token')
      if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      await axios.delete(`${API_URL}/api/registrations/${t.id}`)
      await alertModal('Registration cancelled')
      fetchData()
    }catch(err){
      await alertModal(err?.response?.data?.message || 'Cancel failed')
    }
  }

  return (
    <div style={{position:'relative',background:'#2d2d2d',border:'1px solid #404040',borderRadius:16,padding:24,boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>
      <div style={{position:'absolute',top:12,right:12}}>
        {!editing ? (
          <div style={{padding:'8px 12px',borderRadius:8,background: t.status === 'checked-in' ? 'rgba(40,167,69,0.15)' : 'rgba(255,193,7,0.15)',border: `1px solid ${t.status === 'checked-in' ? '#28a745' : '#ffc107'}`}}>
            <span style={{fontSize:13,fontWeight:700,color: t.status === 'checked-in' ? '#4ade80' : '#ffc107'}}>{t.status === 'checked-in' ? '✓ Scanned' : '⏳ Not Scanned'}</span>
          </div>
        ) : (
          <button onClick={()=>setEditing(false)} aria-label="Close edit" style={{background:'#2a2a2a',border:'1px solid #404040',color:'#fff',width:36,height:36,borderRadius:18,cursor:'pointer',fontSize:16}}>✕</button>
        )}
      </div>

      {!editing ? (
        <>
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
        </>
      ) : (
        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:8,color:'#b0b0b0'}}>Full name</label>
          <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{width:'calc(100% - 32px)',marginLeft:16,marginRight:16,padding:'10px',borderRadius:8,background:'#1a1a1a',border:'1px solid #404040',color:'#e0e0e0'}} />
          <label style={{display:'block',margin:'12px 0 8px 0',color:'#b0b0b0'}}>Email</label>
          <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{width:'calc(100% - 32px)',marginLeft:16,marginRight:16,padding:'10px',borderRadius:8,background:'#1a1a1a',border:'1px solid #404040',color:'#e0e0e0'}} />
          <label style={{display:'block',margin:'12px 0 8px 0',color:'#b0b0b0'}}>Company</label>
          <input value={form.company} onChange={e=>setForm({...form,company:e.target.value})} style={{width:'calc(100% - 32px)',marginLeft:16,marginRight:16,padding:'10px',borderRadius:8,background:'#1a1a1a',border:'1px solid #404040',color:'#e0e0e0'}} />
        </div>
      )}

      <div style={{display:'flex',gap:12,marginTop:16,justifyContent:'flex-end'}}>
        {!editing ? (
          <>
            <button onClick={()=>downloadImage(t.qr, `${(t.eventTitle||'ticket').replace(/[^a-z0-9-_]/gi,'_')}-${t.id.slice(0,8)}.png`)} style={{padding:'10px 14px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700}}>Download QR</button>
            <button onClick={()=>setEditing(true)} style={{padding:'10px 14px',background:'#3a3a3a',color:'#fff',border:'1px solid #505050',borderRadius:8,cursor:'pointer'}}>Edit Registration</button>
          </>
        ) : (
          <>
            <button onClick={save} disabled={saving} style={{padding:'10px 14px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',color:'#fff',border:'none',borderRadius:8,cursor:saving?'wait':'pointer'}}>{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={cancelRegistration} style={{padding:'10px 14px',background:'#dc3545',color:'#fff',border:'none',borderRadius:8,cursor:'pointer'}}>Cancel Registration</button>
          </>
        )}
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
    axios.get('${API_URL}/api/events')
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
      {editEvent && <EventDetailsModal event={editEvent} initialEditing={true} onClose={()=>{setEditEvent(null); fetchEvents()}} />}
    </div>
  )
}

function ManageUsersSection(){
  const [users, setUsers] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('organizer')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(()=>{ fetchUsers() }, [])

  async function fetchUsers(){
    try{
      const res = await axios.get('${API_URL}/api/admin/users')
      setUsers(res.data)
    }catch(err){
      await alertModal('Failed to load users')
    }
  }

  async function createUser(){
    if (!username || !password) return await alertModal('username and password required')
    try{
      await axios.post('${API_URL}/api/admin/users', { username, password, role })
      setUsername(''); setPassword(''); setRole('organizer')
      fetchUsers()
    }catch(err){ await alertModal('Create failed') }
  }

  async function toggleActive(u){
    try{
      await axios.patch(`${API_URL}/api/admin/users/${u.id}`, { active: !u.active })
      fetchUsers()
    }catch(err){ await alertModal('Update failed') }
  }

  async function changeRole(u, newRole){
    try{
      await axios.patch(`${API_URL}/api/admin/users/${u.id}`, { role: newRole })
      fetchUsers()
    }catch(err){ await alertModal('Update failed') }
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
        <div style={{marginBottom:16,position:'relative'}}>
          <input placeholder="password" type={showPassword ? "text" : "password"} value={password} onChange={e=>setPassword(e.target.value)} style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            background:'#1a1a1a',
            border:'1px solid #404040',
            borderRadius:8,
            color:'#e0e0e0',
            fontSize:15,
            outline:'none'
          }} />
          <button type="button" onClick={()=>setShowPassword(v=>!v)} style={{
            position:'absolute',
            right:10,
            top:10,
            background:'none',
            border:'none',
            color:'#b0b0b0',
            fontSize:15,
            cursor:'pointer',
            padding:0
          }}>{showPassword ? 'Hide' : 'Show'}</button>
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
      return await alertModal('Title, date, and location are required')
    }
    try{
      if (isEdit) {
        await axios.put(`${API_URL}/api/events/${event.id}`, formData)
        await alertModal('Event updated')
      } else {
        await axios.post('${API_URL}/api/events', formData)
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
      await axios.delete(`${API_URL}/api/events/${event.id}`)
      await alertModal('Event deleted')
      onClose()
    }catch(err){
      await alertModal('Delete failed')
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
    axios.get('${API_URL}/api/events')
      .then(r=>setEvents(r.data))
      .catch(()=>setEvents([]))
  }, [])

  async function exportCSV(eventId){
    try{
      const res = await axios.get(`${API_URL}/api/reports/${eventId}/export`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `event-${eventId}-report.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    }catch(err){
      await alertModal('Export failed')
    }
  }

  async function exportPDF(eventId){
    try{
      const res = await axios.get(`${API_URL}/api/reports/${eventId}/export-pdf`, { responseType: 'blob' })
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

  return (
    <div>
      <h2 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#fff'}}>Reports/Export</h2>

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
      const res = await axios.post('${API_URL}/api/auth/login', { username, password })
      const { token, role } = res.data
      
      if (role !== 'admin') {
        await alertModal('Access denied. Admin role required.')
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

