import React, { useState } from 'react';
import Tab from './Tab';
import './TabGroup.css';

/**
 * TabGroup component for grouping multiple tabs
 * @param {Object} props - Component props
 * @param {Array} props.tabs - Array of tab objects with label, content, and disabled properties
 * @param {number} props.defaultActiveTab - Index of the default active tab
 */
const TabGroup = ({ 
  tabs = [],
  defaultActiveTab = 0 
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(defaultActiveTab);

  const handleTabClick = (index) => {
    setActiveTabIndex(index);
  };

  return (
    <div className="tab-group-container">
      <div className="tab-group-header" role="tablist">
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            active={activeTabIndex === index}
            onClick={() => handleTabClick(index)}
            disabled={tab.disabled}
          />
        ))}
      </div>
      <div className="tab-group-content">
        {tabs[activeTabIndex] && tabs[activeTabIndex].content}
      </div>
    </div>
  );
};

export default TabGroup;
