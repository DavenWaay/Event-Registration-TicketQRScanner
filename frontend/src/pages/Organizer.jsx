import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import alertModal from '../utils/alert'
import { Html5Qrcode } from 'html5-qrcode'
import { API_URL } from '../config/api'

// helper to set auth header if token present
function setAuthHeader(){
  const token = localStorage.getItem('token')
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default function Organizer(){
  const [events, setEvents] = useState([])
  const [selected, setSelected] = useState(null)
  const [attendees, setAttendees] = useState([])
  const scannerRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const isProcessingRef = useRef(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    const savedRole = localStorage.getItem('userRole')
    if (token && (savedRole === 'organizer' || savedRole === 'admin')) {
      setIsLoggedIn(true)
      setUserRole(savedRole)
      setAuthHeader()
      axios.get('${API_URL}/api/events').then(r=>setEvents(r.data)).catch(()=>setEvents([]))
    }
  },[])

  useEffect(()=>{
    if (selected) fetchAttendees(selected.id)
  },[selected])

  function fetchAttendees(eventId){
    axios.get(`${API_URL}/api/registrations/${eventId}`)
      .then(r=>setAttendees(r.data))
      .catch(err=>{
          if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem('token')
          localStorage.removeItem('userRole')
          setIsLoggedIn(false)
          setUserRole(null)
          await alertModal('Session expired. Please login again.')
        }
        setAttendees([])
      })
  }

  async function startScanner(){
    if (!selected) return await alertModal('Select an event first')
    const readerId = 'qr-reader'
    const html5QrCode = new Html5Qrcode(readerId)
    scannerRef.current = html5QrCode
    setScanning(true)
    try{
      await html5QrCode.start({ facingMode: 'environment' }, { fps: 10, qrbox: 250 }, async (decodedText, decodedResult) => {
        // decodedText should be ticketId
        if (isProcessingRef.current) return
        const ticketId = (decodedText || '').trim()
        if (!ticketId) return
        isProcessingRef.current = true
        try{
          const token = localStorage.getItem('token')
          const headers = token ? { Authorization: `Bearer ${token}` } : {}
          const res = await axios.post('${API_URL}/api/verify', { ticketId }, { headers })
          await alertModal('Checked-in: ' + res.data.ticket.id)
          fetchAttendees(selected.id)
        }catch(err){
          await alertModal(err?.response?.data?.message || 'Verify failed')
        }finally{
          // small debounce to avoid immediate re-scan
          setTimeout(()=>{ isProcessingRef.current = false }, 700)
        }
      })
    }catch(err){
      await alertModal('Camera/start failed: ' + err.message)
      setScanning(false)
    }
  }

  async function stopScanner(){
    if (scannerRef.current){
      await scannerRef.current.stop()
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setScanning(false)
  }

  function handleLogin(role){
    setIsLoggedIn(true)
    setUserRole(role)
    setAuthHeader()
    axios.get('${API_URL}/api/events').then(r=>setEvents(r.data)).catch(()=>setEvents([]))
  }

  function handleLogout(){
    if (scanning) stopScanner()
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    setIsLoggedIn(false)
    setUserRole(null)
    setEvents([])
    setAttendees([])
    setSelected(null)
  }

  if (!isLoggedIn || (userRole !== 'organizer' && userRole !== 'admin')) {
    return (
      <div>
        <h3>Organizer Login</h3>
        <div className="card">
          <Login onLogin={handleLogin} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3>Organizer Dashboard</h3>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="card">
        <label>Event</label>
        <select onChange={e=>setSelected(events.find(x=>x.id===e.target.value))} defaultValue="">
          <option value="">-- select event --</option>
          {events.map(ev=> <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
      </div>

      {selected && (
        <div>
          <h4>{selected.title}</h4>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button onClick={startScanner} disabled={scanning}>Start Scanner</button>
            <button onClick={stopScanner} disabled={!scanning}>Stop Scanner</button>
          </div>

          <div id="qr-reader" style={{width:300, marginTop:12}}></div>

          <h4>Attendees</h4>
          {attendees.map(a=> (
            <div key={a.id} className="card">
              <div><strong>{a.name}</strong> — {a.email}</div>
              <div>Ticket: {a.id}</div>
              <div>Status: {a.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Login({ onLogin }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function doLogin(){
    try{
      const res = await axios.post('${API_URL}/api/auth/login', { username, password })
      const { token, role } = res.data
      
      if (role !== 'organizer' && role !== 'admin') {
        await alertModal('Access denied. This page requires organizer or admin role.')
        return
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('userRole', role)
      onLogin && onLogin(role)
    }catch(err){
      await alertModal(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div>
      <div><input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} /></div>
      <div><input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
      <div style={{marginTop:8}}><button onClick={doLogin}>Login</button></div>
    </div>
  )
}

