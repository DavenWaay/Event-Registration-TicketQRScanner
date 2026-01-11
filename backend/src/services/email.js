const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key from environment
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('WARNING: SENDGRID_API_KEY not set. Email functionality will be disabled.');
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@example.com';

/**
 * Send registration confirmation email with QR code attachment
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.name - Recipient name
 * @param {string} params.eventTitle - Event title
 * @param {string} params.eventDate - Event date
 * @param {string} params.eventLocation - Event location
 * @param {string} params.ticketId - Ticket ID
 * @param {string} params.qrDataUrl - QR code as data URL (base64)
 */
async function sendConfirmationEmail({ to, name, eventTitle, eventDate, eventLocation, ticketId, qrDataUrl }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('Email disabled: SENDGRID_API_KEY not configured');
    return { success: false, reason: 'Email not configured' };
  }

  // Convert data URL to attachment
  const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  
  const msg = {
    to,
    from: FROM_EMAIL,
    subject: `Your ticket for ${eventTitle}`,
    text: `Hi ${name},\n\nYour registration for ${eventTitle} is confirmed!\n\nEvent Details:\n- Date: ${eventDate}\n- Location: ${eventLocation}\n- Ticket ID: ${ticketId}\n\nPlease show the attached QR code at the event for check-in.\n\nSee you there!\n`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Registration Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>Your registration for <strong>${eventTitle}</strong> is confirmed!</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Event Details</h3>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
        </div>
        
        <p>Please show the attached QR code at the event for check-in.</p>
        <p style="color: #666; font-size: 14px;">See you there!</p>
      </div>
    `,
    attachments: [
      {
        content: base64Data,
        filename: 'ticket-qr.png',
        type: 'image/png',
        disposition: 'attachment'
      }
    ]
  };

  try {
    await sgMail.send(msg);
    console.log(`Confirmation email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    if (error.response) {
      console.error('SendGrid response body:', error.response.body);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Send announcement to multiple attendees
 * @param {Object} params - Announcement parameters
 * @param {Array<string>} params.to - Array of recipient emails
 * @param {string} params.eventTitle - Event title
 * @param {string} params.subject - Email subject
 * @param {string} params.message - Email message body
 */
async function sendAnnouncement({ to, eventTitle, subject, message }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('Email disabled: SENDGRID_API_KEY not configured');
    return { success: false, reason: 'Email not configured' };
  }

  if (!to || to.length === 0) {
    return { success: false, reason: 'No recipients' };
  }

  const msg = {
    to,
    from: FROM_EMAIL,
    subject: `${eventTitle}: ${subject}`,
    text: `${message}\n\n---\nThis announcement is for ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">${eventTitle}</h2>
        <h3>${subject}</h3>
        <div style="line-height: 1.6;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 14px;">This announcement is for ${eventTitle}</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`Announcement sent to ${to.length} recipient(s)`);
    return { success: true, count: to.length };
  } catch (error) {
    console.error('SendGrid error:', error);
    if (error.response) {
      console.error('SendGrid response body:', error.response.body);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // RFC 5322 simplified pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  sendConfirmationEmail,
  sendAnnouncement,
  isValidEmail
};
