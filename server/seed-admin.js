require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@aiwardrobe.com';
    
    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('Admin user already exists. Updating role to admin just in case.');
      admin.role = 'admin';
      admin.password = 'Admin@123'; // Will be hashed by pre-save hook
      await admin.save();
    } else {
      console.log('Creating new admin user...');
      admin = new User({
        name: 'Super Admin',
        username: 'superadmin',
        email: adminEmail,
        password: 'Admin@123',
        role: 'admin',
        gender: 'unisex'
      });
      await admin.save();
    }

    console.log('\n✅ Admin account ready!');
    console.log('Email: ' + adminEmail);
    console.log('Password: Admin@123\n');
    
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedAdmin();
