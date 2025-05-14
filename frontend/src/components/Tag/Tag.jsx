import React from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import './Tag.css';

/**
 * Tag component for displaying tag elements with different schemes and variants
 * @param {Object} props - Component props
 * @param {string} props.text - Text to display in the tag
 * @param {Function} props.onClose - Function to call when close button is clicked
 * @param {string} props.scheme - Tag color scheme (brand, danger, positive, warning, neutral)
 * @param {string} props.variant - Tag variant (primary, secondary)
 * @param {boolean} props.hover - If true, shows hover state
 * @param {boolean} props.closeable - If false, hides the close button regardless of onClose function
 */
const Tag = ({ 
  text, 
  onClose,
  scheme = 'brand',
  variant = 'primary',
  hover = false,
  closeable = true
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
      {onClose && closeable && (
        <XMarkIcon 
          className="heroicons-mini-x-mark"
          onClick={onClose}
        />
      )}
    </div>
  );
};

export default Tag;
