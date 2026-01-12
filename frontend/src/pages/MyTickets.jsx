import React, { useEffect, useState } from 'react'
import axios from 'axios'
import confirmModal from '../utils/confirm'
import alertModal from '../utils/alert'

export default function MyTickets(){
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  async function downloadQR(url, filename = 'ticket-qr.png'){
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

  useEffect(()=>{
    fetchTickets()
    const iv = setInterval(()=>{
      fetchTickets()
    }, 5000)
    return ()=> clearInterval(iv)
  },[])

  async function fetchTickets(){
    setLoading(true)
    try{
      const token = localStorage.getItem('token')
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const res = await axios.get('http://localhost:4000/api/registrations/my-tickets')
      setTickets(res.data)
    }catch(err){
      console.error('Failed to fetch tickets:', err)
      setTickets([])
    }finally{
      setLoading(false)
    }
  }

  async function verify(ticketId){
    try{
      const res = await axios.post('http://localhost:4000/api/verify', { ticketId })
      await alertModal('Checked-in: ' + res.data.ticket.id)
      fetchTickets() // Refresh to show updated status
    }catch(err){
      await alertModal(err?.response?.data?.message || 'Verify failed')
    }
  }

  if (loading) {
    return <div><h3 style={{color:'#fff'}}>My Tickets</h3><p style={{color:'#888'}}>Loading tickets...</p></div>
  }

  return (
    <div>
      <h3 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#fff'}}>My Tickets</h3>
      {tickets.length===0 && (
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
          <p style={{color:'#888',margin:0}}>You haven't registered for any events yet.</p>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))',gap:20}}>
        {tickets.map(t => (
          <TicketCard key={t.id} t={t} fetchTickets={fetchTickets} />
        ))}
      </div>
    </div>
  )
}

function TicketCard({ t, fetchTickets }){
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: t.name, email: t.email, company: t.company })
  const [saving, setSaving] = useState(false)

  async function save(){
    setSaving(true)
    try{
      const token = localStorage.getItem('token')
      if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      await axios.patch(`http://localhost:4000/api/registrations/${t.id}`, form)
      await alertModal('Updated')
      setEditing(false)
      fetchTickets()
    }catch(err){
      await alertModal(err?.response?.data?.message || 'Update failed')
    }finally{ setSaving(false) }
  }

  async function cancelRegistration(){
    if(!(await confirmModal('Cancel this registration?'))) return
    try{
      const token = localStorage.getItem('token')
      if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      await axios.delete(`http://localhost:4000/api/registrations/${t.id}`)
      await alertModal('Registration cancelled')
      fetchTickets()
    }catch(err){
      await alertModal(err?.response?.data?.message || 'Cancel failed')
    }
  }

  return (
    <div style={{position:'relative',background:'#2d2d2d',border:'1px solid #404040',borderRadius:16,padding:24,display:'flex',flexDirection:'column',boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>
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
          <h4 style={{margin:'0 0 16px 0',fontSize:20,fontWeight:600,color:'#fff'}}>{t.eventTitle || 'Event'}</h4>
          <div style={{fontSize:14,color:'#b0b0b0',marginBottom:16}}>
            <p style={{margin:'0 0 8px 0'}}><strong style={{color:'#999'}}>Name:</strong> {t.name}</p>
            <p style={{margin:'0 0 8px 0'}}><strong style={{color:'#999'}}>Email:</strong> {t.email}</p>
            {t.company && <p style={{margin:'0 0 8px 0'}}><strong style={{color:'#999'}}>Company:</strong> {t.company}</p>}
            <p style={{margin:'0 0 8px 0'}}><strong style={{color:'#999'}}>Ticket ID:</strong> {t.id.slice(0,12)}...</p>
            {t.checkedInAt && <p style={{margin:'0 0 8px 0'}}><strong style={{color:'#999'}}>Checked in:</strong> {new Date(t.checkedInAt).toLocaleString()}</p>}
          </div>
          {t.qr && (
            <div style={{textAlign:'center',marginBottom:16,padding:16,background:'#fff',borderRadius:12}}>
              <p style={{fontSize:14,color:'#666',margin:'0 0 12px 0'}}>Show this QR code at the event</p>
              <img src={t.qr} alt="QR Code" style={{maxWidth:200,display:'block',margin:'0 auto'}} />
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
            <button onClick={()=>{ const a = document.createElement('a'); a.href = t.qr; a.download = `${(t.eventTitle||'ticket').replace(/[^a-z0-9-_]/gi,'_')}-${t.id.slice(0,8)}.png`; document.body.appendChild(a); a.click(); a.remove(); }} style={{padding:'10px 14px',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700}}>Download QR</button>
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
