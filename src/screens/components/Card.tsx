import React from 'react';
import './css/Card.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  const cardClassName = `card ${className || ''}`;
  return (
    <div className={cardClassName} {...props}>
      {children}
    </div>
  );
};

export default Card;