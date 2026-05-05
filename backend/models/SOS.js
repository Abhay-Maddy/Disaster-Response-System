const mongoose = require('mongoose');

const SOSSchema = new mongoose.Schema({
  userName:         { type: String, required: true },
  userEmail:        { type: String, default: '' },
  location:         { type: String, default: 'Unknown' },
  address:          { type: String, default: '' },
  contact:          { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  status:           { type: String, default: 'Emergency' },
  time:             { type: String, default: () => new Date().toLocaleString('en-IN') }
}, { timestamps: true });

module.exports = mongoose.model('SOS', SOSSchema);
