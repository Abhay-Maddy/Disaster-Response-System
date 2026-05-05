require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

const app = express();

// ── CORS ───────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://abhay-maddy.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Postman, curl, same-origin)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle OPTIONS preflight for ALL routes
app.options('*', cors());

app.use(express.json({ limit: '10mb' })); // 10MB for base64 photo uploads

// ── MongoDB connection (non-fatal — server keeps running) ───────
let dbConnected = false;
mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log('✅ MongoDB connected'); dbConnected = true; })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('⚠️  Server running WITHOUT database — auth/data routes will fail.');
    // DO NOT call process.exit(1) — keep server alive so CORS preflight works
  });

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/disasters', require('./routes/disasterRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/sos',       require('./routes/sosRoutes'));

// ── Health check ───────────────────────────────────────────────
app.get('/', (req, res) => res.json({
  status: 'OK',
  message: 'Disaster Response API running',
  db: dbConnected ? 'connected' : 'disconnected'
}));

// ── Global error handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ── Start ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
