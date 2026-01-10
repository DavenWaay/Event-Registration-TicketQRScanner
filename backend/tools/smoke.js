const axios = require('axios')

const BASE = process.env.BASE_URL || 'http://localhost:4000'

async function run(){
  try{
    console.log('Registering test user...')
    try{
      await axios.post(`${BASE}/api/auth/register`, { username: 'test_admin', password: 'pass123', role: 'organizer' })
      console.log('User created')
    }catch(e){
      if (e.response && e.response.status === 409) console.log('User already exists, continuing')
      else console.log('Register error (continuing):', e.message)
    }

    console.log('Logging in...')
    const login = await axios.post(`${BASE}/api/auth/login`, { username: 'test_admin', password: 'pass123' })
    const token = login.data.token
    console.log('Got token')

    // register ticket
    console.log('Registering ticket for evt-1...')
    const randomSuffix = Date.now() + Math.floor(Math.random()*1000)
    const email = `alice+${randomSuffix}@example.com`
    const reg = await axios.post(`${BASE}/api/registrations/evt-1/register`, { name: 'Alice Example', email, company: 'ACME' })
    const ticket = reg.data.ticket
    console.log('Ticket issued:', ticket.id)

    // verify using token
    console.log('Verifying ticket...')
    const res = await axios.post(`${BASE}/api/verify`, { ticketId: ticket.id }, { headers: { Authorization: `Bearer ${token}` } })
    console.log('Verify response:', res.data.message)
    console.log('Ticket status after verify:', res.data.ticket.status)

  }catch(err){
    console.error('Smoke test failed:', err.response ? err.response.data || err.response.statusText : err.message)
    process.exitCode = 1
  }
}

run()
