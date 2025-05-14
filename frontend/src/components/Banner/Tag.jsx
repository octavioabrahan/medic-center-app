import React from 'react';
import './Tag.css';

/**
 * Tag component for displaying tag elements with different schemes and variants
 * @param {Object} props - Component props
 * @param {string} props.text - Text to display in the tag
 * @param {Function} props.onClose - Function to call when close button is clicked
 * @param {string} props.scheme - Tag color scheme (brand, danger, positive, warning, neutral)
 * @param {string} props.variant - Tag variant (primary, secondary)
 */
const Tag = ({ 
  text, 
  onClose,
  scheme = 'brand',
  variant = 'primary',
  hover = false
}) => {
  // Create classes based on props
  const tagClasses = [
    'tag',
    `scheme-${scheme}`,
    `state-${hover ? 'hover' : 'default'}`,
    `variant-${variant}`
  ].join(' ');

  return (
    <div className={tagClasses}>
      <div className="tag2">{text}</div>
      {onClose && (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="heroicons-mini-x-mark"
          onClick={onClose}
        >
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      )}
    </div>
  );
};

export default Tag;
