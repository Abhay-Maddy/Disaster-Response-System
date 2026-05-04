const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  email:     { type: String, required: true, lowercase: true },
  otp:       { type: String, required: true },
  purpose:   { type: String, enum: ['register', 'reset', 'admin-reset'], default: 'register' },
  expiresAt: { type: Date,   default: () => new Date(Date.now() + 10 * 60 * 1000) }
});

// MongoDB will auto-delete documents once expiresAt is reached
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', OTPSchema);
