import React from 'react';
import PropTypes from 'prop-types';
import './Text.css';

/**
 * TextLinkList component for displaying a list of links with a title
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The title for the link list
 * @param {Array} props.items - Array of items to display in the list
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.densityTight - Whether to use tight spacing
 */
export const TextLinkList = ({
  title,
  items = [],
  className = '',
  densityTight = false,
  ...otherProps
}) => {
  const densityClass = densityTight ? 'density-tight' : '';
  
  return (
    <div className={`text-link-list ${densityClass} ${className}`} {...otherProps}>
      {title && (
        <div className="title">
          <div className="text-strong">
            <div className="text-strong2">{title}</div>
          </div>
        </div>
      )}
      
      {items.map((item, index) => (
        <div key={index} className="text-link-list-item">
          <div className="list-item">{item}</div>
        </div>
      ))}
    </div>
  );
};

TextLinkList.propTypes = {
  title: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.node),
  className: PropTypes.string,
  densityTight: PropTypes.bool
};

/**
 * TextList component for displaying a list of items
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of items to display in the list
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.densityTight - Whether to use tight spacing
 */
export const TextList = ({
  items = [],
  className = '',
  densityTight = false,
  ...otherProps
}) => {
  const densityClass = densityTight ? 'density-tight' : '';
  
  return (
    <div className={`text-list ${densityClass} ${className}`} {...otherProps}>
      {items.map((item, index) => (
        <div key={index} className="text-list-item">
          <div className="list-item">
            <ul className="list-item-span">
              <li>{item}</li>
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

TextList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.node).isRequired,
  className: PropTypes.string,
  densityTight: PropTypes.bool
};

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
 * TextPrice component for displaying a price with currency symbol and period
 * 
 * @param {Object} props - Component props
 * @param {string|number} props.price - The price amount
 * @param {string} props.currency - The currency symbol
 * @param {string} props.period - The time period for the price
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.small - Whether to use small size variant
 */
export const TextPrice = ({
  price,
  currency = '$',
  period = '/ mo',
  className = '',
  small = false,
  ...otherProps
}) => {
  const sizeClass = small ? 'size-small' : '';
  
  return (
    <div className={`text-price ${sizeClass} ${className}`} {...otherProps}>
      <div className="price">
        <div className="div">{currency}</div>
        <div className="_50">{price}</div>
      </div>
      <div className="mo">{period}</div>
    </div>
  );
};

TextPrice.propTypes = {
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currency: PropTypes.string,
  period: PropTypes.string,
  className: PropTypes.string,
  small: PropTypes.bool
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
