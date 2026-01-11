const express = require('express')
const router = express.Router()
const { getTicketsForEvent, getEvent } = require('../db')
const PDFDocument = require('pdfkit')

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

// Export event report as PDF
router.get('/:eventId/export-pdf', (req, res) => {
  const { eventId } = req.params
  const event = getEvent(eventId)
  if (!event) return res.status(404).json({ message: 'Event not found' })
  
  const tickets = getTicketsForEvent(eventId)
  const checkedIn = tickets.filter(t => t.status === 'checked-in').length
  
  // Create PDF document
  const doc = new PDFDocument({ margin: 50 })
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="event-${eventId}-report.pdf"`)
  
  // Pipe PDF to response
  doc.pipe(res)
  
  // Title
  doc.fontSize(24).font('Helvetica-Bold').text('Event Attendee Report', { align: 'center' })
  doc.moveDown()
  
  // Event Details
  doc.fontSize(16).font('Helvetica-Bold').text(event.title)
  doc.fontSize(10).font('Helvetica')
  doc.text(`Date: ${new Date(event.date).toLocaleString()}`)
  doc.text(`Location: ${event.location}`)
  doc.text(`Capacity: ${event.attendeesCount || 0} / ${event.capacity}`)
  doc.text(`Checked In: ${checkedIn} / ${tickets.length}`)
  doc.moveDown()
  
  // Table header
  const tableTop = doc.y
  const col1X = 50
  const col2X = 200
  const col3X = 350
  const col4X = 470
  
  doc.fontSize(10).font('Helvetica-Bold')
  doc.text('Name', col1X, tableTop)
  doc.text('Email', col2X, tableTop)
  doc.text('Status', col3X, tableTop)
  doc.text('Checked In', col4X, tableTop)
  
  // Draw line under header
  doc.moveTo(col1X, tableTop + 15).lineTo(550, tableTop + 15).stroke()
  
  // Table rows
  let y = tableTop + 25
  doc.fontSize(9).font('Helvetica')
  
  tickets.forEach((ticket, i) => {
    // Check if we need a new page
    if (y > 700) {
      doc.addPage()
      y = 50
    }
    
    doc.text(ticket.name.substring(0, 20), col1X, y)
    doc.text(ticket.email.substring(0, 20), col2X, y)
    doc.text(ticket.status || 'issued', col3X, y)
    doc.text(ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleString() : '-', col4X, y, { width: 80 })
    
    y += 20
  })
  
  // Footer
  doc.fontSize(8).text(
    `Generated on ${new Date().toLocaleString()}`,
    50,
    doc.page.height - 50,
    { align: 'center' }
  )
  
  // Finalize PDF
  doc.end()
})

module.exports = router
