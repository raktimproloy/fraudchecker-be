// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');

// Import configuration
const config = require('../config/environment');
const database = require('../config/database');

// Import routes
const authRoutes = require('../routes/auth');
const publicRoutes = require('../routes/public');
const userRoutes = require('../routes/user');
const fraudReportRoutes = require('../routes/fraudReport');
const adminRoutes = require('../routes/admin');

// Import middleware
const errorHandler = require('../middleware/errorHandler');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Static files for uploaded images (Note: Vercel has limitations with file uploads)
// For production, consider using cloud storage like AWS S3, Cloudinary, or Vercel Blob
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/fraud', authenticateToken, fraudReportRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use(errorHandler);

// Initialize database connection
let dbConnected = false;

const initializeDatabase = async () => {
  if (!dbConnected) {
    try {
      await database.connect();
      dbConnected = true;
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
    }
  }
};

// Initialize database on first request
app.use(async (req, res, next) => {
  await initializeDatabase();
  next();
});

// Export for Vercel
module.exports = app;
