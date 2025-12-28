const express = require('express');
const router = express.Router();
const SEOService = require('../services/seoService');

router.post('/analyze', async (req, res) => {
  try {
    const { companyName, website } = req.body;
    
    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const seoAnalysis = await SEOService.analyzeSEO(companyName, website);
    res.json(seoAnalysis);
  } catch (error) {
    console.error('SEO analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/score', async (req, res) => {
  try {
    const { companyName, website } = req.body;
    
    const seoScore = await SEOService.calculateSEOScore(companyName, website);
    res.json(seoScore);
  } catch (error) {
    console.error('SEO scoring error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

