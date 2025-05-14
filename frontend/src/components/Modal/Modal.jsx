import React from 'react';
import './Modal.css';
import { XMarkIcon } from '@heroicons/react/24/solid';
import Button from '../Button/Button';

/**
 * Modal component for displaying dialogs and alerts
 * @param {Object} props - Component props
 * @param {string} props.heading - Modal heading text
 * @param {string} props.bodyText - Modal body text
 * @param {React.ReactNode} props.children - Custom content to render in the modal body
 * @param {string} props.primaryButtonText - Text for primary button
 * @param {Function} props.onPrimaryClick - Function to call when primary button is clicked
 * @param {string} props.secondaryButtonText - Text for secondary button
 * @param {Function} props.onSecondaryClick - Function to call when secondary button is clicked
 * @param {Function} props.onClose - Function to call when close button is clicked
 * @param {string} props.variant - Modal variant (default, sheet)
 * @param {boolean} props.isOpen - Controls if the modal is visible
 */
const Modal = ({
  heading,
  bodyText,
  children,
  primaryButtonText,
  onPrimaryClick,
  secondaryButtonText,
  onSecondaryClick,
  onClose,
  variant = 'default',
  isOpen = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-body ${variant ? `type-${variant}` : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text">
          <div className="text-heading">{heading}</div>
          {bodyText && <div className="body-text">{bodyText}</div>}
          {children && <div className="modal-content">{children}</div>}
        </div>
        
        <div className="button-group">
          {secondaryButtonText && (
            <Button 
              variant="neutral" 
              onClick={onSecondaryClick}
            >
              {secondaryButtonText}
            </Button>
          )}
          
          {primaryButtonText && (
            <Button 
              variant="primary" 
              onClick={onPrimaryClick}
            >
              {primaryButtonText}
            </Button>
          )}
        </div>
        
        {onClose && (
          <div className="icon-button" onClick={onClose} role="button" tabIndex={0}>
            <XMarkIcon className="x" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
