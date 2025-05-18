import React from 'react';
import PropTypes from 'prop-types';
import './TagToggleGroup.css';

/**
 * TagToggleGroup component for grouping and managing a set of toggle tags
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements (typically TagToggle components)
 * @param {string} props.className - Additional CSS classes
 */
const TagToggleGroup = ({ 
  children,
  className = ''
}) => {
  return (
    <div className={`tag-toggle-group ${className}`}>
      {children}
    </div>
  );
};

TagToggleGroup.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

export default TagToggleGroup;
