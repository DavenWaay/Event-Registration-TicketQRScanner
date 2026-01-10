# Event Registration Backend (scaffold)

Quick start (inside `backend`):

Windows (PowerShell):

```powershell
cd "Event-Registration-TicketQRScanner/backend"
npm install
npm run dev
```

APIs:
- `GET /api/events` - list events
- `GET /api/events/:id` - event details
- `POST /api/events` - create event (body: title, description, date, location, capacity)
- `POST /api/registrations/:eventId/register` - register (body: name, email, company) -> returns ticket with `qr` data URL
- `POST /api/verify` - verify ticket (body: ticketId)

Auth endpoints:
- `POST /api/auth/register` - create user (body: username, password, role)
- `POST /api/auth/login` - login -> returns `{ token }`

Notes:
- `POST /api/verify` now requires `Authorization: Bearer <token>` (organizer/admin JWT).
