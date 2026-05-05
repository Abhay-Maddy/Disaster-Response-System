const express = require('express');
const router  = express.Router();
const SOS     = require('../models/SOS');

// GET /api/sos — list all SOS requests (admin)
router.get('/', async (req, res) => {
  try {
    const requests = await SOS.find().sort({ createdAt: -1 }).limit(200);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/sos — citizen triggers SOS
router.post('/', async (req, res) => {
  try {
    const { userName, userEmail, location, address, contact, emergencyContact } = req.body;
    if (!userName) return res.status(400).json({ message: 'userName is required.' });
    const sos = await SOS.create({ userName, userEmail, location, address, contact, emergencyContact });
    res.status(201).json({ success: true, sos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/sos/:id — admin updates status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const sos = await SOS.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!sos) return res.status(404).json({ message: 'SOS not found.' });
    res.json({ success: true, sos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
