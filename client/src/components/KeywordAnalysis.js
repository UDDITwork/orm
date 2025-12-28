import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KeywordAnalysis.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const KeywordAnalysis = () => {
  const [endpoints, setEndpoints] = useState(null);
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/keywords/status`);
      setConfigured(response.data.configured);
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const loadEndpoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/keywords/endpoints`);
      setEndpoints(response.data);
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Failed to load endpoints');
      console.error('Endpoints error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeatures = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/keywords/features`);
      setFeatures(response.data);
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Failed to load features');
      console.error('Features error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEndpoints = () => {
    if (!endpoints || !endpoints.categorized) return null;

    const { categorized } = endpoints;

    return (
      <div className="endpoints-container">
        <div className="endpoints-section">
          <h3>Google Endpoints</h3>
          <div className="endpoint-group">
            {categorized.google.search_volume.length > 0 && (
              <div className="endpoint-item">
                <strong>Search Volume:</strong> {categorized.google.search_volume.length} endpoint(s)
              </div>
            )}
            {categorized.google.keywords_for_site.length > 0 && (
              <div className="endpoint-item">
                <strong>Keywords For Site:</strong> {categorized.google.keywords_for_site.length} endpoint(s)
              </div>
            )}
            {categorized.google.keywords_for_keywords.length > 0 && (
              <div className="endpoint-item">
                <strong>Keywords For Keywords:</strong> {categorized.google.keywords_for_keywords.length} endpoint(s)
              </div>
            )}
            {categorized.google.keywords_for_category.length > 0 && (
              <div className="endpoint-item">
                <strong>Keywords For Category:</strong> {categorized.google.keywords_for_category.length} endpoint(s)
              </div>
            )}
          </div>
        </div>

        <div className="endpoints-section">
          <h3>Bing Endpoints</h3>
          <div className="endpoint-group">
            {categorized.bing.search_volume.length > 0 && (
              <div className="endpoint-item">
                <strong>Search Volume:</strong> {categorized.bing.search_volume.length} endpoint(s)
              </div>
            )}
            {categorized.bing.keywords_for_site.length > 0 && (
              <div className="endpoint-item">
                <strong>Keywords For Site:</strong> {categorized.bing.keywords_for_site.length} endpoint(s)
              </div>
            )}
          </div>
        </div>

        <div className="endpoints-section">
          <h3>Google Trends</h3>
          <div className="endpoint-group">
            {categorized.google_trends.explore.length > 0 && (
              <div className="endpoint-item">
                <strong>Explore:</strong> {categorized.google_trends.explore.length} endpoint(s)
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFeatures = () => {
    if (!features || !features.available) return null;

    const { platforms } = features;

    return (
      <div className="features-container">
        <div className="features-section">
          <h3>Google Features</h3>
          <div className="feature-grid">
            <div className="feature-item">
              <span className={platforms.google.searchVolume ? 'feature-available' : 'feature-unavailable'}>
                {platforms.google.searchVolume ? '✓' : '✗'}
              </span>
              Search Volume
            </div>
            <div className="feature-item">
              <span className={platforms.google.keywordsForSite ? 'feature-available' : 'feature-unavailable'}>
                {platforms.google.keywordsForSite ? '✓' : '✗'}
              </span>
              Keywords For Site
            </div>
            <div className="feature-item">
              <span className={platforms.google.keywordsForKeywords ? 'feature-available' : 'feature-unavailable'}>
                {platforms.google.keywordsForKeywords ? '✓' : '✗'}
              </span>
              Keywords For Keywords
            </div>
            <div className="feature-item">
              <span className={platforms.google.keywordsForCategory ? 'feature-available' : 'feature-unavailable'}>
                {platforms.google.keywordsForCategory ? '✓' : '✗'}
              </span>
              Keywords For Category
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!configured) {
    return (
      <div className="keyword-analysis">
        <div className="keyword-card">
          <h2>KEYWORD ANALYSIS</h2>
          <div className="warning-message">
            <p>⚠️ DataForSEO API is not configured.</p>
            <p>Please add DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD to your server .env file.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="keyword-analysis">
      <div className="keyword-card">
        <h2>KEYWORD ANALYSIS</h2>
        <p className="subtitle">DataForSEO Keyword Research API</p>

        <div className="keyword-actions">
          <button 
            onClick={loadEndpoints} 
            className="keyword-button"
            disabled={loading}
          >
            {loading ? 'LOADING...' : 'LOAD ENDPOINTS'}
          </button>
          <button 
            onClick={loadFeatures} 
            className="keyword-button"
            disabled={loading}
          >
            {loading ? 'LOADING...' : 'LOAD FEATURES'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {endpoints && (
          <div className="results-section">
            <h3>Available Endpoints ({endpoints.total})</h3>
            {renderEndpoints()}
          </div>
        )}

        {features && features.available && (
          <div className="results-section">
            <h3>Available Features</h3>
            {renderFeatures()}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordAnalysis;
