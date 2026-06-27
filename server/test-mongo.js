const mongoose = require('mongoose');

const uri = "mongodb+srv://mistercortexofficial_db_user:77jMbXf01MhUcB2c@aiwardrobe.es9mna5.mongodb.net/aiwardrobe?retryWrites=true&w=majority&appName=aiwardrobe";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
