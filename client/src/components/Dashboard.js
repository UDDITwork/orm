import React, { useState } from 'react';
import CompanySearch from './CompanySearch';
import AnalysisResults from './AnalysisResults';
import KeywordAnalysis from './KeywordAnalysis';
import './Dashboard.css';

const Dashboard = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalysis = async (data) => {
    setLoading(true);
    setError(null);
    setAnalysisData(data);
    setLoading(false);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>ONLINE REPUTATION MANAGER</h1>
        <p>Comprehensive SEO & Sentiment Analysis Tool</p>
      </header>

      <div className="dashboard-content">
        <CompanySearch onAnalysis={handleAnalysis} loading={loading} />
        
        <KeywordAnalysis />
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {analysisData && (
          <AnalysisResults data={analysisData} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

