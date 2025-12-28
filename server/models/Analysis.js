const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: true,
    index: true
  },
  location: String,
  website: String,
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  seo: {
    overallScore: Number,
    grade: String,
    breakdown: {
      onPageSEO: {
        score: Number,
        titleTag: mongoose.Schema.Types.Mixed,
        metaDescription: mongoose.Schema.Types.Mixed,
        headings: mongoose.Schema.Types.Mixed,
        images: mongoose.Schema.Types.Mixed,
        internalLinks: Number
      },
      technicalSEO: {
        score: Number,
        mobileFriendly: Boolean,
        pageSpeed: Number,
        sslCertificate: Boolean,
        sitemap: Boolean,
        robotsTxt: Boolean
      },
      contentSEO: {
        score: Number,
        keywordDensity: Number,
        contentLength: Number,
        readability: String
      },
      backlinks: {
        count: Number,
        quality: String,
        domainAuthority: Number
      },
      socialSignals: {
        facebookShares: Number,
        twitterMentions: Number,
        linkedinShares: Number
      }
    },
    recommendations: [String]
  },
  sentiment: {
    totalReviews: Number,
    averageRating: Number,
    sentimentDistribution: {
      positive: Number,
      negative: Number,
      neutral: Number
    },
    sentimentCounts: {
      positive: Number,
      negative: Number,
      neutral: Number
    },
    aiInsights: mongoose.Schema.Types.Mixed,
    recommendations: [String]
  },
  metrics: {
    totalReviews: Number,
    averageRating: Number,
    seoScore: Number,
    sentimentScore: Number,
    responseRate: Number
  },
  recommendations: [String],
  charts: {
    sentimentDistribution: [mongoose.Schema.Types.Mixed],
    ratingDistribution: [mongoose.Schema.Types.Mixed],
    seoBreakdown: [mongoose.Schema.Types.Mixed],
    timeline: [mongoose.Schema.Types.Mixed]
  }
}, {
  timestamps: true
});

analysisSchema.index({ companyName: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);

