const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const requireAdmin = require('../middleware/requireAdmin');

const validateReservation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('phone').trim().notEmpty().withMessage('Phone number is required').isLength({ min: 7, max: 20 }).withMessage('Enter a valid phone number'),
    body('date').notEmpty().withMessage('Date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('guests').isInt({ min: 1, max: 20 }).withMessage('Guests must be between 1 and 20')
];

// POST /api/reservations - book a table
router.post('/', validateReservation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
        const { name, phone, date, time, guests } = req.body;
        const reservation = await Reservation.create({ name, phone, date, time, guests });
        res.status(201).json({ success: true, data: reservation });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// GET /api/reservations - list all reservations (admin only)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ createdAt: -1 });
        res.json({ success: true, data: reservations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
