const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:            { type: String, default: '' },
  address:          { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  password:         { type: String, required: true },
  credits:          { type: Number, default: 100 },
  role:             { type: String, default: 'citizen' },
  joinedAt:         { type: String, default: () => new Date().toLocaleDateString('en-IN') }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
