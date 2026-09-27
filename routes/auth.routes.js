const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const requireUser = require('../middleware/requireUser');

// POST /api/auth/signup
router.post('/signup', [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
        const { name, email, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, passwordHash });

        req.session.userId = user._id;
        req.session.userName = user.name;

        res.status(201).json({ success: true, name: user.name, email: user.email });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/auth/login
router.post('/login', [
    body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        req.session.userId = user._id;
        req.session.userName = user.name;

        res.json({ success: true, name: user.name, email: user.email });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

// GET /api/auth/me - is anyone logged in, and who
router.get('/me', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.json({ success: true, loggedIn: false });
    }
    try {
        const user = await User.findById(req.session.userId).select('-passwordHash');
        if (!user) {
            return res.json({ success: true, loggedIn: false });
        }
        res.json({ success: true, loggedIn: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/auth/address - save/update the logged-in customer's delivery address
router.put('/address', requireUser, [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('street').trim().notEmpty().withMessage('Street address is required'),
    body('city').trim().notEmpty().withMessage('City is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
        const { fullName, phone, street, city } = req.body;
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { address: { fullName, phone, street, city } },
            { new: true }
        ).select('-passwordHash');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
