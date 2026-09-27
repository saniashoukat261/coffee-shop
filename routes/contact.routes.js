const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const requireAdmin = require('../middleware/requireAdmin');

const validateContact = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 1000 }).withMessage('Message is too long')
];

// POST /api/contact - save a new message
router.post('/', validateContact, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
        const { name, email, message } = req.body;
        const contact = await Contact.create({ name, email, message });
        res.status(201).json({ success: true, data: contact });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// GET /api/contact - list all messages (admin only)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, data: contacts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
