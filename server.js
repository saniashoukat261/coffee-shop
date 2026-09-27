require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const contactRoutes = require('./routes/contact.routes');
const reservationRoutes = require('./routes/reservation.routes');
const orderRoutes = require('./routes/order.routes');
const menuRoutes = require('./routes/menu.routes');
const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const subscribeRoutes = require('./routes/subscribe.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Database ----
connectDB();

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: '10kb' })); // cap request body size to stop huge/abusive payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ---- Admin session ----
// Note: the default session store keeps sessions in server memory. That's fine
// for a single small server like this one, but if you ever run multiple server
// instances behind a load balancer, switch to a shared store (e.g. connect-mongo).
app.use(session({
    secret: process.env.SESSION_SECRET || 'change-this-secret-in-your-env-file',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 4 // 4 hours
    }
}));

// Serve the existing frontend (index.html, style.css, script.js)
// Assumes the backend folder sits next to your frontend files.
// Adjust the path below if your folder layout is different.
app.use(express.static(__dirname));

// ---- Rate limiting ----
// Limits each IP to 100 requests per 15 minutes on any /api route.
// Stops someone from spamming your contact form or order endpoint.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api', apiLimiter);

// Stricter limit just for admin login attempts, to slow down password guessing
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts. Please try again later.' }
});
app.use('/api/admin/login', loginLimiter);

// ---- API Routes ----
app.use('/api/contact', contactRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subscribe', subscribeRoutes);

// ---- Health check ----
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---- Fallback for unmatched API routes ----
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'API route not found' });
});

app.listen(PORT, () => {
    console.log(`☕ CopyCoffee server running at http://localhost:${PORT}`);
});