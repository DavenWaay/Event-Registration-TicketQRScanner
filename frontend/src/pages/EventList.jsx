import React, { useEffect, useState } from 'react'
import axios from 'axios'
import bg2Image from '../assets/bg2.jpg'
import { API_URL } from '../config/api'

export default function EventList({ onRegister }){
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(()=>{
    axios.get(`${API_URL}/api/events`).then(r=>setEvents(r.data)).catch(()=>setEvents([]))
  },[])

  return (
    <div style={{
      minHeight:'100vh',
      backgroundImage:`url(${bg2Image})`,
      backgroundSize:'cover',
      backgroundPosition:'center',
      backgroundRepeat:'no-repeat',
      backgroundAttachment:'fixed',
      padding:0
    }}>
      <div style={{padding:'24px'}}>
        <h3 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#ffffff',textShadow:'0 2px 4px rgba(0,0,0,0.5)'}}>Upcoming Events</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:20}}>
        {events.map(ev=> (
          <div key={ev.id} style={{
            background:'rgba(255, 255, 255, 0.1)',
            backdropFilter:'blur(20px)',
            WebkitBackdropFilter:'blur(20px)',
            border:'1px solid rgba(255, 255, 255, 0.2)',
            borderRadius:12,
            padding:20,
            display:'flex',
            flexDirection:'column',
            transition:'all 0.3s',
            cursor:'pointer',
            boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}
          onMouseEnter={e=>{
            e.currentTarget.style.transform='translateY(-4px)'
            e.currentTarget.style.boxShadow='0 12px 40px rgba(147, 51, 234, 0.4)'
            e.currentTarget.style.borderColor='rgba(147, 51, 234, 0.8)'
            e.currentTarget.style.background='rgba(255, 255, 255, 0.15)'
          }}
          onMouseLeave={e=>{
            e.currentTarget.style.transform='translateY(0)'
            e.currentTarget.style.boxShadow='0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            e.currentTarget.style.borderColor='rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.background='rgba(255, 255, 255, 0.1)'
          }}>
            <h4 style={{margin:'0 0 12px 0',fontSize:20,fontWeight:600,color:'#ffffff'}}>{ev.title}</h4>
            <p style={{fontSize:14,color:'rgba(255, 255, 255, 0.85)',margin:'0 0 16px 0',flex:1,lineHeight:1.5}}>
              {ev.description?.substring(0, 120)}{ev.description?.length > 120 ? '...' : ''}
            </p>
            <div style={{fontSize:14,margin:'12px 0',color:'rgba(255, 255, 255, 0.9)'}}>
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
                background:'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)',
                color:'#fff',
                border:'none',
                borderRadius:8,
                cursor:'pointer',
                fontSize:14,
                fontWeight:600,
                transition:'all 0.2s',
                boxShadow:'0 4px 12px rgba(147, 51, 234, 0.5)'
              }}>Register</button>
              <button onClick={()=>setSelectedEvent(ev)} style={{
                flex:1,
                padding:'12px',
                background:'rgba(255, 255, 255, 0.15)',
                color:'#ffffff',
                border:'1px solid rgba(255, 255, 255, 0.3)',
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
      {events.length === 0 && <p style={{color:'rgba(255, 255, 255, 0.7)',fontSize:16,padding:'0 24px'}}>No upcoming events at the moment.</p>}
      </div>
      
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
      background:'rgba(0,0,0,0.7)',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      zIndex:1000,
      padding:16,
      backdropFilter:'blur(8px)'
    }}>
      <div style={{
        background:'rgba(255, 255, 255, 0.15)',
        backdropFilter:'blur(30px)',
        WebkitBackdropFilter:'blur(30px)',
        border:'1px solid rgba(255, 255, 255, 0.2)',
        borderRadius:16,
        padding:32,
        width:'100%',
        maxWidth:600,
        maxHeight:'90vh',
        overflowY:'auto',
        boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:20}}>
          <h2 style={{margin:0,color:'#ffffff',fontSize:28,textShadow:'0 2px 4px rgba(0,0,0,0.3)'}}>{event.title}</h2>
          <button onClick={onClose} style={{
            background:'transparent',
            border:'none',
            fontSize:32,
            cursor:'pointer',
            color:'rgba(255, 255, 255, 0.7)',
            padding:0,
            lineHeight:1
          }}>×</button>
        </div>
        
        <div style={{marginBottom:20}}>
          <h4 style={{margin:'0 0 8px 0',color:'rgba(255, 255, 255, 0.7)',fontSize:14,textTransform:'uppercase',letterSpacing:'0.5px'}}>Description</h4>
          <p style={{margin:0,color:'rgba(255, 255, 255, 0.95)',lineHeight:1.6}}>{event.description || 'No description available.'}</p>
        </div>
        
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
          <div>
            <h4 style={{margin:'0 0 8px 0',color:'rgba(255, 255, 255, 0.7)',fontSize:14,textTransform:'uppercase',letterSpacing:'0.5px'}}>📅 Date & Time</h4>
            <p style={{margin:0,color:'rgba(255, 255, 255, 0.95)'}}>{new Date(event.date).toLocaleString()}</p>
          </div>
          <div>
            <h4 style={{margin:'0 0 8px 0',color:'rgba(255, 255, 255, 0.7)',fontSize:14,textTransform:'uppercase',letterSpacing:'0.5px'}}>📍 Location</h4>
            <p style={{margin:0,color:'rgba(255, 255, 255, 0.95)'}}>{event.location}</p>
          </div>
        </div>
        
        <div style={{marginBottom:24}}>
          <h4 style={{margin:'0 0 12px 0',color:'rgba(255, 255, 255, 0.7)',fontSize:14,textTransform:'uppercase',letterSpacing:'0.5px'}}>👥 Attendance</h4>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{flex:1,background:'rgba(0, 0, 0, 0.3)',borderRadius:8,height:12,overflow:'hidden'}}>
              <div style={{
                background: isFull ? '#dc3545' : 'linear-gradient(90deg, rgba(147, 51, 234, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)',
                height:'100%',
                width:`${Math.min(100, (event.attendeesCount||0)/event.capacity*100)}%`,
                transition:'width 0.3s',
                borderRadius:8
              }}></div>
            </div>
            <span style={{fontSize:14,fontWeight:600,color:'#ffffff',minWidth:80,textAlign:'right'}}>
              {event.attendeesCount || 0} / {event.capacity}
            </span>
          </div>
          <p style={{fontSize:14,margin:'8px 0 0 0',color: isFull ? '#ff6b6b' : 'rgba(147, 51, 234, 0.9)',fontWeight:500}}>
            {isFull ? 'Event is full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining`}
          </p>
        </div>
        
        <div style={{display:'flex',gap:12}}>
          <button onClick={onRegister} disabled={isFull} style={{
            flex:1,
            padding:'14px',
            background: isFull ? 'rgba(100, 100, 100, 0.5)' : 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)',
            color:'#fff',
            border:'none',
            borderRadius:8,
            fontSize:16,
            fontWeight:600,
            cursor: isFull ? 'not-allowed' : 'pointer',
            transition:'all 0.2s',
            boxShadow: isFull ? 'none' : '0 4px 12px rgba(147, 51, 234, 0.5)'
          }}>
            {isFull ? 'Event Full' : 'Register Now'}
          </button>
          <button onClick={onClose} style={{
            padding:'14px 24px',
            background:'rgba(255, 255, 255, 0.2)',
            color:'#ffffff',
            border:'1px solid rgba(255, 255, 255, 0.3)',
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

