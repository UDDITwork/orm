const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  location: String,
  website: String,
  industry: String,
  established: String,
  onlinePresence: {
    hasWebsite: Boolean,
    socialMediaCount: Number,
    reviewPlatforms: [String]
  },
  metrics: {
    totalReviews: Number,
    averageRating: Number,
    responseRate: Number
  },
  lastAnalyzed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);

