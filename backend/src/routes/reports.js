const express = require('express')
const router = express.Router()
const { getTicketsForEvent, getEvent } = require('../db')

// Export event report as CSV
router.get('/:eventId/export', (req, res) => {
  const { eventId } = req.params
  const event = getEvent(eventId)
  if (!event) return res.status(404).json({ message: 'Event not found' })
  
  const tickets = getTicketsForEvent(eventId)
  
  // Build CSV
  let csv = 'Name,Email,Ticket ID,Status,Checked In At\n'
  tickets.forEach(t => {
    csv += `"${t.name}","${t.email}","${t.id}","${t.status}","${t.checkedInAt || ''}"\n`
  })
  
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="event-${eventId}-report.csv"`)
  res.send(csv)
})

module.exports = router
