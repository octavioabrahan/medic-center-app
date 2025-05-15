import React from 'react';
import PropTypes from 'prop-types';
import './Text.css';

/**
 * TextContentHeading component for displaying a heading with subheading
 * 
 * @param {Object} props - Component props
 * @param {string} props.heading - The main heading text
 * @param {string} props.subheading - The subheading text
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.alignCenter - Whether to center align the text
 */
export const TextContentHeading = ({
  heading,
  subheading,
  className = '',
  alignCenter = false,
  ...otherProps
}) => {
  const alignmentClass = alignCenter ? 'align-center' : '';
  
  return (
    <div className={`text-content-heading ${alignmentClass} ${className}`} {...otherProps}>
      <div className="heading">{heading}</div>
      <div className="subheading">{subheading}</div>
    </div>
  );
};

TextContentHeading.propTypes = {
  heading: PropTypes.node.isRequired,
  subheading: PropTypes.node.isRequired,
  className: PropTypes.string,
  alignCenter: PropTypes.bool
};

/**
 * Text component for displaying content with consistent styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Type of text (small, code, strong, link, emphasis, base, subheading, heading, subtitle, titlePage, titleHero)
 * @param {React.ReactNode} props.children - Content to be displayed
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.isListItem - Whether the text is a list item
 * @param {boolean} props.isLinkListItem - Whether the text is a link list item
 */
const Text = ({ 
  variant = 'base', 
  children, 
  className = '', 
  isListItem = false,
  isLinkListItem = false,
  ...otherProps 
}) => {
  // Build class name based on variant
  let textClass = '';
  
  if (isListItem) {
    return (
      <div className={`text-list-item ${className}`} {...otherProps}>
        <div className="list-item">
          <ul className="list-item-span">
            <li>{children}</li>
          </ul>
        </div>
      </div>
    );
  }

  if (isLinkListItem) {
    return (
      <div className={`text-link-list-item ${className}`} {...otherProps}>
        <div className="list-item2">{children}</div>
      </div>
    );
  }
  
  // Determine class based on variant
  switch (variant) {
    case 'small':
      textClass = 'text-small';
      break;
    case 'code':
      textClass = 'text-code';
      break;
    case 'strong':
      textClass = 'text-strong';
      break;
    case 'link':
      textClass = 'text-link';
      break;
    case 'emphasis':
      textClass = 'text-emphasis';
      break;
    case 'subheading':
      textClass = 'text-subheading';
      break;
    case 'heading':
      textClass = 'text-heading';
      break;
    case 'subtitle':
      textClass = 'text-subtitle';
      break;
    case 'titlePage':
      textClass = 'text-title-page';
      break;
    case 'titleHero':
      textClass = 'text-title-hero';
      break;
    default:
      textClass = 'text';
  }

  // Determine inner element class based on variant
  const innerClass = `${textClass}2`;

  return (
    <div className={`${textClass} ${className}`} {...otherProps}>
      <div className={innerClass}>{children}</div>
    </div>
  );
};

Text.propTypes = {
  variant: PropTypes.oneOf([
    'small',
    'code',
    'strong',
    'link',
    'emphasis',
    'base',
    'subheading',
    'heading',
    'subtitle',
    'titlePage',
    'titleHero'
  ]),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  isListItem: PropTypes.bool,
  isLinkListItem: PropTypes.bool
};

export default Text;
