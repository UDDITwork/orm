const express = require('express');
const router = express.Router();
const CompanyService = require('../services/companyService');

router.post('/analyze', async (req, res) => {
  try {
    const { companyName, location } = req.body;
    
    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const analysis = await CompanyService.analyzeCompany(companyName, location);
    res.json(analysis);
  } catch (error) {
    console.error('Company analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/search/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const results = await CompanyService.searchCompany(name);
    res.json(results);
  } catch (error) {
    console.error('Company search error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

