const axios = require('axios');
const SentimentService = require('./sentimentService');
const AIService = require('./aiService');
const Review = require('../models/Review');

class ReviewService {
  static async scrapeReviews(companyName, location = '', platform = 'all') {
    const reviews = [];
    const platforms = platform === 'all' 
      ? ['google', 'yelp', 'reddit'] 
      : [platform];

    for (const plat of platforms) {
      try {
        let platformReviews = [];
        
        if (plat === 'google' && process.env.GOOGLE_PLACES_API_KEY) {
          platformReviews = await this.scrapeGoogleReviews(companyName, location);
        } else if (plat === 'yelp' && process.env.YELP_API_KEY) {
          platformReviews = await this.scrapeYelpReviews(companyName, location);
        } else if (plat === 'reddit' && process.env.REDDIT_CLIENT_ID) {
          platformReviews = await this.scrapeRedditReviews(companyName);
        }
        
        reviews.push(...platformReviews);
      } catch (error) {
        console.error(`Error scraping ${plat} reviews:`, error.message);
        // Continue with other platforms even if one fails
      }
    }

    return {
      companyName,
      location,
      totalReviews: reviews.length,
      reviews: reviews,
      platforms: platforms,
      timestamp: new Date().toISOString()
    };
  }

  static async scrapeGoogleReviews(companyName, location) {
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    try {
      // Step 1: Find place by text search
      const searchUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
      const searchParams = new URLSearchParams({
        query: `${companyName} ${location}`,
        key: process.env.GOOGLE_PLACES_API_KEY
      });

      const searchResponse = await axios.get(`${searchUrl}?${searchParams}`);
      
      if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
        return [];
      }

      const placeId = searchResponse.data.results[0].place_id;

      // Step 2: Get place details including reviews
      const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
      const detailsParams = new URLSearchParams({
        place_id: placeId,
        fields: 'name,rating,user_ratings_total,reviews',
        key: process.env.GOOGLE_PLACES_API_KEY
      });

      const detailsResponse = await axios.get(`${detailsUrl}?${detailsParams}`);
      
      if (!detailsResponse.data.result || !detailsResponse.data.result.reviews) {
        return [];
      }

      const googleReviews = detailsResponse.data.result.reviews.map((review, index) => {
        const sentiment = SentimentService.analyze(review.text);
        
        return {
          id: `google-${placeId}-${index}`,
          platform: 'google',
          author: review.author_name || 'Anonymous',
          rating: review.rating,
          text: review.text,
          date: new Date(review.time * 1000).toISOString(),
          sentiment: sentiment.sentiment,
          sentimentScore: sentiment.score,
          verified: false
        };
      });

      return googleReviews;
    } catch (error) {
      console.error('Google Places API error:', error.message);
      throw error;
    }
  }

  static async scrapeYelpReviews(companyName, location) {
    if (!process.env.YELP_API_KEY) {
      throw new Error('Yelp API key not configured');
    }

    try {
      const searchUrl = 'https://api.yelp.com/v3/businesses/search';
      const headers = {
        'Authorization': `Bearer ${process.env.YELP_API_KEY}`
      };
      
      const params = {
        term: companyName,
        location: location || 'United States',
        limit: 1
      };

      const searchResponse = await axios.get(searchUrl, { headers, params });
      
      if (!searchResponse.data.businesses || searchResponse.data.businesses.length === 0) {
        return [];
      }

      const businessId = searchResponse.data.businesses[0].id;

      // Get business reviews
      const reviewsUrl = `https://api.yelp.com/v3/businesses/${businessId}/reviews`;
      const reviewsResponse = await axios.get(reviewsUrl, { headers });

      if (!reviewsResponse.data.reviews) {
        return [];
      }

      const yelpReviews = reviewsResponse.data.reviews.map((review, index) => {
        const sentiment = SentimentService.analyze(review.text);
        
        return {
          id: `yelp-${businessId}-${index}`,
          platform: 'yelp',
          author: review.user.name || 'Anonymous',
          rating: review.rating,
          text: review.text,
          date: review.time_created,
          sentiment: sentiment.sentiment,
          sentimentScore: sentiment.score,
          verified: false
        };
      });

      return yelpReviews;
    } catch (error) {
      console.error('Yelp API error:', error.message);
      throw error;
    }
  }

  static async getRedditAccessToken() {
    if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
      throw new Error('Reddit API credentials not configured');
    }

    try {
      // Get OAuth token using client credentials (for read-only access)
      const authUrl = 'https://www.reddit.com/api/v1/access_token';
      const authData = new URLSearchParams({
        grant_type: 'client_credentials'
      });

      const authResponse = await axios.post(authUrl, authData, {
        auth: {
          username: process.env.REDDIT_CLIENT_ID,
          password: process.env.REDDIT_CLIENT_SECRET
        },
        headers: {
          'User-Agent': process.env.REDDIT_USER_AGENT || 'ORM-Review-Tool/1.0',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return authResponse.data.access_token;
    } catch (error) {
      console.error('Reddit authentication error:', error.message);
      throw new Error('Failed to authenticate with Reddit API');
    }
  }

  static async scrapeRedditReviews(companyName) {
    if (!process.env.REDDIT_CLIENT_ID) {
      throw new Error('Reddit API credentials not configured');
    }

    try {
      // Get access token
      const accessToken = await this.getRedditAccessToken();

      // Search Reddit for posts about the company
      const searchUrl = 'https://oauth.reddit.com/search';
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'ORM-Review-Tool/1.0'
      };

      const params = {
        q: companyName,
        type: 'link',
        sort: 'relevance',
        limit: 25
      };

      const searchResponse = await axios.get(searchUrl, { headers, params });

      if (!searchResponse.data.data || !searchResponse.data.data.children) {
        return [];
      }

      const redditReviews = [];
      const posts = searchResponse.data.data.children;

      for (const post of posts) {
        const postData = post.data;
        
        // Extract post as a review
        if (postData.selftext || postData.title) {
          const text = postData.selftext || postData.title;
          const sentiment = SentimentService.analyze(text);
          
          // Calculate rating based on upvotes and sentiment
          const upvoteRatio = postData.upvote_ratio || 0.5;
          const rating = Math.round((upvoteRatio * 4) + 1); // Convert to 1-5 scale

          redditReviews.push({
            id: `reddit-${postData.id}`,
            platform: 'reddit',
            author: postData.author || 'Anonymous',
            rating: rating,
            text: text.substring(0, 1000), // Limit text length
            date: new Date(postData.created_utc * 1000).toISOString(),
            sentiment: sentiment.sentiment,
            sentimentScore: sentiment.score,
            verified: false,
            subreddit: postData.subreddit,
            upvotes: postData.ups || 0,
            url: `https://reddit.com${postData.permalink}`
          });
        }

        // Also get top comments from the post
        if (postData.num_comments > 0) {
          try {
            const commentsUrl = `https://oauth.reddit.com${postData.permalink}.json`;
            const commentsResponse = await axios.get(commentsUrl, { headers });
            
            if (commentsResponse.data && commentsResponse.data[1] && commentsResponse.data[1].data) {
              const topComments = commentsResponse.data[1].data.children.slice(0, 5);
              
              topComments.forEach((comment, index) => {
                if (comment.data.body && !comment.data.body.startsWith('[deleted]')) {
                  const commentText = comment.data.body;
                  const commentSentiment = SentimentService.analyze(commentText);
                  const commentUpvoteRatio = comment.data.upvote_ratio || 0.5;
                  const commentRating = Math.round((commentUpvoteRatio * 4) + 1);

                  redditReviews.push({
                    id: `reddit-comment-${comment.data.id}`,
                    platform: 'reddit',
                    author: comment.data.author || 'Anonymous',
                    rating: commentRating,
                    text: commentText.substring(0, 1000),
                    date: new Date(comment.data.created_utc * 1000).toISOString(),
                    sentiment: commentSentiment.sentiment,
                    sentimentScore: commentSentiment.score,
                    verified: false,
                    subreddit: postData.subreddit,
                    upvotes: comment.data.ups || 0,
                    url: `https://reddit.com${postData.permalink}`,
                    isComment: true
                  });
                }
              });
            }
          } catch (commentError) {
            console.error('Error fetching comments:', commentError.message);
            // Continue without comments if there's an error
          }
        }
      }

      return redditReviews;
    } catch (error) {
      console.error('Reddit API error:', error.message);
      throw error;
    }
  }

  static async saveReviews(reviews, companyId, companyName) {
    const savedReviews = [];
    
    for (const review of reviews) {
      try {
        // Check if review already exists
        const existing = await Review.findOne({
          companyId,
          platform: review.platform,
          text: review.text,
          date: review.date
        });

        if (!existing) {
          const newReview = new Review({
            companyId,
            companyName,
            platform: review.platform,
            author: review.author,
            rating: review.rating,
            text: review.text,
            date: review.date,
            sentiment: review.sentiment,
            sentimentScore: review.sentimentScore,
            location: review.location,
            verified: review.verified || false
          });

          const saved = await newReview.save();
          savedReviews.push(saved);
        } else {
          savedReviews.push(existing);
        }
      } catch (error) {
        console.error('Error saving review:', error.message);
      }
    }

    return savedReviews;
  }

  static async analyzeSentiment(reviews) {
    if (!reviews || reviews.length === 0) {
      throw new Error('No reviews provided for analysis');
    }

    // Use AI service for advanced sentiment analysis
    const aiAnalysis = await AIService.analyzeReviewSentiments(reviews);
    
    // Also use local sentiment analysis for comparison
    const reviewTexts = reviews.map(r => ({ 
      id: r.id || r._id?.toString() || Math.random().toString(), 
      text: r.text || '' 
    }));
    const localAnalysis = SentimentService.analyzeBatch(reviewTexts);

    // Calculate statistics
    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0
    };

    reviews.forEach(review => {
      const reviewId = review.id || review._id?.toString() || Math.random().toString();
      const sentiment = review.sentiment || localAnalysis.reviews[reviewId]?.sentiment || 'neutral';
      sentimentCounts[sentiment]++;
    });

    const total = reviews.length;
    const sentimentPercentages = {
      positive: ((sentimentCounts.positive / total) * 100).toFixed(1),
      negative: ((sentimentCounts.negative / total) * 100).toFixed(1),
      neutral: ((sentimentCounts.neutral / total) * 100).toFixed(1)
    };

    // Calculate average rating
    const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total;

    return {
      totalReviews: total,
      averageRating: avgRating.toFixed(2),
      sentimentDistribution: sentimentPercentages,
      sentimentCounts,
      aiInsights: aiAnalysis.insights,
      recommendations: aiAnalysis.recommendations,
      detailedAnalysis: localAnalysis,
      timestamp: new Date().toISOString()
    };
  }

  static async getStoredReviews(companyName, limit = 100) {
    return await Review.find({ companyName })
      .sort({ date: -1 })
      .limit(limit)
      .lean();
  }
}

module.exports = ReviewService;
