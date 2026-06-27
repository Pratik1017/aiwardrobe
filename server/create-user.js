require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const userData = {
      _id: new mongoose.Types.ObjectId('69efb570e81042421bc7e98e'),
      name: "Aditya",
      username: "Ghule",
      email: "adityaghule@gmail.com",
      password: "Password123!", // Setting a known password
      gender: "male",
      role: "user"
    };

    // Check if user already exists
    let user = await User.findById(userData._id);
    if (user) {
        console.log("User already exists, updating password...");
        user.password = userData.password;
    } else {
        console.log("Creating new user...");
        user = new User(userData);
    }
    
    await user.save();
    console.log("User processed successfully! You can login with email: " + userData.email + " and password: Password123!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating user:", error);
    process.exit(1);
  }
};

createUser();
