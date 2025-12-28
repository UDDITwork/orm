const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const companyRoutes = require('./routes/company');
const reviewRoutes = require('./routes/reviews');
const seoRoutes = require('./routes/seo');
const analysisRoutes = require('./routes/analysis');
const keywordRoutes = require('./routes/keywords');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
try {
  app.use('/api/company', companyRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/seo', seoRoutes);
  app.use('/api/analysis', analysisRoutes);
  app.use('/api/keywords', keywordRoutes);
  console.log('✅ All routes registered successfully');
} catch (error) {
  console.error('❌ Error registering routes:', error);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ORM API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Online Reputation Management API`);
  console.log(`📍 Available endpoints:`);
  console.log(`   - POST /api/analysis/comprehensive`);
  console.log(`   - GET  /api/keywords/status`);
  console.log(`   - GET  /api/health`);
});

