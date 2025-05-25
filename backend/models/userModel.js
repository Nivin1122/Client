const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: { type: String },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }
});


const User = mongoose.model("User", userSchema);
module.exports = User;
