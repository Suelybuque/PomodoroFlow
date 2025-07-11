import React from 'react';
import './css/Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  className,
  ...props
}) => {
  const buttonClassName = `button ${variant} ${size} ${className || ''}`;
  return (
    <button className={buttonClassName} {...props}>
      {children}
    </button>
  );
};

export default Button;