// Creates an admin account. Run once with:
//   npm run create-admin -- yourUsername yourPassword
//
// The password is never stored as plain text — only a securely hashed version is saved.

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');

async function run() {
    const [, , username, password] = process.argv;

    if (!username || !password) {
        console.log('Usage: npm run create-admin -- <username> <password>');
        process.exit(1);
    }
    if (password.length < 6) {
        console.log('❌ Password should be at least 6 characters.');
        process.exit(1);
    }

    await connectDB();

    const existing = await Admin.findOne({ username });
    if (existing) {
        console.log(`❌ An admin with username "${username}" already exists.`);
        await mongoose.connection.close();
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.create({ username, passwordHash });

    console.log(`✅ Admin user "${username}" created successfully.`);
    console.log('You can now log in at http://localhost:3000/admin-login.html');

    await mongoose.connection.close();
}

run().catch(err => {
    console.error('❌ Failed to create admin:', err.message);
    process.exit(1);
});
