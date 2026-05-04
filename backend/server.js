require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

const app = express();

// ── CORS: allow GitHub Pages and local dev ─────────────────────
app.use(cors({
  origin: [
    'https://abhay-maddy.github.io',
    'http://localhost:5173',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// ── MongoDB connection ─────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB connection error:', err.message); process.exit(1); });

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));

// Health check
app.get('/', (req, res) => res.json({ status: 'OK', message: 'Disaster Response API running' }));

// ── Start ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
