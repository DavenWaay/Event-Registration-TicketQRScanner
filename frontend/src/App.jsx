import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Landing from './pages/Landing'
import EventList from './pages/EventList'
import Register from './pages/Register'
import MyTickets from './pages/MyTickets'
import OrganizerPanel from './pages/OrganizerPanel'
import AdminPanel from './pages/AdminPanel'

export default function App(){
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('list')
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Check for existing session on mount
  useEffect(()=>{
    const token = localStorage.getItem('token')
    const savedRole = localStorage.getItem('userRole')
    const savedUser = localStorage.getItem('user')
    if (token && savedRole) {
      setIsLoggedIn(true)
      setUserRole(savedRole)
      setUser(savedUser ? JSON.parse(savedUser) : null)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    // Listen for logout events from other panels
    function onLoggedOut(){
      handleLogout()
    }
    window.addEventListener('user-logged-out', onLoggedOut)
    return ()=> window.removeEventListener('user-logged-out', onLoggedOut)
  }, [])

  function handleLogin(role, userData){
    setIsLoggedIn(true)
    setUserRole(role)
    setUser(userData)
  }

  function handleLogout(){
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setIsLoggedIn(false)
    setUserRole(null)
    setUser(null)
    setPage('list')
  }

  // Show landing page if not logged in
  if (!isLoggedIn) {
    return <Landing onLogin={handleLogin} />
  }

  // Route based on role
  if (userRole === 'admin') {
    return <AdminPanel />
  }

  if (userRole === 'organizer') {
    return <OrganizerPanel />
  }

  // Attendee interface
  return (
    <div style={{minHeight:'100vh',background:'#1a1a1a',color:'#e0e0e0'}}>
      {/* Modern Navbar */}
      <header style={{
        background:'#2d2d2d',
        borderBottom:'1px solid #404040',
        padding:'12px 24px',
        display:'flex',
        alignItems:'center',
        gap:24,
        boxShadow:'0 2px 8px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{margin:0,fontSize:22,fontWeight:700,color:'#fff',letterSpacing:'-0.5px'}}>Event Registration</h2>
        
        <nav style={{marginLeft:'auto',display:'flex',gap:12,alignItems:'center'}}>
          <button 
            onClick={()=>setPage('list')}
            style={{
              padding:'8px 16px',
              background: page === 'list' ? '#667eea' : 'transparent',
              color: page === 'list' ? '#fff' : '#b0b0b0',
              border:'none',
              borderRadius:6,
              cursor:'pointer',
              fontSize:14,
              fontWeight:500,
              transition:'all 0.2s'
            }}
          >
            Events
          </button>
          <button 
            onClick={()=>setPage('my')}
            style={{
              padding:'8px 16px',
              background: page === 'my' ? '#667eea' : 'transparent',
              color: page === 'my' ? '#fff' : '#b0b0b0',
              border:'none',
              borderRadius:6,
              cursor:'pointer',
              fontSize:14,
              fontWeight:500,
              transition:'all 0.2s'
            }}
          >
            My Tickets
          </button>
        </nav>

        <div style={{display:'flex',alignItems:'center',gap:12,marginLeft:24,paddingLeft:24,borderLeft:'1px solid #404040'}}>
          <div style={{
            width:36,
            height:36,
            borderRadius:'50%',
            background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            color:'#fff',
            fontWeight:600,
            fontSize:16
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span style={{fontSize:14,color:'#e0e0e0'}}>{user?.name || 'User'}</span>
          <button 
            onClick={handleLogout}
            style={{
              padding:'8px 16px',
              background:'#dc3545',
              color:'#fff',
              border:'none',
              borderRadius:6,
              cursor:'pointer',
              fontSize:14,
              fontWeight:500,
              transition:'all 0.2s'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{padding:'32px 24px',maxWidth:1400,margin:'0 auto'}}>
        {page === 'list' && <EventList onRegister={(ev)=>{ setSelectedEvent(ev); setPage('register')}} />}
        {page === 'register' && selectedEvent && <Register event={selectedEvent} user={user} onDone={()=>setPage('my')} onCancel={()=>setPage('list')} />}
        {page === 'my' && <MyTickets />}
      </main>
    </div>
  )
}
