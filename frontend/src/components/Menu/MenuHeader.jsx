import React from 'react';
import PropTypes from 'prop-types';
import './MenuHeader.css';

/**
 * MenuHeader component for displaying a header with subheading and heading text
 * @param {Object} props - Component props
 * @param {string} props.subheading - Smaller text displayed above the main heading
 * @param {string} props.heading - Main heading text
 */
const MenuHeader = ({ 
  subheading,
  heading
}) => {
  return (
    <div className="menu-header">
      <div className="text-small">
        <div className="text-small2">{subheading}</div>
      </div>
      <div className="text-strong">
        <div className="text-strong2">{heading}</div>
      </div>
    </div>
  );
};

MenuHeader.propTypes = {
  subheading: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired
};

export default MenuHeader;
