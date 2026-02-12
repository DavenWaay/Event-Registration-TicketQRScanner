require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('express').json;
const eventsRoute = require('./routes/events');
const registrationsRoute = require('./routes/registrations');
const verifyRoute = require('./routes/verify');
const authRoute = require('./routes/auth');
const adminRoute = require('./routes/admin');
const reportsRoute = require('./routes/reports');
const announcementsRoute = require('./routes/announcements');
const swaggerUi = require('swagger-ui-express')
const fs = require('fs')
let swaggerSpec = null
try{
	swaggerSpec = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', 'swagger.json'), 'utf8'))
}catch(e){
	console.warn('Swagger spec not found or invalid:', e.message)
}

const app = express();

// CORS Configuration - Allow frontend domain
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser());

app.use('/api/events', eventsRoute);
app.use('/api/registrations', registrationsRoute);
app.use('/api/verify', verifyRoute);
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/reports', reportsRoute);
app.use('/api/announcements', announcementsRoute);

if (swaggerSpec) {
	app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

const port = process.env.PORT || 4000;

// simple request logger
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
	next()
})

// global error handler
app.use((err, req, res, next) => {
	console.error('Unhandled error:', err)
	try{
		const fs = require('fs')
		const path = require('path')
		const logDir = path.join(__dirname, '..', 'logs')
		fs.mkdirSync(logDir, { recursive: true })
		fs.appendFileSync(path.join(logDir, 'error.log'), `${new Date().toISOString()} ${err.stack || err}\n`)
	}catch(e){
		console.error('Failed to write error log', e)
	}
	res.status(500).json({ message: 'Internal server error' })
})

app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));

process.on('uncaughtException', (err) => {
	console.error('uncaughtException', err)
})

process.on('unhandledRejection', (reason) => {
	console.error('unhandledRejection', reason)
})
