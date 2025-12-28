import React from 'react';
import './Recommendations.css';

const Recommendations = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommendations">
      <div className="recommendations-card">
        <h3>AI-POWERED RECOMMENDATIONS</h3>
        <div className="recommendations-list">
          {recommendations.map((rec, index) => (
            <div key={index} className="recommendation-item">
              <div className="recommendation-number">{index + 1}</div>
              <div className="recommendation-text">
                {typeof rec === 'string' ? rec : JSON.stringify(rec)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;

