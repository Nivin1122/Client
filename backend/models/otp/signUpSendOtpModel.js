const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  newEmail: {
    type: String,
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
  }
});

module.exports = mongoose.model('Otp', otpSchema);

