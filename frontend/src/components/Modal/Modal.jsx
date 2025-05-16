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
 * @param {boolean} props.primaryButtonDisabled - Whether the primary button is disabled
 * @param {string} props.secondaryButtonText - Text for secondary button
 * @param {Function} props.onSecondaryClick - Function to call when secondary button is clicked
 * @param {Function} props.onClose - Function to call when close button is clicked
 * @param {string} props.variant - Modal variant (default, sheet)
 * @param {boolean} props.isOpen - Controls if the modal is visible
 * @param {boolean} props.noPadding - Remove padding from content area for custom components that need edge-to-edge layout
 * @param {string} props.contentClassName - Additional className for the modal content container
 * @param {string} props.size - Modal size (small, medium, large)
 */
const Modal = ({
  heading,
  bodyText,
  children,
  primaryButtonText,
  onPrimaryClick,
  primaryButtonDisabled = false,
  secondaryButtonText,
  onSecondaryClick,
  onClose,
  variant = 'default',
  isOpen = false,
  noPadding = false,
  contentClassName = '',
  size = 'medium',
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className={`modal-body ${variant ? `type-${variant}` : ''} size-${size} ${noPadding ? 'no-padding' : ''}`}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="modal-heading"
      >
        <div className="text">
          <div className="text-heading" id="modal-heading">{heading}</div>
          {bodyText && <div className="body-text">{bodyText}</div>}
          {children && <div className={`modal-content ${contentClassName}`}>{children}</div>}
        </div>
        
        {(primaryButtonText || secondaryButtonText) && (
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
                disabled={primaryButtonDisabled}
              >
                {primaryButtonText}
              </Button>
            )}
          </div>
        )}
        
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
