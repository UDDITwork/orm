const axios = require('axios');

class KeywordService {
  /**
   * Get DataForSEO API base URL
   */
  static getBaseUrl() {
    return 'https://api.dataforseo.com/v3';
  }

  /**
   * Get authentication credentials from environment variables
   */
  static getAuth() {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;

    if (!login || !password) {
      throw new Error('DataForSEO credentials not configured. Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env');
    }

    return {
      username: login,
      password: password
    };
  }

  /**
   * Discover available keyword data endpoints
   * GET /v3/keywords_data/endpoints
   */
  static async getEndpoints() {
    try {
      const auth = this.getAuth();
      const url = `${this.getBaseUrl()}/keywords_data/endpoints`;

      const response = await axios.get(url, {
        auth: {
          username: auth.username,
          password: auth.password
        },
        headers: {
          'content-type': 'application/json'
        }
      });

      if (response.data.status_code === 20000) {
        const endpoints = response.data.tasks?.[0]?.result || [];
        return {
          success: true,
          data: response.data,
          endpoints: endpoints,
          categorized: this.categorizeEndpoints(endpoints)
        };
      } else {
        return {
          success: false,
          error: {
            code: response.data.status_code,
            message: response.data.status_message
          }
        };
      }
    } catch (error) {
      console.error('DataForSEO API error:', error.message);
      
      if (error.response) {
        return {
          success: false,
          error: {
            code: error.response.data?.status_code || error.response.status,
            message: error.response.data?.status_message || error.message
          }
        };
      } else {
        return {
          success: false,
          error: {
            code: 0,
            message: error.message
          }
        };
      }
    }
  }

  /**
   * Categorize endpoints by platform and function
   */
  static categorizeEndpoints(endpoints) {
    const categorized = {
      google: {
        search_volume: [],
        keywords_for_site: [],
        keywords_for_keywords: [],
        keywords_for_category: [],
        ad_traffic_by_keywords: [],
        ad_traffic_by_platforms: [],
        categories: [],
        languages: [],
        locations: [],
        other: []
      },
      bing: {
        search_volume: [],
        keywords_for_site: [],
        keywords_for_keywords: [],
        keywords_for_category: [],
        keyword_performance: [],
        categories: [],
        languages: [],
        locations: [],
        other: []
      },
      google_trends: {
        explore: [],
        categories: [],
        languages: [],
        locations: [],
        other: []
      },
      utility: {
        tasks_ready: [],
        adwords_status: []
      }
    };

    endpoints.forEach(endpoint => {
      if (endpoint.includes('/google/')) {
        if (endpoint.includes('search_volume')) {
          categorized.google.search_volume.push(endpoint);
        } else if (endpoint.includes('keywords_for_site')) {
          categorized.google.keywords_for_site.push(endpoint);
        } else if (endpoint.includes('keywords_for_keywords')) {
          categorized.google.keywords_for_keywords.push(endpoint);
        } else if (endpoint.includes('keywords_for_category')) {
          categorized.google.keywords_for_category.push(endpoint);
        } else if (endpoint.includes('ad_traffic_by_keywords')) {
          categorized.google.ad_traffic_by_keywords.push(endpoint);
        } else if (endpoint.includes('ad_traffic_by_platforms')) {
          categorized.google.ad_traffic_by_platforms.push(endpoint);
        } else if (endpoint.includes('/google/categories')) {
          categorized.google.categories.push(endpoint);
        } else if (endpoint.includes('/google/languages')) {
          categorized.google.languages.push(endpoint);
        } else if (endpoint.includes('/google/locations')) {
          categorized.google.locations.push(endpoint);
        } else if (endpoint.includes('adwords_status')) {
          categorized.utility.adwords_status.push(endpoint);
        } else {
          categorized.google.other.push(endpoint);
        }
      } else if (endpoint.includes('/bing/')) {
        if (endpoint.includes('search_volume')) {
          categorized.bing.search_volume.push(endpoint);
        } else if (endpoint.includes('keywords_for_site')) {
          categorized.bing.keywords_for_site.push(endpoint);
        } else if (endpoint.includes('keywords_for_keywords')) {
          categorized.bing.keywords_for_keywords.push(endpoint);
        } else if (endpoint.includes('keywords_for_category')) {
          categorized.bing.keywords_for_category.push(endpoint);
        } else if (endpoint.includes('keyword_performance')) {
          categorized.bing.keyword_performance.push(endpoint);
        } else if (endpoint.includes('/bing/categories')) {
          categorized.bing.categories.push(endpoint);
        } else if (endpoint.includes('/bing/languages')) {
          categorized.bing.languages.push(endpoint);
        } else if (endpoint.includes('/bing/locations')) {
          categorized.bing.locations.push(endpoint);
        } else {
          categorized.bing.other.push(endpoint);
        }
      } else if (endpoint.includes('/google_trends/')) {
        if (endpoint.includes('explore')) {
          categorized.google_trends.explore.push(endpoint);
        } else if (endpoint.includes('/google_trends/categories')) {
          categorized.google_trends.categories.push(endpoint);
        } else if (endpoint.includes('/google_trends/languages')) {
          categorized.google_trends.languages.push(endpoint);
        } else if (endpoint.includes('/google_trends/locations')) {
          categorized.google_trends.locations.push(endpoint);
        } else {
          categorized.google_trends.other.push(endpoint);
        }
      } else if (endpoint.includes('tasks_ready')) {
        categorized.utility.tasks_ready.push(endpoint);
      }
    });

    return categorized;
  }

  /**
   * Get available keyword features
   */
  static async getAvailableFeatures() {
    try {
      const result = await this.getEndpoints();
      
      if (!result.success) {
        return {
          available: false,
          error: result.error
        };
      }

      const categorized = result.categorized;

      return {
        available: true,
        platforms: {
          google: {
            searchVolume: categorized.google.search_volume.length > 0,
            keywordsForSite: categorized.google.keywords_for_site.length > 0,
            keywordsForKeywords: categorized.google.keywords_for_keywords.length > 0,
            keywordsForCategory: categorized.google.keywords_for_category.length > 0,
            adTrafficByKeywords: categorized.google.ad_traffic_by_keywords.length > 0,
            adTrafficByPlatforms: categorized.google.ad_traffic_by_platforms.length > 0,
            categories: categorized.google.categories.length > 0,
            languages: categorized.google.languages.length > 0,
            locations: categorized.google.locations.length > 0
          },
          bing: {
            searchVolume: categorized.bing.search_volume.length > 0,
            keywordsForSite: categorized.bing.keywords_for_site.length > 0,
            keywordsForKeywords: categorized.bing.keywords_for_keywords.length > 0,
            keywordsForCategory: categorized.bing.keywords_for_category.length > 0,
            keywordPerformance: categorized.bing.keyword_performance.length > 0,
            categories: categorized.bing.categories.length > 0,
            languages: categorized.bing.languages.length > 0,
            locations: categorized.bing.locations.length > 0
          },
          googleTrends: {
            explore: categorized.google_trends.explore.length > 0,
            categories: categorized.google_trends.categories.length > 0,
            languages: categorized.google_trends.languages.length > 0,
            locations: categorized.google_trends.locations.length > 0
          }
        },
        utility: {
          tasksReady: categorized.utility.tasks_ready.length > 0,
          adwordsStatus: categorized.utility.adwords_status.length > 0
        }
      };
    } catch (error) {
      return {
        available: false,
        error: {
          code: 0,
          message: error.message
        }
      };
    }
  }

  /**
   * Check if DataForSEO is configured
   */
  static isConfigured() {
    return !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
  }
}

module.exports = KeywordService;
```

