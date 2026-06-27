require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const userId = '69efb570e81042421bc7e98e';
    const newPassword = 'Password123!';

    const user = await User.findById(userId);
    if (!user) {
      console.log(`User with ID ${userId} not found.`);
      process.exit(1);
    }

    user.password = newPassword;
    await user.save();

    console.log(`Password for user ${user.email || userId} successfully reset to: ${newPassword}`);
    process.exit(0);
  } catch (error) {
    console.error("Error resetting password:", error);
    process.exit(1);
  }
};

resetPassword();
