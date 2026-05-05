const Disaster = require('../models/Disaster');
const axios = require('axios');

// In-Memory database for when MongoDB drops or isn't set up.
let mockDisasters = [
    {
        _id: "1",
        type: "Earthquake",
        description: "Magnitude 7.2 earthquake affecting regional borders.",
        latitude: 34.0522,
        longitude: -118.2437,
        casualties: 1500,
        economic_loss: 45000000,
        priority: "high",
        status: "Reported",
        createdAt: new Date()
    },
    {
        _id: "2",
        type: "Flood",
        description: "Heavy monsoons causing severe urban flooding.",
        latitude: 19.0760,
        longitude: 72.8777,
        casualties: 45,
        economic_loss: 800000,
        priority: "low",
        status: "Responding",
        createdAt: new Date(Date.now() - 86400000)
    }
];

// @desc    Get all disasters
// @route   GET /api/disasters
// @access  Public
const getDisasters = async (req, res) => {
    try {
        const disasters = await Disaster.find().sort({ createdAt: -1 });
        res.status(200).json(disasters.length ? disasters : mockDisasters);
    } catch (error) {
        console.error("DB Error fetching disasters:", error.message);
        res.status(200).json(mockDisasters);
    }
};

// @desc    Add new disaster
// @route   POST /api/disasters
// @access  Public
const addDisaster = async (req, res) => {
    try {
        const { type, description, latitude, longitude, casualties, economic_loss } = req.body;

        // Call AI Module to predict priority
        let priority = 'low'; // fallback
        try {
            const mlResponse = await axios.post(process.env.ML_PREDICT_URL || 'http://127.0.0.1:8000/predict', {
                type,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                casualties: parseInt(casualties),
                economic_loss: parseFloat(economic_loss)
            });
            priority = mlResponse.data.priority || 'low';
        } catch (mlError) {
            console.error('Error connecting to ML Service:', mlError.message);
            // Simulate ML priority if offline for demo
            if (parseInt(casualties) > 100) priority = 'high';
            else if (parseInt(casualties) > 20) priority = 'medium';
            else priority = 'low';
        }

        const newDisasterData = {
            type,
            description,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            casualties: parseInt(casualties),
            economic_loss: parseFloat(economic_loss),
            priority,
            status: 'Reported',
            createdAt: new Date()
        };

        const newDisaster = new Disaster(newDisasterData);
        const savedDisaster = await newDisaster.save();
        res.status(201).json(savedDisaster);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getDisasters,
    addDisaster
};
