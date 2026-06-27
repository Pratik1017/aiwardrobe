require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({}, '_id email username name');
    console.log("All registered users:");
    users.forEach(u => console.log(`- ID: ${u._id}, Email: ${u.email}, Username: ${u.username}, Name: ${u.name}`));
    process.exit(0);
  } catch (error) {
    console.error("Error listing users:", error);
    process.exit(1);
  }
};

listUsers();
