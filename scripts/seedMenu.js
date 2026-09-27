// One-time (or re-runnable) script to load your menu into MongoDB.
// Run it with:  node scripts/seedMenu.js

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const MenuItem = require('../models/MenuItem');

const menuItems = [
    // Signature Drinks (shown as image cards)
    { name: 'Espresso', description: 'Strong and rich coffee shot', price: 4.00, category: 'signature', image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=600&q=80' },
    { name: 'Latte', description: 'Smooth milk coffee blend', price: 5.00, category: 'signature', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80' },
    { name: 'Mocha', description: 'Chocolate flavored espresso', price: 6.00, category: 'signature', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=600&q=80' },
    { name: 'Cappuccino', description: 'Creamy foam coffee perfection', price: 6.00, category: 'signature', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80' },

    // Hot Classics (shown as simple list rows)
    { name: 'Caffè Americano', price: 3.50, category: 'hot' },
    { name: 'Flat White', price: 5.25, category: 'hot' },
    { name: 'Cortado', price: 4.00, category: 'hot' },
    { name: 'Classic Macchiato', price: 4.50, category: 'hot' },
    { name: 'Cappuccino Classico', price: 4.75, category: 'hot' },
    { name: 'Caramel Macchiato', price: 5.50, category: 'hot' },

    // Iced & Refreshing
    { name: '18-Hour Cold Brew', price: 4.50, category: 'iced' },
    { name: 'Caramel Frappé', price: 6.50, category: 'iced' },
    { name: 'Vanilla Sweet Cream', price: 5.75, category: 'iced' },
    { name: 'Iced Spanish Latte', price: 6.00, category: 'iced' },
    { name: 'Iced Mocha Mint', price: 6.25, category: 'iced' },
    { name: 'Cold Peach Black Tea', price: 4.25, category: 'iced' },

    // Artisan Specials & Treats
    { name: 'Gelato Affogato', price: 8.00, category: 'treats' },
    { name: 'Turkish Cardamom Brew', price: 5.50, category: 'treats' },
    { name: 'Butter Croissant', price: 3.00, category: 'treats' },
    { name: 'Blueberry Muffin', price: 3.50, category: 'treats' },
];

async function seed() {
    await connectDB();

    // Clear out any existing menu items so re-running this script doesn't create duplicates
    await MenuItem.deleteMany({});
    console.log('🧹 Cleared existing menu items');

    const inserted = await MenuItem.insertMany(menuItems);
    console.log(`✅ Inserted ${inserted.length} menu items into the database`);

    await mongoose.connection.close();
    console.log('👋 Done. Connection closed.');
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
});
