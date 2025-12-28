const express = require('express');
const router = express.Router();
const AnalysisService = require('../services/analysisService');

router.post('/comprehensive', async (req, res) => {
  try {
    const { companyName, location, website } = req.body;
    
    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const comprehensiveAnalysis = await AnalysisService.getComprehensiveAnalysis(
      companyName,
      location,
      website
    );
    res.json(comprehensiveAnalysis);
  } catch (error) {
    console.error('Comprehensive analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/recommendations', async (req, res) => {
  try {
    const { analysisData } = req.body;
    
    const recommendations = await AnalysisService.generateRecommendations(analysisData);
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

