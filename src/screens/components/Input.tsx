import React from 'react';
import './css/Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  type?: 'text' | 'number' | 'email' | 'password';
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  id: string;
  options: { value: string | number; label: string }[];
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  type = 'text',
  className,
  ...props
}) => {
  const inputClassName = `input-field ${className || ''}`;
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input type={type} id={id} className={inputClassName} {...props} />
    </div>
  );
};

export const Select: React.FC<SelectProps> = ({
  label,
  id,
  options,
  className,
  ...props
}) => {
  const selectClassName = `select-field ${className || ''}`;
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <select id={id} className={selectClassName} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};