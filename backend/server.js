require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

const app = express();

// ── FIXED CORS (IMPORTANT) ─────────────────────────────────────
const allowedOrigins = [
  "https://abhay-maddy.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://localhost:5000"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// Handle preflight OPTIONS for ALL routes FIRST
app.options("*", cors(corsOptions));

// Then apply CORS to all other requests
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));

// ── MongoDB ───────────────────────────────────────────────────
let dbConnected = false;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    dbConnected = true;
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/disasters', require('./routes/disasterRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/sos',       require('./routes/sosRoutes'));

// ── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => res.json({
  status: 'OK',
  message: 'Disaster Response API running',
  db: dbConnected ? 'connected' : 'disconnected',
  email: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) ? 'configured' : 'NOT CONFIGURED'
}));

// ── Debug endpoint (check env var status without revealing secrets) ──
app.get('/debug', (req, res) => res.json({
  MONGO_URI: process.env.MONGO_URI ? '✅ SET (' + process.env.MONGO_URI.substring(0, 20) + '...)' : '❌ NOT SET',
  GMAIL_USER: process.env.GMAIL_USER ? '✅ SET (' + process.env.GMAIL_USER + ')' : '❌ NOT SET',
  GMAIL_APP_PASS: process.env.GMAIL_APP_PASS ? '✅ SET (hidden)' : '❌ NOT SET',
  ML_PREDICT_URL: process.env.ML_PREDICT_URL || '❌ NOT SET',
  PORT: process.env.PORT || '5000 (default)',
  dbConnected,
  nodeVersion: process.version
}));

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  // Don't hang — always send a response
  if (!res.headersSent) {
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

app.post('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend working'
  });
});
