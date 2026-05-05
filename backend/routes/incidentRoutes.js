const express = require('express');
const router  = express.Router();
const Incident = require('../models/Incident');

// GET /api/incidents — list all incidents (for community feed & admin)
router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 }).limit(100);
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/incidents — submit a new incident report
router.post('/', async (req, res) => {
  try {
    const { type, location, description, severity, reportedBy, userEmail, gps, photo, photoName } = req.body;
    if (!type || !location || !description || !severity) {
      return res.status(400).json({ message: 'type, location, description, and severity are required.' });
    }
    const incident = await Incident.create({ type, location, description, severity, reportedBy, userEmail, gps, photo, photoName });
    res.status(201).json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/incidents/:id — admin updates status
router.patch('/:id', async (req, res) => {
  try {
    const { verificationStatus } = req.body;
    const incident = await Incident.findByIdAndUpdate(req.params.id, { verificationStatus }, { new: true });
    if (!incident) return res.status(404).json({ message: 'Incident not found.' });
    res.json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
