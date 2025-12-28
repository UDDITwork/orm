const axios = require('axios');
const cheerio = require('cheerio');

class SEOService {
  static async analyzeSEO(companyName, website = '') {
    if (!website || !website.startsWith('http')) {
      return this.getDefaultSEOAnalysis(companyName, website);
    }

    try {
      const response = await axios.get(website, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const html = response.data;

      // Analyze on-page SEO
      const onPageSEO = this.analyzeOnPageSEO($, html);
      
      // Analyze technical SEO
      const technicalSEO = await this.analyzeTechnicalSEO(website, html);
      
      // Analyze content SEO
      const contentSEO = this.analyzeContentSEO($, html, companyName);
      
      // Analyze backlinks (simplified - would need external API for real data)
      const backlinks = await this.analyzeBacklinks(website);
      
      // Analyze social signals (simplified)
      const socialSignals = this.analyzeSocialSignals($);

      const seoMetrics = {
        overallScore: 0, // Will be calculated
        onPageSEO,
        technicalSEO,
        contentSEO,
        backlinks,
        socialSignals
      };

      return {
        companyName,
        website,
        seoMetrics,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('SEO analysis error:', error.message);
      return this.getDefaultSEOAnalysis(companyName, website);
    }
  }

  static analyzeOnPageSEO($, html) {
    const title = $('title').first().text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1Tags = $('h1').length;
    const h2Tags = $('h2').length;
    const images = $('img').length;
    const imagesWithAlt = $('img[alt]').length;
    const internalLinks = $('a[href^="/"], a[href^="' + $('base').attr('href') + '"]').length;

    // Score calculation
    let score = 0;
    if (title && title.length > 0 && title.length <= 60) score += 20;
    else if (title) score += 10;
    if (metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160) score += 20;
    else if (metaDescription) score += 10;
    if (h1Tags === 1) score += 15;
    else if (h1Tags > 0) score += 10;
    if (h2Tags > 0) score += 10;
    if (imagesWithAlt / images > 0.8) score += 15;
    else if (imagesWithAlt / images > 0.5) score += 10;
    if (internalLinks > 10) score += 20;
    else if (internalLinks > 5) score += 10;

    return {
      score: Math.min(score, 100),
      titleTag: {
        exists: !!title,
        length: title.length,
        content: title.substring(0, 60),
        optimal: title.length > 0 && title.length <= 60
      },
      metaDescription: {
        exists: !!metaDescription,
        length: metaDescription.length,
        content: metaDescription.substring(0, 160),
        optimal: metaDescription.length >= 120 && metaDescription.length <= 160
      },
      headings: {
        h1Count: h1Tags,
        h2Count: h2Tags,
        structure: h1Tags === 1 && h2Tags > 0 ? 'Good' : h1Tags === 0 ? 'Poor' : 'Fair'
      },
      images: {
        total: images,
        withAlt: imagesWithAlt,
        optimized: imagesWithAlt / images > 0.8
      },
      internalLinks
    };
  }

  static async analyzeTechnicalSEO(website, html) {
    const hasSSL = website.startsWith('https://');
    const hasSitemap = html.includes('sitemap') || html.includes('sitemap.xml');
    const hasRobotsTxt = true; // Would need to check robots.txt file
    
    // Check for mobile viewport
    const hasViewport = html.includes('viewport');
    
    // Basic page speed estimation (simplified)
    const htmlSize = Buffer.byteLength(html, 'utf8');
    const pageSpeed = htmlSize < 500000 ? 90 : htmlSize < 1000000 ? 75 : 60;

    let score = 0;
    if (hasSSL) score += 25;
    if (hasViewport) score += 20;
    if (hasSitemap) score += 15;
    if (hasRobotsTxt) score += 10;
    if (pageSpeed >= 80) score += 30;
    else if (pageSpeed >= 60) score += 20;

    return {
      score: Math.min(score, 100),
      mobileFriendly: hasViewport,
      pageSpeed,
      sslCertificate: hasSSL,
      sitemap: hasSitemap,
      robotsTxt: hasRobotsTxt
    };
  }

  static analyzeContentSEO($, html, companyName) {
    const bodyText = $('body').text();
    const wordCount = bodyText.split(/\s+/).filter(word => word.length > 0).length;
    
    // Keyword density (simplified)
    const companyNameLower = companyName.toLowerCase();
    const textLower = bodyText.toLowerCase();
    const keywordCount = (textLower.match(new RegExp(companyNameLower, 'g')) || []).length;
    const keywordDensity = wordCount > 0 ? ((keywordCount / wordCount) * 100).toFixed(2) : 0;

    // Readability (simplified - based on word count and sentence structure)
    const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
    let readability = 'Good';
    if (avgWordsPerSentence > 20) readability = 'Difficult';
    else if (avgWordsPerSentence > 15) readability = 'Fair';

    let score = 0;
    if (wordCount >= 300) score += 30;
    else if (wordCount >= 200) score += 20;
    else score += 10;
    
    if (parseFloat(keywordDensity) >= 1 && parseFloat(keywordDensity) <= 3) score += 30;
    else if (parseFloat(keywordDensity) > 0) score += 15;
    
    if (readability === 'Good') score += 25;
    else if (readability === 'Fair') score += 15;
    
    if (sentences.length > 10) score += 15;

    return {
      score: Math.min(score, 100),
      keywordDensity: parseFloat(keywordDensity),
      contentLength: wordCount,
      readability
    };
  }

  static async analyzeBacklinks(website) {
    // Simplified - in production, use backlink analysis APIs like Ahrefs, Moz, etc.
    // For now, return estimated values
    try {
      // Could integrate with free APIs or paid services
      // This is a placeholder
      return {
        count: 0, // Would need external API
        quality: 'Unknown',
        domainAuthority: 0 // Would need external API
      };
    } catch (error) {
      return {
        count: 0,
        quality: 'Unknown',
        domainAuthority: 0
      };
    }
  }

  static analyzeSocialSignals($) {
    // Check for social media links
    const facebookLinks = $('a[href*="facebook.com"]').length;
    const twitterLinks = $('a[href*="twitter.com"], a[href*="x.com"]').length;
    const linkedinLinks = $('a[href*="linkedin.com"]').length;

    return {
      facebookShares: facebookLinks > 0 ? 100 : 0,
      twitterMentions: twitterLinks > 0 ? 50 : 0,
      linkedinShares: linkedinLinks > 0 ? 30 : 0
    };
  }

  static getDefaultSEOAnalysis(companyName, website) {
    return {
      companyName,
      website: website || 'Not provided',
      seoMetrics: {
        overallScore: 50,
        onPageSEO: {
          score: 50,
          titleTag: { exists: false },
          metaDescription: { exists: false },
          headings: { h1Count: 0, h2Count: 0, structure: 'Poor' },
          images: { total: 0, withAlt: 0, optimized: false },
          internalLinks: 0
        },
        technicalSEO: {
          score: 50,
          mobileFriendly: false,
          pageSpeed: 50,
          sslCertificate: false,
          sitemap: false,
          robotsTxt: false
        },
        contentSEO: {
          score: 50,
          keywordDensity: 0,
          contentLength: 0,
          readability: 'Unknown'
        },
        backlinks: {
          count: 0,
          quality: 'Unknown',
          domainAuthority: 0
        },
        socialSignals: {
          facebookShares: 0,
          twitterMentions: 0,
          linkedinShares: 0
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  static async calculateSEOScore(companyName, website) {
    const analysis = await this.analyzeSEO(companyName, website);
    
    const weights = {
      onPage: 0.3,
      technical: 0.25,
      content: 0.25,
      backlinks: 0.15,
      social: 0.05
    };

    const onPageScore = analysis.seoMetrics.onPageSEO.score;
    const technicalScore = analysis.seoMetrics.technicalSEO.score;
    const contentScore = analysis.seoMetrics.contentSEO.score;
    const backlinkScore = analysis.seoMetrics.backlinks.domainAuthority || 50;
    const socialScore = Math.min(
      (analysis.seoMetrics.socialSignals.facebookShares + 
       analysis.seoMetrics.socialSignals.twitterMentions + 
       analysis.seoMetrics.socialSignals.linkedinShares) / 10, 
      100
    );

    const weightedScore = 
      (onPageScore * weights.onPage) +
      (technicalScore * weights.technical) +
      (contentScore * weights.content) +
      (backlinkScore * weights.backlinks) +
      (socialScore * weights.social);

    analysis.seoMetrics.overallScore = Math.round(weightedScore);

    return {
      overallScore: Math.round(weightedScore),
      breakdown: analysis.seoMetrics,
      grade: this.getSEOGrade(weightedScore),
      recommendations: this.generateSEORecommendations(analysis.seoMetrics)
    };
  }

  static getSEOGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  static generateSEORecommendations(metrics) {
    const recommendations = [];

    if (metrics.onPageSEO.score < 80) {
      if (!metrics.onPageSEO.titleTag.exists) {
        recommendations.push('Add a title tag (50-60 characters recommended)');
      }
      if (!metrics.onPageSEO.metaDescription.exists) {
        recommendations.push('Add a meta description (120-160 characters recommended)');
      }
      if (metrics.onPageSEO.headings.h1Count !== 1) {
        recommendations.push('Ensure you have exactly one H1 tag on the page');
      }
      if (!metrics.onPageSEO.images.optimized) {
        recommendations.push('Add alt text to all images for better SEO');
      }
    }
    
    if (metrics.technicalSEO.score < 80) {
      if (!metrics.technicalSEO.sslCertificate) {
        recommendations.push('Install SSL certificate (HTTPS) for better security and SEO');
      }
      if (metrics.technicalSEO.pageSpeed < 80) {
        recommendations.push('Optimize page loading speed - compress images and minify code');
      }
      if (!metrics.technicalSEO.mobileFriendly) {
        recommendations.push('Add viewport meta tag for mobile responsiveness');
      }
    }
    
    if (metrics.contentSEO.score < 75) {
      if (metrics.contentSEO.contentLength < 300) {
        recommendations.push('Increase content length to at least 300 words');
      }
      if (parseFloat(metrics.contentSEO.keywordDensity) < 1) {
        recommendations.push('Improve keyword density (aim for 1-3%)');
      }
    }
    
    if (metrics.backlinks.domainAuthority < 40) {
      recommendations.push('Build more high-quality backlinks to improve domain authority');
    }

    return recommendations.length > 0 ? recommendations : ['Your SEO looks good! Keep maintaining it.'];
  }
}

module.exports = SEOService;
