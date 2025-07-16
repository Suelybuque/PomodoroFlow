import React from 'react';
import './css/Chart.css';

interface ChartProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const Chart: React.FC<ChartProps> = ({ title, description, children }) => {
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      {description && <p className="chart-description">{description}</p>}
      <div className="chart-visual-area">
        {children || <div className="chart-placeholder">Chart Visualization Here</div>}
      </div>
    </div>
  );
};

export default Chart;