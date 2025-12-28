const Sentiment = require('sentiment');
const natural = require('natural');

class SentimentService {
  static sentiment = new Sentiment();

  static analyze(text) {
    const result = this.sentiment.analyze(text);
    
    let sentiment;
    if (result.score > 2) sentiment = 'positive';
    else if (result.score < -2) sentiment = 'negative';
    else sentiment = 'neutral';

    return {
      sentiment,
      score: result.score,
      comparative: result.comparative,
      tokens: result.tokens,
      words: result.words,
      positive: result.positive,
      negative: result.negative
    };
  }

  static analyzeBatch(reviews) {
    const results = {};
    let totalScore = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    reviews.forEach(review => {
      const text = review.text || '';
      const analysis = this.analyze(text);
      
      results[review.id] = analysis;
      totalScore += analysis.score;

      if (analysis.sentiment === 'positive') positiveCount++;
      else if (analysis.sentiment === 'negative') negativeCount++;
      else neutralCount++;
    });

    return {
      reviews: results,
      summary: {
        total: reviews.length,
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount,
        averageScore: (totalScore / reviews.length).toFixed(2)
      }
    };
  }
}

module.exports = SentimentService;

