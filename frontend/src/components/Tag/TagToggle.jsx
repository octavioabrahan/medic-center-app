import React from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';
import './TagToggle.css';

/**
 * TagToggle component for displaying toggleable tag elements
 * @param {Object} props - Component props
 * @param {string} props.label - Text to display in the toggle
 * @param {boolean} props.active - Whether the toggle is in active state
 * @param {Function} props.onChange - Function to call when toggle state changes
 * @param {string} props.scheme - Color scheme (currently only 'brand' is supported)
 */
const TagToggle = ({
  label,
  active = true,
  onChange,
  scheme = 'brand',
  className = ''
}) => {
  // Create classes based on props
  const toggleClasses = [
    'tag-toggle',
    active ? 'state-on' : 'state-off',
    `scheme-${scheme}`,
    className
  ].join(' ');

  const handleClick = () => {
    if (onChange) {
      onChange(!active);
    }
  };

  return (
    <div className={toggleClasses} onClick={handleClick}>
      {active && (
        <CheckIcon className="heroicons-mini-check" />
      )}
      <div className="title">{label}</div>
    </div>
  );
};

export default TagToggle;
