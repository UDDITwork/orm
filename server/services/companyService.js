const Company = require('../models/Company');
const Review = require('../models/Review');

class CompanyService {
  static async analyzeCompany(companyName, location = '') {
    // Try to find existing company in database
    let company = await Company.findOne({ 
      name: { $regex: new RegExp(companyName, 'i') },
      location: location || { $exists: true }
    });

    if (!company) {
      // Create new company record
      company = new Company({
        name: companyName,
        location: location || 'Not specified',
        industry: 'General Business',
        established: 'Unknown',
        onlinePresence: {
          hasWebsite: false,
          socialMediaCount: 0,
          reviewPlatforms: []
        },
        metrics: {
          totalReviews: 0,
          averageRating: 0,
          responseRate: 0
        }
      });
    }

    // Get review statistics
    const reviews = await Review.find({ companyName: { $regex: new RegExp(companyName, 'i') } });
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : '0.0';

    // Update company metrics
    company.metrics.totalReviews = totalReviews;
    company.metrics.averageRating = parseFloat(avgRating);
    company.lastAnalyzed = new Date();
    
    // Update online presence based on reviews
    const platforms = [...new Set(reviews.map(r => r.platform))];
    company.onlinePresence.reviewPlatforms = platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1));
    
    await company.save();

    return {
      companyName: company.name,
      location: company.location,
      timestamp: company.lastAnalyzed.toISOString(),
      basicInfo: {
        name: company.name,
        location: company.location,
        industry: company.industry,
        established: company.established
      },
      onlinePresence: company.onlinePresence,
      metrics: {
        totalReviews: company.metrics.totalReviews,
        averageRating: company.metrics.averageRating,
        responseRate: company.metrics.responseRate
      }
    };
  }

  static async getOrCreateCompany(companyName, location = '', website = '') {
    try {
      let company = await Company.findOne({ 
        name: { $regex: new RegExp(companyName, 'i') }
      });

      if (!company) {
        company = new Company({
          name: companyName,
          location: location || 'Not specified',
          website: website || '',
          industry: 'General Business',
          established: 'Unknown',
          onlinePresence: {
            hasWebsite: !!website,
            socialMediaCount: 0,
            reviewPlatforms: []
          },
          metrics: {
            totalReviews: 0,
            averageRating: 0,
            responseRate: 0
          }
        });
        await company.save();
      } else {
        // Update if new info provided
        if (website && !company.website) {
          company.website = website;
          company.onlinePresence.hasWebsite = true;
        }
        if (location && !company.location) {
          company.location = location;
        }
        await company.save();
      }

      return company;
    } catch (error) {
      // If MongoDB fails, return a mock company object
      console.warn('MongoDB operation failed, using mock company:', error.message);
      return {
        _id: { toString: () => 'mock-id' },
        name: companyName,
        location: location || 'Not specified',
        website: website || '',
        industry: 'General Business',
        established: 'Unknown',
        onlinePresence: {
          hasWebsite: !!website,
          socialMediaCount: 0,
          reviewPlatforms: []
        },
        metrics: {
          totalReviews: 0,
          averageRating: 0,
          responseRate: 0
        }
      };
    }
  }

  static async searchCompany(name) {
    const companies = await Company.find({
      name: { $regex: new RegExp(name, 'i') }
    }).limit(10);

    return {
      results: companies.map(c => ({
        name: c.name,
        location: c.location,
        type: 'Business'
      }))
    };
  }
}

module.exports = CompanyService;
