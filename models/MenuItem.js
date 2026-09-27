const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, default: 'coffee' },
    image: { type: String }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
