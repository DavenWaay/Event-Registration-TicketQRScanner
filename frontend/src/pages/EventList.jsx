import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function EventList({ onRegister }){
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(()=>{
    axios.get('http://localhost:4000/api/events').then(r=>setEvents(r.data)).catch(()=>setEvents([]))
  },[])

  return (
    <div>
      <h3 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#fff'}}>Upcoming Events</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:20}}>
        {events.map(ev=> (
          <div key={ev.id} style={{
            background:'#2d2d2d',
            border:'1px solid #404040',
            borderRadius:12,
            padding:20,
            display:'flex',
            flexDirection:'column',
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
            <h4 style={{margin:'0 0 12px 0',fontSize:20,fontWeight:600,color:'#fff'}}>{ev.title}</h4>
            <p style={{fontSize:14,color:'#b0b0b0',margin:'0 0 16px 0',flex:1,lineHeight:1.5}}>
              {ev.description?.substring(0, 120)}{ev.description?.length > 120 ? '...' : ''}
            </p>
            <div style={{fontSize:14,margin:'12px 0',color:'#b0b0b0'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <span style={{fontSize:18}}>📅</span>
                <span>{new Date(ev.date).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'})}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <span style={{fontSize:18}}>📍</span>
                <span>{ev.location}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:18}}>👥</span>
                <span>{ev.attendeesCount || 0} / {ev.capacity} registered</span>
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button onClick={()=>onRegister(ev)} style={{
                flex:1,
                padding:'12px',
                background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color:'#fff',
                border:'none',
                borderRadius:8,
                cursor:'pointer',
                fontSize:14,
                fontWeight:600,
                transition:'all 0.2s'
              }}>Register</button>
              <button onClick={()=>setSelectedEvent(ev)} style={{
                flex:1,
                padding:'12px',
                background:'#3a3a3a',
                color:'#e0e0e0',
                border:'1px solid #505050',
                borderRadius:8,
                cursor:'pointer',
                fontSize:14,
                fontWeight:500,
                transition:'all 0.2s'
              }}>Details</button>
            </div>
          </div>
        ))}
      </div>
      {events.length === 0 && <p style={{color:'#888',fontSize:16}}>No upcoming events at the moment.</p>}
      
      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          onClose={()=>setSelectedEvent(null)}
          onRegister={()=>{
            setSelectedEvent(null)
            onRegister(selectedEvent)
          }}
        />
      )}
    </div>
  )
}

function EventDetailsModal({ event, onClose, onRegister }){
  const spotsLeft = event.capacity - (event.attendeesCount || 0)
  const isFull = spotsLeft <= 0
  
  return (
    <div style={{
      position:'fixed',
      top:0,left:0,right:0,bottom:0,
      background:'rgba(0,0,0,0.85)',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      zIndex:1000,
      padding:16,
      backdropFilter:'blur(4px)'
    }}>
      <div style={{
        background:'#2d2d2d',
        border:'1px solid #404040',
        borderRadius:16,
        padding:32,
        width:'100%',
        maxWidth:600,
        maxHeight:'90vh',
        overflowY:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:20}}>
          <h2 style={{margin:0,color:'#fff',fontSize:28}}>{event.title}</h2>
          <button onClick={onClose} style={{
            background:'transparent',
            border:'none',
            fontSize:32,
            cursor:'pointer',
            color:'#888',
            padding:0,
            lineHeight:1
          }}>×</button>
        </div>
        
        <div style={{marginBottom:20}}>
          <h4 style={{margin:'0 0 8px 0',color:'#999',fontSize:14,textTransform:'uppercase',letterSpacing:'0.5px'}}>Description</h4>
          <p style={{margin:0,color:'#e0e0e0',lineHeight:1.6}}>{event.description || 'No description available.'}</p>
        </div>
        
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
          <div>
            <h4 style={{margin:'0 0 8px 0',color:'#999',fontSize:14,textTransform:'uppercase',letterSpacing:'0.5px'}}>📅 Date & Time</h4>
            <p style={{margin:0,color:'#e0e0e0'}}>{new Date(event.date).toLocaleString()}</p>
          </div>
          <div>
            <h4 style={{margin:'0 0 8px 0',color:'#999',fontSize:14,textTransform:'uppercase',letterSpacing:'0.5px'}}>📍 Location</h4>
            <p style={{margin:0,color:'#e0e0e0'}}>{event.location}</p>
          </div>
        </div>
        
        <div style={{marginBottom:24}}>
          <h4 style={{margin:'0 0 12px 0',color:'#999',fontSize:14,textTransform:'uppercase',letterSpacing:'0.5px'}}>👥 Attendance</h4>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{flex:1,background:'#1a1a1a',borderRadius:8,height:12,overflow:'hidden'}}>
              <div style={{
                background: isFull ? '#dc3545' : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                height:'100%',
                width:`${Math.min(100, (event.attendeesCount||0)/event.capacity*100)}%`,
                transition:'width 0.3s',
                borderRadius:8
              }}></div>
            </div>
            <span style={{fontSize:14,fontWeight:600,color:'#e0e0e0',minWidth:80,textAlign:'right'}}>
              {event.attendeesCount || 0} / {event.capacity}
            </span>
          </div>
          <p style={{fontSize:14,margin:'8px 0 0 0',color: isFull ? '#dc3545' : '#667eea',fontWeight:500}}>
            {isFull ? 'Event is full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining`}
          </p>
        </div>
        
        <div style={{display:'flex',gap:12}}>
          <button onClick={onRegister} disabled={isFull} style={{
            flex:1,
            padding:'14px',
            background: isFull ? '#555' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color:'#fff',
            border:'none',
            borderRadius:8,
            fontSize:16,
            fontWeight:600,
            cursor: isFull ? 'not-allowed' : 'pointer',
            transition:'all 0.2s'
          }}>
            {isFull ? 'Event Full' : 'Register Now'}
          </button>
          <button onClick={onClose} style={{
            padding:'14px 24px',
            background:'#3a3a3a',
            color:'#e0e0e0',
            border:'1px solid #505050',
            borderRadius:8,
            fontSize:16,
            fontWeight:500,
            cursor:'pointer',
            transition:'all 0.2s'
          }}>Close</button>
        </div>
      </div>
    </div>
  )
}
