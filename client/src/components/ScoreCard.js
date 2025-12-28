import React from 'react';
import './ScoreCard.css';

const ScoreCard = ({ overallScore, seoScore, sentimentScore, averageRating }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="score-cards">
      <div className="score-card main-score">
        <div className="score-circle" style={{ '--score-color': getScoreColor(overallScore) }}>
          <div className="score-value">{overallScore}</div>
          <div className="score-label">Overall Score</div>
        </div>
        <div className="score-status">{getScoreLabel(overallScore).toUpperCase()}</div>
      </div>

      <div className="score-card">
        <div className="score-info">
          <div className="score-title">SEO Score</div>
          <div className="score-number" style={{ color: getScoreColor(seoScore) }}>
            {seoScore}/100
          </div>
        </div>
      </div>

      <div className="score-card">
        <div className="score-info">
          <div className="score-title">Sentiment Score</div>
          <div className="score-number" style={{ color: getScoreColor(sentimentScore) }}>
            {sentimentScore}/100
          </div>
        </div>
      </div>

      <div className="score-card">
        <div className="score-info">
          <div className="score-title">Average Rating</div>
          <div className="score-number" style={{ color: getScoreColor(averageRating * 20) }}>
            {averageRating}/5.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;

