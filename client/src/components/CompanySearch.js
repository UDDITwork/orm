import React, { useState } from 'react';
import axios from 'axios';
import './CompanySearch.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CompanySearch = ({ onAnalysis, loading }) => {
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      alert('Please enter a company name');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/analysis/comprehensive`, {
        companyName: companyName.trim(),
        location: location.trim(),
        website: website.trim()
      });

      onAnalysis(response.data);
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Show more detailed error message
      let errorMessage = 'Error analyzing company. ';
      
      if (error.response) {
        // Server responded with error
        errorMessage += error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response
        errorMessage += 'Cannot connect to server. Please make sure the backend server is running on port 5000.';
      } else {
        // Something else happened
        errorMessage += error.message || 'Please try again.';
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="company-search">
      <div className="search-card">
        <h2>ANALYZE COMPANY REPUTATION</h2>
        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or Country"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="website">Website URL</label>
            <input
              type="url"
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="analyze-button"
            disabled={loading}
          >
            {loading ? 'ANALYZING...' : 'ANALYZE NOW'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanySearch;

