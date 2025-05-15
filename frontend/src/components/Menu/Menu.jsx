import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Menu.css';

/**
 * Menu component for displaying menu items with icons and descriptions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon to display in the menu
 * @param {string} props.label - Menu item label
 * @param {string} props.description - Menu item description
 * @param {Function} props.onClick - Function to call when menu item is clicked
 * @param {boolean} props.disabled - Whether the menu item is disabled
 * @param {string} props.size - Size of the menu item ('default', 'compact')
 * @param {boolean} props.selected - Whether the menu item is selected
 * @param {React.ReactNode} props.rightElement - Optional element to display on the right side
 */
const Menu = ({ 
  icon, 
  label, 
  description, 
  onClick,
  disabled = false,
  size = 'default',
  selected = false,
  rightElement = null
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine the class name based on state
  let className = "menu-item";
  
  if (disabled) {
    className += " menu-item-disabled";
  }
  
  if (selected) {
    className += " menu-item-selected";
  }
  
  if (size === 'compact') {
    className += " menu-item-compact";
  }
  
  if (isHovered) {
    className += " menu-item-hovered";
  }

  // Handle click events
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <div 
      className={className} 
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-selected={selected}
    >
      <div className="menu-item-icon">
        {icon}
      </div>
      <div className="menu-item-body">
        <div className="menu-item-row">
          <div className="menu-item-label">{label}</div>
          {rightElement && <div className="menu-item-right">{rightElement}</div>}
        </div>
        {description && <div className="menu-item-description">{description}</div>}
      </div>
    </div>
  );
};

Menu.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool
};

export default Menu;
