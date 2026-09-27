const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const requireAdmin = require('../middleware/requireAdmin');
const requireUser = require('../middleware/requireUser');

const validateOrder = [
    body('customerName').trim().notEmpty().withMessage('Customer name is required').isLength({ max: 100 }),
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.name').trim().notEmpty().withMessage('Each item needs a name'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Item price must be a positive number'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
    body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number')
];

// POST /api/orders - place a new order (works for guests and logged-in customers)
router.post('/', validateOrder, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
        const { customerName, items, total } = req.body;
        // If the customer is logged in, link this order to their account automatically
        const userId = (req.session && req.session.userId) ? req.session.userId : null;
        const order = await Order.create({ customerName, items, total, user: userId });
        res.status(201).json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// GET /api/orders/mine - order history for the logged-in customer
router.get('/mine', requireUser, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.session.userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/orders - list all orders (admin only)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PATCH /api/orders/:id/status - admin updates an order's progress
router.patch('/:id/status', requireAdmin, [
    body('status').isIn(['pending', 'preparing', 'out for delivery', 'delivered']).withMessage('Invalid status')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
