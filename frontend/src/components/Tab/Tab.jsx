import React from 'react';
import './Tab.css';

/**
 * Tab component for navigation between content sections
 * @param {Object} props - Component props
 * @param {string} props.label - Text to display in the tab
 * @param {boolean} props.active - Whether the tab is currently active
 * @param {Function} props.onClick - Function to call when tab is clicked
 * @param {boolean} props.disabled - Whether the tab is disabled
 */
const Tab = ({ 
  label, 
  active = false, 
  onClick, 
  disabled = false 
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  // Determine class name based on state
  const tabClassName = `tab-component ${active ? 'active-on' : ''} ${disabled ? 'inactive' : ''}`;

  return (
    <div 
      className={tabClassName}
      onClick={handleClick}
      role="tab"
      aria-selected={active}
      tabIndex={disabled ? -1 : 0}
    >
      <div className="tab-label">{label}</div>
    </div>
  );
};

export default Tab;
