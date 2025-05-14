import React from 'react';
import './Banner.css';

/**
 * Banner component for displaying informational or alert messages
 * @param {Object} props - Component props
 * @param {string} props.title - Banner title
 * @param {string} props.text - Banner body text
 * @param {string} props.buttonText - Text to display in the button
 * @param {Function} props.onButtonClick - Function to call when button is clicked
 * @param {Function} props.onClose - Function to call when close button is clicked
 * @param {string} props.variant - Banner variant (default, danger)
 */
const Banner = ({ 
  title, 
  text, 
  buttonText, 
  onButtonClick, 
  onClose, 
  variant = 'default' 
}) => {
  // Determine the icon based on variant
  const IconComponent = variant === 'danger' 
    ? (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="heroicons-mini-exclamation-circle">
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
      </svg>)
    : (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="heroicons-mini-information-circle">
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
      </svg>);

  return (
    <div className={`banner ${variant !== 'default' ? `variant-${variant}` : ''}`}>
      <div className="title">
        {IconComponent}
        <div className="stack">
          <div className="content">
            <div className="title2">{title}</div>
            <div className="body-text">{text}</div>
          </div>
          {buttonText && (
            <div className="button" onClick={onButtonClick} role="button" tabIndex={0}>
              <div className="button2">{buttonText}</div>
            </div>
          )}
        </div>
        {onClose && (
          <div className="icon-button" onClick={onClose} role="button" tabIndex={0}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="heroicons-mini-x-mark">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;
