import React from 'react';
import './MetricsGrid.css';

const MetricsGrid = ({ metrics }) => {
  const metricItems = [
    {
      label: 'Total Reviews',
      value: metrics.totalReviews,
      icon: '📝',
      color: '#3b82f6'
    },
    {
      label: 'Average Rating',
      value: `${metrics.averageRating}/5.0`,
      icon: '⭐',
      color: '#f59e0b'
    },
    {
      label: 'SEO Score',
      value: `${metrics.seoScore}/100`,
      icon: '🔍',
      color: '#10b981'
    },
    {
      label: 'Response Rate',
      value: `${metrics.responseRate}%`,
      icon: '💬',
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="metrics-grid">
      {metricItems.map((metric, index) => (
        <div key={index} className="metric-card" style={{ '--metric-color': metric.color }}>
          <div className="metric-icon">{metric.icon}</div>
          <div className="metric-content">
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsGrid;

