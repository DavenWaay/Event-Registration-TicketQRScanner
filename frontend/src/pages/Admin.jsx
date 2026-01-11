import React, { useEffect, useState } from 'react'
import axios from 'axios'
import alertModal from '../utils/alert'

function setAuthHeader(){
  const token = localStorage.getItem('token')
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default function Admin(){
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('organizer')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    const savedRole = localStorage.getItem('userRole')
    if (token && savedRole === 'admin') {
      setIsLoggedIn(true)
      setUserRole(savedRole)
      setAuthHeader()
      fetchUsers()
    }
  }, [])

  async function fetchUsers(){
    setLoading(true)
    try{
      const res = await axios.get('http://localhost:4000/api/admin/users')
      setUsers(res.data)
    }catch(err){
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
        setIsLoggedIn(false)
        setUserRole(null)
        await alertModal('Session expired or unauthorized. Please login again.')
      } else {
        await alertModal(err?.response?.data?.message || 'Failed to load users')
      }
    }finally{ setLoading(false) }
  }

  async function createUser(){
    if (!username || !password) return await alertModal('username and password required')
    try{
      await axios.post('http://localhost:4000/api/admin/users', { username, password, role })
      setUsername(''); setPassword(''); setRole('organizer')
      fetchUsers()
    }catch(err){ await alertModal(err?.response?.data?.message || 'Create failed') }
  }

  async function toggleActive(u){
    try{
      await axios.patch(`http://localhost:4000/api/admin/users/${u.id}`, { active: !u.active })
      fetchUsers()
    }catch(err){ await alertModal('Update failed') }
  }

  async function changeRole(u, newRole){
    try{
      await axios.patch(`http://localhost:4000/api/admin/users/${u.id}`, { role: newRole })
      fetchUsers()
    }catch(err){ await alertModal('Update failed') }
  }

  function handleLogin(role){
    setIsLoggedIn(true)
    setUserRole(role)
    setAuthHeader()
    if (role === 'admin') fetchUsers()
  }

  function handleLogout(){
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    setIsLoggedIn(false)
    setUserRole(null)
    setUsers([])
  }

  if (!isLoggedIn || userRole !== 'admin') {
    return (
      <div>
        <h3>Admin Login</h3>
        <div className="card">
          <Login onLogin={handleLogin} requiredRole="admin" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3>Admin — User Management</h3>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="card">
        <h4>Create User</h4>
        <div><input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} /></div>
        <div><input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <div>
          <label>Role</label>
          <select value={role} onChange={e=>setRole(e.target.value)}>
            <option value="organizer">organizer</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div style={{marginTop:8}}><button onClick={createUser}>Create</button></div>
      </div>

      <div className="card">
        <h4>Users</h4>
        {loading && <div>Loading...</div>}
        {!loading && users.map(u=> (
          <div key={u.id} style={{display:'flex',gap:12,alignItems:'center'}}>
            <div style={{flex:1}}><strong>{u.username}</strong> — {u.role} — {u.active ? 'active' : 'disabled'}</div>
            <div>
              <button onClick={()=>toggleActive(u)}>{u.active ? 'Disable' : 'Enable'}</button>
              <select value={u.role} onChange={e=>changeRole(u, e.target.value)} style={{marginLeft:8}}>
                <option value="organizer">organizer</option>
                <option value="admin">admin</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Login({ onLogin, requiredRole }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function doLogin(){
    try{
      const res = await axios.post('http://localhost:4000/api/auth/login', { username, password })
      const { token, role } = res.data
      
      if (requiredRole && role !== requiredRole) {
        await alertModal(`Access denied. This page requires ${requiredRole} role.`)
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
      <div style={{marginTop:8}}><button onClick={doLogin}>Login</button></div>
    </div>
  )
}
