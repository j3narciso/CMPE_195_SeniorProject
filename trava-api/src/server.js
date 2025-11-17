/**
 * server.js - Main Express Server
 *
 * Entry point for the TravelGen backend API.
 * Sets up Express server with middleware and routes.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
const placesRoutes = require('./routes/places');
app.use('/api/places', placesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TravelGen API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TravelGen API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      hotels: '/api/places/hotels',
      restaurants: '/api/places/restaurants',
      activities: '/api/places/activities'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: {
      health: '/api/health',
      hotels: '/api/places/hotels',
      restaurants: '/api/places/restaurants',
      activities: '/api/places/activities'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 TravelGen API Server started`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health\n`);
});
