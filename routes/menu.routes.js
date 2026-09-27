const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const requireAdmin = require('../middleware/requireAdmin');

const validateMenuItem = [
    body('name').trim().notEmpty().withMessage('Item name is required').isLength({ max: 100 }),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description is too long'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').optional().trim().isIn(['signature', 'hot', 'iced', 'treats', 'coffee']).withMessage('Invalid category'),
    body('image').optional({ checkFalsy: true }).trim().isURL().withMessage('Image must be a valid URL')
];

// GET /api/menu - list all menu items (public, shown on the homepage)
router.get('/', async (req, res) => {
    try {
        const items = await MenuItem.find();
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/menu - add a new menu item (admin only)
router.post('/', requireAdmin, validateMenuItem, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
        const { name, description, price, category, image } = req.body;
        const item = await MenuItem.create({ name, description, price, category, image });
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// PUT /api/menu/:id - edit an existing menu item (admin only)
router.put('/:id', requireAdmin, validateMenuItem, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
        const { name, description, price, category, image } = req.body;
        const item = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { name, description, price, category, image },
            { new: true, runValidators: true }
        );
        if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE /api/menu/:id - remove a menu item (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
        res.json({ success: true, message: 'Menu item deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
