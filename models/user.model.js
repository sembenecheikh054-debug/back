// backend/models/user.model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    nom:      { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: {
    type: Boolean,
    default: false,
  },

   verificationToken: {
        type: String,
    },
    
});

module.exports = mongoose.model("User", userSchema);