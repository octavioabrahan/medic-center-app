import React from 'react';
import PropTypes from 'prop-types';
import './MenuHeading.css';

/**
 * MenuHeading component for displaying a section heading in a menu
 * @param {Object} props - Component props
 * @param {string} props.heading - Heading text
 */
const MenuHeading = ({ 
  heading
}) => {
  return (
    <div className="menu-heading">
      <div className="text-strong">
        <div className="text-strong2">{heading}</div>
      </div>
    </div>
  );
};

MenuHeading.propTypes = {
  heading: PropTypes.string.isRequired
};

export default MenuHeading;
