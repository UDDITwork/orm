import React from 'react';
import ScoreCard from './ScoreCard';
import ChartsSection from './ChartsSection';
import Recommendations from './Recommendations';
import MetricsGrid from './MetricsGrid';
import './AnalysisResults.css';

const AnalysisResults = ({ data }) => {
  return (
    <div className="analysis-results">
      <div className="results-header">
        <h2>ANALYSIS RESULTS FOR {data.companyName.toUpperCase()}</h2>
        <p className="timestamp">Analyzed on {new Date(data.timestamp).toLocaleString()}</p>
      </div>

      <ScoreCard 
        overallScore={data.overallScore}
        seoScore={data.seo.overallScore}
        sentimentScore={data.metrics.sentimentScore}
        averageRating={data.metrics.averageRating}
      />

      <MetricsGrid metrics={data.metrics} />

      <ChartsSection charts={data.charts} />

      <Recommendations recommendations={data.recommendations} />

      <div className="detailed-sections">
        <div className="section-card">
          <h3>SEO ANALYSIS</h3>
          <div className="seo-details">
            <div className="seo-item">
              <span className="label">Overall SEO Score:</span>
              <span className={`value grade-${data.seo.grade.toLowerCase()}`}>{data.seo.overallScore}/100 ({data.seo.grade})</span>
            </div>
            <div className="seo-breakdown">
              <div className="breakdown-item">
                <span>On-Page SEO</span>
                <span>{data.seo.breakdown.onPageSEO.score}/100</span>
              </div>
              <div className="breakdown-item">
                <span>Technical SEO</span>
                <span>{data.seo.breakdown.technicalSEO.score}/100</span>
              </div>
              <div className="breakdown-item">
                <span>Content SEO</span>
                <span>{data.seo.breakdown.contentSEO.score}/100</span>
              </div>
              <div className="breakdown-item">
                <span>Domain Authority</span>
                <span>{data.seo.breakdown.backlinks.domainAuthority}/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h3>SENTIMENT ANALYSIS</h3>
          <div className="sentiment-details">
            <div className="sentiment-stats">
              <div className="stat-item positive">
                <span className="stat-label">Positive</span>
                <span className="stat-value">{data.reviews.summary.sentimentDistribution.positive}%</span>
              </div>
              <div className="stat-item neutral">
                <span className="stat-label">Neutral</span>
                <span className="stat-value">{data.reviews.summary.sentimentDistribution.neutral}%</span>
              </div>
              <div className="stat-item negative">
                <span className="stat-label">Negative</span>
                <span className="stat-value">{data.reviews.summary.sentimentDistribution.negative}%</span>
              </div>
            </div>
            {data.reviews.summary.aiInsights && (
              <div className="ai-insights">
                <h4>AI INSIGHTS</h4>
                <p>{typeof data.reviews.summary.aiInsights === 'string' 
                  ? data.reviews.summary.aiInsights 
                  : JSON.stringify(data.reviews.summary.aiInsights)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;

