import React, { useState } from 'react'
import axios from 'axios'

export default function Landing({ onLogin }){
  const [mode, setMode] = useState('signin') // 'signin' or 'signup'

  return (
    <div style={{
      minHeight:'100vh',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      background:'#1a1a1a',
      padding:16
    }}>
      <div style={{
        background:'#2d2d2d',
        border:'1px solid #404040',
        borderRadius:16,
        boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
        width:'100%',
        maxWidth:480,
        overflow:'hidden'
      }}>
        {/* Header */}
        <div style={{padding:'32px 32px 24px',textAlign:'center',background:'#252525',borderBottom:'1px solid #404040'}}>
          <h1 style={{margin:'0 0 8px 0',fontSize:28,color:'#fff',fontWeight:700}}>Event Registration</h1>
          <p style={{margin:0,color:'#b0b0b0',fontSize:14}}>Manage events, tickets, and check-ins</p>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid #404040',background:'#252525'}}>
          <button 
            onClick={()=>setMode('signin')}
            style={{
              flex:1,
              padding:'16px',
              background: mode === 'signin' ? '#2d2d2d' : 'transparent',
              border:'none',
              borderBottom: mode === 'signin' ? '3px solid #667eea' : '3px solid transparent',
              color: mode === 'signin' ? '#667eea' : '#888',
              fontWeight: mode === 'signin' ? 600 : 400,
              fontSize:16,
              cursor:'pointer',
              transition:'all 0.2s'
            }}
          >
            Sign In
          </button>
          <button 
            onClick={()=>setMode('signup')}
            style={{
              flex:1,
              padding:'16px',
              background: mode === 'signup' ? '#2d2d2d' : 'transparent',
              border:'none',
              borderBottom: mode === 'signup' ? '3px solid #667eea' : '3px solid transparent',
              color: mode === 'signup' ? '#667eea' : '#888',
              fontWeight: mode === 'signup' ? 600 : 400,
              fontSize:16,
              cursor:'pointer',
              transition:'all 0.2s'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Content */}
        <div style={{padding:32}}>
          {mode === 'signin' && <SignInForm onLogin={onLogin} />}
          {mode === 'signup' && <SignUpForm onLogin={onLogin} onSwitchToSignIn={()=>setMode('signin')} />}
        </div>
      </div>
    </div>
  )
}

function SignInForm({ onLogin }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    try{
      const res = await axios.post('http://localhost:4000/api/auth/login', { email, password })
      const { token, role, user } = res.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('userRole', role)
      localStorage.setItem('user', JSON.stringify(user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      onLogin && onLogin(role, user)
    }catch(err){
      alert(err?.response?.data?.message || 'Login failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{marginBottom:20}}>
        <label style={{display:'block',marginBottom:8,fontWeight:500,color:'#b0b0b0',fontSize:14}}>Email</label>
        <input 
          type="email"
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          required
          placeholder="your.email@example.com"
          style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            fontSize:15,
            border:'1px solid #404040',
            borderRadius:8,
            background:'#1a1a1a',
            color:'#e0e0e0',
            outline:'none',
            transition:'border-color 0.2s'
          }}
          onFocus={e=>e.target.style.borderColor='#667eea'}
          onBlur={e=>e.target.style.borderColor='#404040'}
        />
      </div>

      <div style={{marginBottom:24}}>
        <label style={{display:'block',marginBottom:8,fontWeight:500,color:'#b0b0b0',fontSize:14}}>Password</label>
        <input 
          type="password"
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          required
          placeholder="Enter your password"
          style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            fontSize:15,
            border:'1px solid #404040',
            borderRadius:8,
            background:'#1a1a1a',
            color:'#e0e0e0',
            outline:'none',
            transition:'border-color 0.2s'
          }}
          onFocus={e=>e.target.style.borderColor='#667eea'}
          onBlur={e=>e.target.style.borderColor='#404040'}
        />
      </div>

      <button 
        type="submit"
        disabled={loading}
        style={{
          width:'100%',
          padding:'14px',
          fontSize:16,
          fontWeight:600,
          color:'white',
          background: loading ? '#555' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border:'none',
          borderRadius:8,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition:'all 0.2s',
          boxShadow: loading ? 'none' : '0 4px 12px rgba(102,126,234,0.4)'
        }}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>

      <p style={{textAlign:'center',marginTop:16,fontSize:14,color:'#888'}}>
        Organizer or Admin? Use your credentials to sign in.
      </p>
    </form>
  )
}

function SignUpForm({ onLogin, onSwitchToSignIn }){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    
    if (password !== confirmPassword) {
      return alert('Passwords do not match')
    }
    
    if (password.length < 6) {
      return alert('Password must be at least 6 characters')
    }
    
    setLoading(true)
    try{
      const res = await axios.post('http://localhost:4000/api/auth/signup', { 
        name, email, company, password 
      })
      const { token, role, user } = res.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('userRole', role)
      localStorage.setItem('user', JSON.stringify(user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      alert('Account created successfully!')
      onLogin && onLogin(role, user)
    }catch(err){
      alert(err?.response?.data?.message || 'Signup failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{marginBottom:16}}>
        <label style={{display:'block',marginBottom:8,fontWeight:500,color:'#b0b0b0',fontSize:14}}>Full Name *</label>
        <input 
          type="text"
          value={name} 
          onChange={e=>setName(e.target.value)} 
          required
          placeholder="John Doe"
          style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            fontSize:15,
            border:'1px solid #404040',
            borderRadius:8,
            background:'#1a1a1a',
            color:'#e0e0e0',
            outline:'none'
          }}
          onFocus={e=>e.target.style.borderColor='#667eea'}
          onBlur={e=>e.target.style.borderColor='#404040'}
        />
      </div>

      <div style={{marginBottom:16}}>
        <label style={{display:'block',marginBottom:8,fontWeight:500,color:'#b0b0b0',fontSize:14}}>Email *</label>
        <input 
          type="email"
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          required
          placeholder="your.email@example.com"
          style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            fontSize:15,
            border:'1px solid #404040',
            borderRadius:8,
            background:'#1a1a1a',
            color:'#e0e0e0',
            outline:'none'
          }}
          onFocus={e=>e.target.style.borderColor='#667eea'}
          onBlur={e=>e.target.style.borderColor='#404040'}
        />
      </div>

      <div style={{marginBottom:16}}>
        <label style={{display:'block',marginBottom:8,fontWeight:500,color:'#b0b0b0',fontSize:14}}>Company (Optional)</label>
        <input 
          type="text"
          value={company} 
          onChange={e=>setCompany(e.target.value)}
          placeholder="Your Company Name"
          style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            fontSize:15,
            border:'1px solid #404040',
            borderRadius:8,
            background:'#1a1a1a',
            color:'#e0e0e0',
            outline:'none'
          }}
          onFocus={e=>e.target.style.borderColor='#667eea'}
          onBlur={e=>e.target.style.borderColor='#404040'}
        />
      </div>

      <div style={{marginBottom:16}}>
        <label style={{display:'block',marginBottom:8,fontWeight:500,color:'#b0b0b0',fontSize:14}}>Password *</label>
        <input 
          type="password"
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          required
          placeholder="Minimum 6 characters"
          style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            fontSize:15,
            border:'1px solid #404040',
            borderRadius:8,
            background:'#1a1a1a',
            color:'#e0e0e0',
            outline:'none'
          }}
          onFocus={e=>e.target.style.borderColor='#667eea'}
          onBlur={e=>e.target.style.borderColor='#404040'}
        />
      </div>

      <div style={{marginBottom:24}}>
        <label style={{display:'block',marginBottom:8,fontWeight:500,color:'#b0b0b0',fontSize:14}}>Confirm Password *</label>
        <input 
          type="password"
          value={confirmPassword} 
          onChange={e=>setConfirmPassword(e.target.value)} 
          required
          placeholder="Re-enter password"
          style={{
            width:'calc(100% - 32px)',
            padding:'12px 16px',
            fontSize:15,
            border:'1px solid #404040',
            borderRadius:8,
            background:'#1a1a1a',
            color:'#e0e0e0',
            outline:'none'
          }}
          onFocus={e=>e.target.style.borderColor='#667eea'}
          onBlur={e=>e.target.style.borderColor='#404040'}
        />
      </div>

      <button 
        type="submit"
        disabled={loading}
        style={{
          width:'100%',
          padding:'14px',
          fontSize:16,
          fontWeight:600,
          color:'white',
          background: loading ? '#555' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border:'none',
          borderRadius:8,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition:'all 0.2s',
          boxShadow: loading ? 'none' : '0 4px 12px rgba(102,126,234,0.4)'
        }}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <p style={{textAlign:'center',marginTop:16,fontSize:14,color:'#888'}}>
        Note: This creates an attendee account. Organizers must be created by admins.
      </p>
    </form>
  )
}
