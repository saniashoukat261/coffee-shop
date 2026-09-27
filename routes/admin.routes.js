const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');

// POST /api/admin/login
router.post('/login', [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username: username.trim() });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
        const match = await bcrypt.compare(password, admin.passwordHash);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
        req.session.isAdmin = true;
        req.session.username = admin.username;
        res.json({ success: true, username: admin.username });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

// GET /api/admin/check - lets the dashboard page know if the visitor is logged in
router.get('/check', (req, res) => {
    res.json({
        success: true,
        isAdmin: !!(req.session && req.session.isAdmin),
        username: (req.session && req.session.username) || null
    });
});

module.exports = router;
