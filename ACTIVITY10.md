Short Description
Build a platform where organizers can create events and attendees can register online.
Each successful registration generates a unique QR code ticket that can be scanned at the venue to
verify entry.

Backend (NestJS)
● Generate unique ticket IDs/QR codes (e.g., using uuid + a QR code library).
● Prevent duplicate registrations for the same event + enforce capacity limits.
● Securely validate and update ticket status when scanned.

Frontend : Web Apps (React)
● Web App ( Admin Side )
○ Main role: Overall system management
Functions:
1. Home / Events List – view all upcoming events, search & filter.
2. Event Details – view complete event info, edit or delete events.
3. My Tickets (optional if Admin registers) – view tickets with QR if admin
registers as attendee.
4. Organizer Dashboard – create / edit events, monitor attendee counts.
5. Manage Organizers & Staff – add accounts, assign roles, deactivate/activate.
6. Reports / Exports – attendance stats, CSV/Excel download.

● Web App ( Organizer )
○ Main role: Manage their own events and on-site check-in
Functions:
1. Create / Edit Events – set schedule, location, capacity, etc.
2. View Registered Attendees – list with search/filter.
3. Check-in Scanner – use device camera to scan attendee QR codes and call the
verify API.
4. Search Attendees – quick lookup by name, email, or reference code.
5. Export Attendee List – CSV or PDF if needed.
6. Send Announcements / Updates (optional email blast).

● Web App ( Attendees)
○ Main role: Discover events and register
Functions:
1. Register for Events – fill name, email, company (optional).
2. View Event Details – see description, date/time, location.
3. My Tickets – list of tickets with QR code for check-in.
4. Email Notification – receive confirmation email with ticket/QR.
5. Cancel or Update Registration (if allowed).
