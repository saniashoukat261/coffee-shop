const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Subscriber = require('../models/Subscriber');
const requireAdmin = require('../middleware/requireAdmin');

// POST /api/subscribe - join the newsletter
router.post('/', [
    body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
        const { email } = req.body;
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            // Not an error from the visitor's point of view — just confirm they're already on the list
            return res.json({ success: true, message: 'You are already subscribed!' });
        }
        const subscriber = await Subscriber.create({ email });
        res.status(201).json({ success: true, data: subscriber });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// GET /api/subscribe - list all subscribers (admin only)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
        res.json({ success: true, data: subscribers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
