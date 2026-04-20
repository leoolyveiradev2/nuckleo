// Entry point - Placeholder
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const rateLimiter = require('./middlewares/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const spaceRoutes = require('./routes/spaceRoutes');
const itemRoutes = require('./routes/itemRoutes');
const searchRoutes = require('./routes/searchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ──────────────────────────────────────────
// Database
// ──────────────────────────────────────────
connectDB();

// ──────────────────────────────────────────
// Core Middlewares
// ──────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ──────────────────────────────────────────
// Rate Limiting
// ──────────────────────────────────────────
app.use('/api', rateLimiter);

// ──────────────────────────────────────────
// Routes
// ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Nuckleo API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────
// Error Handling
// ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ──────────────────────────────────────────
// Start
// ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Nuckleo API running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`📦 MongoDB: connecting...\n`);
});

module.exports = app;