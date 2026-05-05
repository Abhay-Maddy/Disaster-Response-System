const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  reportedBy: { type: String, default: 'Anonymous' },
  userEmail: { type: String, default: '' },
  gps: { type: String, default: '' },
  photo: { type: String, default: null },   // base64 or URL
  photoName: { type: String, default: null },
  verificationStatus: { type: String, default: 'Pending' },
  time: { type: String, default: () => new Date().toLocaleString('en-IN') }
}, { timestamps: true });

module.exports = mongoose.model('Incident', IncidentSchema);
