const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  adminId:    { type: String, required: true, unique: true, trim: true },
  department: { type: String, default: '' },
  password:   { type: String, required: true },
  region:     { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);
