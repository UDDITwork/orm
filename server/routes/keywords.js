const express = require('express');
const router = express.Router();
const KeywordService = require('../services/keywordService');

// Get available endpoints
router.get('/endpoints', async (req, res) => {
  try {
    if (!KeywordService.isConfigured()) {
      return res.status(400).json({ 
        error: 'DataForSEO credentials not configured',
        message: 'Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env'
      });
    }

    const result = await KeywordService.getEndpoints();
    
    if (result.success) {
      res.json({
        success: true,
        endpoints: result.endpoints,
        categorized: result.categorized,
        total: result.endpoints.length
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Keywords endpoints error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available features
router.get('/features', async (req, res) => {
  try {
    if (!KeywordService.isConfigured()) {
      return res.status(400).json({ 
        error: 'DataForSEO credentials not configured',
        message: 'Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env'
      });
    }

    const features = await KeywordService.getAvailableFeatures();
    res.json(features);
  } catch (error) {
    console.error('Keywords features error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if configured
router.get('/status', (req, res) => {
  res.json({
    configured: KeywordService.isConfigured()
  });
});

module.exports = router;
```

