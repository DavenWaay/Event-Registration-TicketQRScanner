import React, { useState } from 'react'
import axios from 'axios'
import alertModal from '../utils/alert'
import bgImage from '../assets/bg.png'
import iconImage from '../assets/icon.png'

export default function Landing({ onLogin }){
  const [mode, setMode] = useState('signin') // 'signin' or 'signup'

  return (
    <>
      <style>
        {`
          input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
          input::-webkit-input-placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
          input::-moz-placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
          input:-ms-input-placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
          .signup-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }
          @media (max-width: 600px) {
            .signup-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
      <div style={{
        minHeight:'100vh',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        backgroundImage:`url(${bgImage})`,
        backgroundSize:'cover',
        backgroundPosition:'center',
        backgroundRepeat:'no-repeat',
        padding:20
      }}>
      <div style={{
        background:'rgba(255, 255, 255, 0.1)',
        borderRadius:16,
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        width:'100%',
        maxWidth:750,
        overflow:'hidden',
        position:'relative'
      }}>
        
        {/* Header */}
        <div style={{padding:'24px 20px 20px',textAlign:'center',background:'rgba(0, 0, 0, 0.2)',borderBottom:'1px solid rgba(255, 255, 255, 0.15)',position:'relative',zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:8}}>
            <img src={iconImage} alt="Logo" style={{width:40,height:40}} />
            <h1 style={{
              margin:0,
              fontSize:28,
              fontWeight:700,
              background:'linear-gradient(135deg, #9333ea 0%, #a855f7 100%)',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              backgroundClip:'text',
              filter:'drop-shadow(0 0 12px rgba(147, 51, 234, 0.6))'
            }}>Event Registration</h1>
          </div>
          <p style={{margin:0,color:'rgba(255, 255, 255, 0.8)',fontSize:14}}>Manage events, tickets, and check-ins</p>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid rgba(255, 255, 255, 0.15)',background:'rgba(0, 0, 0, 0.15)',position:'relative',zIndex:1}}>
          <button 
            onClick={()=>setMode('signin')}
            style={{
              flex:1,
              padding:'16px',
              background: mode === 'signin' ? 'rgba(147, 51, 234, 0.3)' : 'transparent',
              border:'none',
              borderBottom: mode === 'signin' ? '3px solid rgba(147, 51, 234, 0.9)' : '3px solid transparent',
              color: mode === 'signin' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
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
              background: mode === 'signup' ? 'rgba(147, 51, 234, 0.3)' : 'transparent',
              border:'none',
              borderBottom: mode === 'signup' ? '3px solid rgba(147, 51, 234, 0.9)' : '3px solid transparent',
              color: mode === 'signup' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
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
        <div style={{padding:24,position:'relative',zIndex:1}}>
          {mode === 'signin' && <SignInForm onLogin={onLogin} />}
          {mode === 'signup' && <SignUpForm onLogin={onLogin} onSwitchToSignIn={()=>setMode('signin')} />}
        </div>
      </div>
    </div>
    </>
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
      await alertModal(err?.response?.data?.message || 'Login failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{marginBottom:20}}>
        <label style={{display:'block',marginBottom:8,fontWeight:500,color:'rgba(255, 255, 255, 0.9)',fontSize:14}}>Email</label>
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
            border:'1px solid rgba(255, 255, 255, 0.2)',
            borderRadius:8,
            background:'rgba(255, 255, 255, 0.1)',
            color:'#ffffff',
            outline:'none',
            transition:'border-color 0.2s',
            boxSizing:'border-box'
          }}
          onFocus={e=>e.target.style.borderColor='rgba(147, 51, 234, 0.8)'}
          onBlur={e=>e.target.style.borderColor='rgba(255, 255, 255, 0.2)'}
        />
      </div>

      <div style={{marginBottom:24}}>
        <label style={{display:'block',marginBottom:8,fontWeight:500,color:'rgba(255, 255, 255, 0.9)',fontSize:14}}>Password</label>
        <input 
          type="password"
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          required
          placeholder="Enter your password"
          style={{
            width:'100%',
            padding:'12px 16px',
            fontSize:15,
            border:'1px solid rgba(255, 255, 255, 0.2)',
            borderRadius:8,
            background:'rgba(255, 255, 255, 0.1)',
            color:'#ffffff',
            outline:'none',
            transition:'border-color 0.2s',
            boxSizing:'border-box'
          }}
          onFocus={e=>e.target.style.borderColor='rgba(147, 51, 234, 0.8)'}
          onBlur={e=>e.target.style.borderColor='rgba(255, 255, 255, 0.2)'}
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
          background: loading ? 'rgba(100, 100, 100, 0.5)' : 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)',
          border:'none',
          borderRadius:8,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition:'all 0.2s',
          boxShadow: loading ? 'none' : '0 4px 12px rgba(147, 51, 234, 0.5)'
        }}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>

      <p style={{textAlign:'center',marginTop:16,fontSize:14,color:'rgba(255, 255, 255, 0.7)'}}>
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
      return await alertModal('Passwords do not match')
    }
    
    if (password.length < 6) {
      return await alertModal('Password must be at least 6 characters')
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
      
      await alertModal('Account created successfully!')
      onLogin && onLogin(role, user)
    }catch(err){
      await alertModal(err?.response?.data?.message || 'Signup failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Two-column grid for first 4 fields */}
      <div className="signup-grid">
        <div>
          <label style={{display:'block',marginBottom:8,fontWeight:500,color:'rgba(255, 255, 255, 0.9)',fontSize:14}}>Full Name *</label>
          <input 
            type="text"
            value={name} 
            onChange={e=>setName(e.target.value)} 
            required
            placeholder="John Doe"
            style={{
              width:'100%',
              padding:'12px 16px',
              fontSize:15,
              border:'1px solid rgba(255, 255, 255, 0.2)',
              borderRadius:8,
              background:'rgba(255, 255, 255, 0.1)',
              color:'#ffffff',
              outline:'none',
              boxSizing:'border-box'
            }}
            onFocus={e=>e.target.style.borderColor='rgba(147, 51, 234, 0.8)'}
            onBlur={e=>e.target.style.borderColor='rgba(255, 255, 255, 0.2)'}
          />
        </div>

        <div>
          <label style={{display:'block',marginBottom:8,fontWeight:500,color:'rgba(255, 255, 255, 0.9)',fontSize:14}}>Email *</label>
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
              border:'1px solid rgba(255, 255, 255, 0.2)',
              borderRadius:8,
              background:'rgba(255, 255, 255, 0.1)',
              color:'#ffffff',
              outline:'none',
              boxSizing:'border-box'
            }}
            onFocus={e=>e.target.style.borderColor='rgba(147, 51, 234, 0.8)'}
            onBlur={e=>e.target.style.borderColor='rgba(255, 255, 255, 0.2)'}
          />
        </div>

        <div>
          <label style={{display:'block',marginBottom:8,fontWeight:500,color:'rgba(255, 255, 255, 0.9)',fontSize:14}}>Company (Optional)</label>
          <input 
            type="text"
            value={company} 
            onChange={e=>setCompany(e.target.value)}
            placeholder="Your Company Name"
            style={{
              width:'100%',
              padding:'12px 16px',
              fontSize:15,
              border:'1px solid rgba(255, 255, 255, 0.2)',
              borderRadius:8,
              background:'rgba(255, 255, 255, 0.1)',
              color:'#ffffff',
              outline:'none',
              boxSizing:'border-box'
            }}
            onFocus={e=>e.target.style.borderColor='rgba(147, 51, 234, 0.8)'}
            onBlur={e=>e.target.style.borderColor='rgba(255, 255, 255, 0.2)'}
          />
        </div>

        <div>
          <label style={{display:'block',marginBottom:8,fontWeight:500,color:'rgba(255, 255, 255, 0.9)',fontSize:14}}>Password *</label>
          <input 
            type="password"
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required
            placeholder="Minimum 6 characters"
            style={{
              width:'100%',
              padding:'12px 16px',
              fontSize:15,
              border:'1px solid rgba(255, 255, 255, 0.2)',
              borderRadius:8,
              background:'rgba(255, 255, 255, 0.1)',
              color:'#ffffff',
              outline:'none',
              boxSizing:'border-box'
            }}
            onFocus={e=>e.target.style.borderColor='rgba(147, 51, 234, 0.8)'}
            onBlur={e=>e.target.style.borderColor='rgba(255, 255, 255, 0.2)'}
          />
        </div>
      </div>

      <div style={{marginBottom:24}}>
        <label style={{display:'block',marginBottom:8,fontWeight:500,color:'rgba(255, 255, 255, 0.9)',fontSize:14}}>Confirm Password *</label>
        <input 
          type="password"
          value={confirmPassword} 
          onChange={e=>setConfirmPassword(e.target.value)} 
          required
          placeholder="Re-enter password"
          style={{
            width:'100%',
            padding:'12px 16px',
            fontSize:15,
            border:'1px solid rgba(255, 255, 255, 0.2)',
            borderRadius:8,
            background:'rgba(255, 255, 255, 0.1)',
            color:'#ffffff',
            outline:'none',
            boxSizing:'border-box'
          }}
          onFocus={e=>e.target.style.borderColor='rgba(147, 51, 234, 0.8)'}
          onBlur={e=>e.target.style.borderColor='rgba(255, 255, 255, 0.2)'}
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
          background: loading ? 'rgba(100, 100, 100, 0.5)' : 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)',
          border:'none',
          borderRadius:8,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition:'all 0.2s',
          boxShadow: loading ? 'none' : '0 4px 12px rgba(147, 51, 234, 0.5)'
        }}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <p style={{textAlign:'center',marginTop:16,fontSize:14,color:'rgba(255, 255, 255, 0.7)'}}>
        Note: This creates an attendee account. Organizers must be created by admins.
      </p>
    </form>
  )
}
