const express = require('express');
const router = express.Router();
const ReviewService = require('../services/reviewService');

router.post('/scrape', async (req, res) => {
  try {
    const { companyName, location, platform } = req.body;
    
    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const reviews = await ReviewService.scrapeReviews(companyName, location, platform);
    res.json(reviews);
  } catch (error) {
    console.error('Review scraping error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze-sentiment', async (req, res) => {
  try {
    const { reviews } = req.body;
    
    if (!reviews || !Array.isArray(reviews)) {
      return res.status(400).json({ error: 'Reviews array is required' });
    }

    const sentimentAnalysis = await ReviewService.analyzeSentiment(reviews);
    res.json(sentimentAnalysis);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/platforms', (req, res) => {
  res.json({
    platforms: ['google', 'yelp', 'reddit', 'tripadvisor', 'facebook', 'trustpilot']
  });
});

module.exports = router;

