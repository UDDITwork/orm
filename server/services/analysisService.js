const CompanyService = require('./companyService');
const ReviewService = require('./reviewService');
const SEOService = require('./seoService');
const AIService = require('./aiService');
const Analysis = require('../models/Analysis');

class AnalysisService {
  static async getComprehensiveAnalysis(companyName, location = '', website = '') {
    try {
      // Get or create company
      const company = await CompanyService.getOrCreateCompany(companyName, location, website);

      // Check for recent analysis (within last hour) - only if MongoDB is connected
      let recentAnalysis = null;
      try {
        recentAnalysis = await Analysis.findOne({
          companyId: company._id
        }).sort({ createdAt: -1 });

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (recentAnalysis && recentAnalysis.createdAt > oneHourAgo) {
          // Return cached analysis
          return this.formatAnalysisResponse(recentAnalysis, company);
        }
      } catch (dbError) {
        console.warn('MongoDB query failed, continuing without cache:', dbError.message);
      }

      // Run all analyses in parallel
      const [companyData, reviewsData, seoAnalysis] = await Promise.all([
        CompanyService.analyzeCompany(companyName, location),
        ReviewService.scrapeReviews(companyName, location),
        SEOService.calculateSEOScore(companyName, website)
      ]);

      // Save reviews to database (with error handling)
      let savedReviews = [];
      try {
        savedReviews = await ReviewService.saveReviews(
          reviewsData.reviews,
          company._id,
          companyName
        );
      } catch (dbError) {
        console.warn('Failed to save reviews to database:', dbError.message);
        savedReviews = reviewsData.reviews || [];
      }

      // Analyze sentiment of reviews
      const sentimentAnalysis = await ReviewService.analyzeSentiment(savedReviews);

      // Generate AI-powered recommendations
      const recommendations = await AIService.generateRecommendations({
        seoScore: seoAnalysis.overallScore,
        sentiment: sentimentAnalysis.sentimentDistribution,
        reviewCount: reviewsData.totalReviews,
        averageRating: sentimentAnalysis.averageRating
      });

      // Calculate overall reputation score
      const reputationScore = this.calculateReputationScore({
        seo: seoAnalysis.overallScore,
        sentiment: sentimentAnalysis,
        reviews: reviewsData
      });

      // Format charts
      const charts = {
        sentimentDistribution: this.formatSentimentChart(sentimentAnalysis),
        ratingDistribution: this.formatRatingChart(savedReviews),
        seoBreakdown: this.formatSEOChart(seoAnalysis),
        timeline: this.formatTimelineChart(savedReviews)
      };

      // Save analysis to database (with error handling)
      let savedAnalysis = null;
      try {
        const analysisData = {
          companyId: company._id,
          companyName,
          location,
          website,
          overallScore: reputationScore,
          seo: {
            overallScore: seoAnalysis.overallScore,
            grade: seoAnalysis.grade,
            breakdown: seoAnalysis.breakdown,
            recommendations: seoAnalysis.recommendations
          },
          sentiment: {
            totalReviews: sentimentAnalysis.totalReviews,
            averageRating: parseFloat(sentimentAnalysis.averageRating),
            sentimentDistribution: {
              positive: parseFloat(sentimentAnalysis.sentimentDistribution.positive),
              negative: parseFloat(sentimentAnalysis.sentimentDistribution.negative),
              neutral: parseFloat(sentimentAnalysis.sentimentDistribution.neutral)
            },
            sentimentCounts: sentimentAnalysis.sentimentCounts,
            aiInsights: sentimentAnalysis.aiInsights,
            recommendations: sentimentAnalysis.recommendations
          },
          metrics: {
            totalReviews: reviewsData.totalReviews,
            averageRating: parseFloat(sentimentAnalysis.averageRating),
            seoScore: seoAnalysis.overallScore,
            sentimentScore: this.calculateSentimentScore(sentimentAnalysis),
            responseRate: companyData.metrics.responseRate
          },
          recommendations: recommendations.recommendations || [],
          charts
        };

        savedAnalysis = new Analysis(analysisData);
        await savedAnalysis.save();
      } catch (dbError) {
        console.warn('Failed to save analysis to database:', dbError.message);
        // Create a mock timestamp if save failed
        savedAnalysis = { createdAt: new Date() };
      }

      return {
        companyName,
        location,
        website,
        timestamp: savedAnalysis.createdAt.toISOString(),
        overallScore: reputationScore,
        companyInfo: companyData,
        reviews: {
          summary: sentimentAnalysis,
          details: reviewsData
        },
        seo: seoAnalysis,
        recommendations: recommendations.recommendations || [],
        metrics: {
          totalReviews: reviewsData.totalReviews,
          averageRating: parseFloat(sentimentAnalysis.averageRating),
          seoScore: seoAnalysis.overallScore,
          sentimentScore: this.calculateSentimentScore(sentimentAnalysis),
          responseRate: companyData.metrics.responseRate
        },
        charts
      };
    } catch (error) {
      console.error('Comprehensive analysis error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  static formatAnalysisResponse(analysis, company) {
    return {
      companyName: analysis.companyName,
      location: analysis.location,
      website: analysis.website,
      timestamp: analysis.createdAt.toISOString(),
      overallScore: analysis.overallScore,
      companyInfo: {
        companyName: company.name,
        location: company.location,
        basicInfo: {
          name: company.name,
          location: company.location,
          industry: company.industry,
          established: company.established
        },
        onlinePresence: company.onlinePresence,
        metrics: company.metrics
      },
      reviews: {
        summary: {
          totalReviews: analysis.sentiment.totalReviews,
          averageRating: analysis.sentiment.averageRating.toFixed(2),
          sentimentDistribution: {
            positive: analysis.sentiment.sentimentDistribution.positive.toFixed(1),
            negative: analysis.sentiment.sentimentDistribution.negative.toFixed(1),
            neutral: analysis.sentiment.sentimentDistribution.neutral.toFixed(1)
          },
          sentimentCounts: analysis.sentiment.sentimentCounts,
          aiInsights: analysis.sentiment.aiInsights,
          recommendations: analysis.sentiment.recommendations
        },
        details: {
          totalReviews: analysis.sentiment.totalReviews,
          reviews: [],
          platforms: []
        }
      },
      seo: {
        overallScore: analysis.seo.overallScore,
        grade: analysis.seo.grade,
        breakdown: analysis.seo.breakdown,
        recommendations: analysis.seo.recommendations
      },
      recommendations: analysis.recommendations,
      metrics: analysis.metrics,
      charts: analysis.charts
    };
  }

  static calculateReputationScore(data) {
    const weights = {
      seo: 0.3,
      sentiment: 0.4,
      reviews: 0.3
    };

    const seoScore = data.seo;
    const sentimentScore = this.calculateSentimentScore(data.sentiment);
    const reviewScore = Math.min((data.reviews.totalReviews / 100) * 100, 100);

    const weightedScore = 
      (seoScore * weights.seo) +
      (sentimentScore * weights.sentiment) +
      (reviewScore * weights.reviews);

    return Math.round(weightedScore);
  }

  static calculateSentimentScore(sentimentAnalysis) {
    const positive = parseFloat(sentimentAnalysis.sentimentDistribution.positive);
    const negative = parseFloat(sentimentAnalysis.sentimentDistribution.negative);
    
    // Score from 0-100 based on positive vs negative ratio
    const score = positive - (negative * 1.5) + 50; // Penalize negative more
    return Math.max(0, Math.min(100, score));
  }

  static formatSentimentChart(sentimentAnalysis) {
    return [
      { name: 'Positive', value: parseFloat(sentimentAnalysis.sentimentDistribution.positive), fill: '#10b981' },
      { name: 'Neutral', value: parseFloat(sentimentAnalysis.sentimentDistribution.neutral), fill: '#f59e0b' },
      { name: 'Negative', value: parseFloat(sentimentAnalysis.sentimentDistribution.negative), fill: '#ef4444' }
    ];
  }

  static formatRatingChart(reviews) {
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach(review => {
      const rating = Math.round(review.rating || review.rating);
      if (ratingCounts[rating] !== undefined) {
        ratingCounts[rating]++;
      }
    });

    return Object.keys(ratingCounts).map(rating => ({
      name: `${rating} Star${rating !== '1' ? 's' : ''}`,
      value: ratingCounts[rating],
      fill: rating >= 4 ? '#10b981' : rating >= 3 ? '#f59e0b' : '#ef4444'
    }));
  }

  static formatSEOChart(seoAnalysis) {
    return [
      { name: 'On-Page SEO', value: seoAnalysis.breakdown.onPageSEO.score, fill: '#3b82f6' },
      { name: 'Technical SEO', value: seoAnalysis.breakdown.technicalSEO.score, fill: '#8b5cf6' },
      { name: 'Content SEO', value: seoAnalysis.breakdown.contentSEO.score, fill: '#ec4899' },
      { name: 'Backlinks', value: seoAnalysis.breakdown.backlinks.domainAuthority || 0, fill: '#f59e0b' }
    ];
  }

  static formatTimelineChart(reviews) {
    // Group reviews by month
    const monthlyData = {};
    
    reviews.forEach(review => {
      const date = new Date(review.date || review.createdAt);
      if (isNaN(date.getTime())) return;
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { positive: 0, negative: 0, neutral: 0 };
      }
      
      const sentiment = review.sentiment || 'neutral';
      monthlyData[monthKey][sentiment]++;
    });

    return Object.keys(monthlyData).sort().map(month => ({
      month,
      positive: monthlyData[month].positive,
      negative: monthlyData[month].negative,
      neutral: monthlyData[month].neutral
    }));
  }

  static async generateRecommendations(analysisData) {
    return await AIService.generateRecommendations(analysisData);
  }
}

module.exports = AnalysisService;
