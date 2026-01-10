import React, { useState } from 'react'
import axios from 'axios'

export default function Register({ event, user, onDone, onCancel }){
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [company, setCompany] = useState(user?.company || '')
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e){
    e.preventDefault();
    setLoading(true)
    try{
      const res = await axios.post(`http://localhost:4000/api/registrations/${event.id}/register`, { name, email, company })
      setTicket(res.data.ticket)
    }catch(err){
      alert(err?.response?.data?.message || 'Registration failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div style={{maxWidth:700,margin:'40px auto'}}>
      {!ticket && (
        <div>
          <h2 style={{marginBottom:24,fontSize:28,fontWeight:700,color:'#fff'}}>Register for Event</h2>
          <div style={{
            marginBottom:20,
            background:'#2d2d2d',
            border:'1px solid #404040',
            borderRadius:12,
            padding:20
          }}>
            <h3 style={{margin:'0 0 12px 0',color:'#667eea',fontSize:20}}>{event.title}</h3>
            <p style={{fontSize:14,color:'#b0b0b0',margin:'4px 0'}}>📅 {new Date(event.date).toLocaleString()}</p>
            <p style={{fontSize:14,color:'#b0b0b0',margin:'4px 0'}}>📍 {event.location}</p>
          </div>

          <form onSubmit={submit} style={{
            background:'#2d2d2d',
            border:'1px solid #404040',
            borderRadius:16,
            padding:32,
            boxShadow:'0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <h4 style={{margin:'0 0 24px 0',color:'#fff',fontSize:18}}>Attendee Information</h4>
            
            <div style={{marginBottom:20}}>
              <label style={{display:'block',marginBottom:8,fontWeight:500,color:'#b0b0b0',fontSize:14}}>Full Name *</label>
              <input 
                value={name} 
                onChange={e=>setName(e.target.value)} 
                required
                placeholder="Enter your full name"
                style={{
                  width:'100%',
                  padding:'12px 16px',
                  fontSize:15,
                  background:'#1a1a1a',
                  border:'1px solid #404040',
                  borderRadius:8,
                  color:'#e0e0e0',
                  outline:'none'
                }}
                onFocus={e=>e.target.style.borderColor='#667eea'}
                onBlur={e=>e.target.style.borderColor='#404040'}
              />
            </div>

            <div style={{marginBottom:20}}>
              <label style={{display:'block',marginBottom:8,fontWeight:500,color:'#b0b0b0',fontSize:14}}>Email Address *</label>
              <input 
                type="email"
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                required
                placeholder="your.email@example.com"
                style={{
                  width:'100%',
                  padding:'12px 16px',
                  fontSize:15,
                  background:'#1a1a1a',
                  border:'1px solid #404040',
                  borderRadius:8,
                  color:'#e0e0e0',
                  outline:'none'
                }}
                onFocus={e=>e.target.style.borderColor='#667eea'}
                onBlur={e=>e.target.style.borderColor='#404040'}
              />
            </div>

            <div style={{marginBottom:20}}>
              <label style={{display:'block',marginBottom:8,fontWeight:500,color:'#b0b0b0',fontSize:14}}>Company/Organization (Optional)</label>
              <input 
                value={company} 
                onChange={e=>setCompany(e.target.value)}
                placeholder="Enter your company name"
                style={{
                  width:'100%',
                  padding:'12px 16px',
                  fontSize:15,
                  background:'#1a1a1a',
                  border:'1px solid #404040',
                  borderRadius:8,
                  color:'#e0e0e0',
                  outline:'none'
                }}
                onFocus={e=>e.target.style.borderColor='#667eea'}
                onBlur={e=>e.target.style.borderColor='#404040'}
              />
            </div>

            <div style={{borderTop:'1px solid #404040',paddingTop:20,marginTop:24}}>
              <div style={{display:'flex',gap:12}}>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    flex:1,
                    padding:'14px',
                    fontSize:16,
                    fontWeight:600,
                    background: loading ? '#555' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color:'#fff',
                    border:'none',
                    borderRadius:8,
                    cursor: loading ? 'wait' : 'pointer'
                  }}
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </button>
                <button 
                  type="button" 
                  onClick={onCancel || onDone}
                  style={{
                    background:'#3a3a3a',
                    padding:'14px 24px',
                    fontSize:16,
                    fontWeight:500,
                    color:'#e0e0e0',
                    border:'1px solid #505050',
                    borderRadius:8,
                    cursor:'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {ticket && (
        <div>
          <div style={{
            textAlign:'center',
            background:'#2d2d2d',
            border:'1px solid #404040',
            borderRadius:16,
            padding:40,
            boxShadow:'0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width:80,
              height:80,
              borderRadius:'50%',
              background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              margin:'0 auto 24px',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              fontSize:40,
              color:'#fff'
            }}>✓</div>
            <h2 style={{margin:'0 0 8px 0',color:'#fff'}}>Registration Successful!</h2>
            <p style={{color:'#b0b0b0',margin:'0 0 24px 0'}}>Your ticket has been issued</p>
          </div>

          <div style={{
            marginTop:20,
            background:'#2d2d2d',
            border:'1px solid #404040',
            borderRadius:16,
            padding:32,
            boxShadow:'0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{margin:'0 0 20px 0',color:'#fff',fontSize:20}}>Your Ticket</h3>
            
            <div style={{fontSize:14,color:'#b0b0b0',marginBottom:20}}>
              <div style={{marginBottom:12}}>
                <strong style={{color:'#999'}}>Event:</strong> <span style={{color:'#e0e0e0'}}>{event.title}</span>
              </div>
              <div style={{marginBottom:12}}>
                <strong style={{color:'#999'}}>Name:</strong> <span style={{color:'#e0e0e0'}}>{ticket.name}</span>
              </div>
              <div style={{marginBottom:12}}>
                <strong style={{color:'#999'}}>Email:</strong> <span style={{color:'#e0e0e0'}}>{ticket.email}</span>
              </div>
              <div style={{marginBottom:12}}>
                <strong style={{color:'#999'}}>Ticket ID:</strong> <span style={{color:'#e0e0e0'}}>{ticket.id.slice(0,16)}...</span>
              </div>
              <div style={{marginBottom:12}}>
                <strong style={{color:'#999'}}>Status:</strong> <span style={{color:'#4ade80',fontWeight:600}}>{ticket.status}</span>
              </div>
            </div>

            <div style={{textAlign:'center',marginTop:24,padding:20,background:'#fff',borderRadius:12}}>
              <p style={{fontSize:14,color:'#666',margin:'0 0 12px 0'}}>Show this QR code at the event for check-in</p>
              <img alt="Ticket QR Code" src={ticket.qr} style={{maxWidth:240,width:'100%',display:'block',margin:'0 auto'}} />
            </div>
          </div>

          <div style={{marginTop:20,textAlign:'center'}}>
            <button onClick={onDone} style={{
              padding:'14px 32px',
              fontSize:16,
              fontWeight:600,
              background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color:'#fff',
              border:'none',
              borderRadius:8,
              cursor:'pointer'
            }}>View My Tickets</button>
          </div>
        </div>
      )}
    </div>
  )
}
