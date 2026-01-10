import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function MyTickets(){
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetchTickets()
  },[])

  async function fetchTickets(){
    setLoading(true)
    try{
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
      alert('Checked-in: ' + res.data.ticket.id)
      fetchTickets() // Refresh to show updated status
    }catch(err){
      alert(err?.response?.data?.message || 'Verify failed')
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
      {tickets.map(t=> (
        <div key={t.id} style={{
          background:'#2d2d2d',
          border:'1px solid #404040',
          borderRadius:16,
          padding:24,
          display:'flex',
          flexDirection:'column',
          boxShadow:'0 4px 12px rgba(0,0,0,0.2)'
        }}>
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
          <div style={{
            marginTop:'auto',
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
      ))}
      </div>
    </div>
  )
}
