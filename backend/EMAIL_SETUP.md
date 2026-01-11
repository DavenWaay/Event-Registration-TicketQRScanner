# Email Notification Setup (SendGrid)

This application uses SendGrid to send email notifications for:
- Registration confirmation emails with QR code attachments
- Event announcements to registered attendees

## Setup Instructions

### 1. Get Your SendGrid API Key

1. Go to [SendGrid](https://sendgrid.com) and sign in (or create a free account)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it (e.g., "Event Registration App")
5. Select **Full Access** permissions
6. Click **Create & View**
7. **Copy the API key** (you won't be able to see it again!)

### 2. Verify Your Sender Email

SendGrid requires you to verify the email address you'll send from:

1. Go to **Settings** → **Sender Authentication**
2. Choose **Verify a Single Sender**
3. Fill in your details (use a real email you have access to)
4. Check your email inbox and click the verification link
5. Use this verified email as your `FROM_EMAIL` in `.env`

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env` in the `backend` folder:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   SENDGRID_API_KEY=SG.your_actual_api_key_here
   FROM_EMAIL=your-verified-email@yourdomain.com
   JWT_SECRET=your-secret-key-here
   PORT=4000
   ```

### 4. Test Email Functionality

After configuration, test the email features:

1. **Registration Confirmation**: Register for an event as an attendee
   - You should receive an email with your ticket and QR code attached
   
2. **Announcements**: As an organizer, send an announcement
   - Navigate to Organizer Panel → Announcements
   - Select an event, write a subject and message
   - All registered attendees will receive the email

## Troubleshooting

### Emails Not Sending
- Check the backend console for error messages
- Verify your API key is correct and has full access permissions
- Ensure `FROM_EMAIL` matches your verified sender address
- Check SendGrid dashboard for activity and errors

### Email Validation Errors
- The app validates email format using RFC 5322 pattern
- Ensure attendees enter valid email addresses (e.g., user@domain.com)

### SendGrid Free Tier Limits
- Free tier: 100 emails/day
- If you need more, upgrade your SendGrid plan

## Features

### Registration Confirmation Email
When someone registers for an event, they automatically receive:
- Confirmation of registration
- Event details (title, date, location)
- Ticket ID
- QR code as PNG attachment for check-in

### Event Announcements
Organizers can send bulk announcements to all registered attendees:
- Select an event
- Write subject and message
- Email sent to all unique attendee emails
- Includes event branding

## Email Format Validation

The backend validates all email addresses using the pattern:
```regex
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

Invalid emails will be rejected with a 400 error.

## Security Notes

- Never commit your `.env` file to version control
- Keep your SendGrid API key secret
- Rotate API keys periodically
- Use environment-specific API keys for dev/staging/production
