import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';
// design-tokens.css is imported globally in src/index.js

/**
 * Button component with semantic variants and sizes
 *
 * Props:
 * - children: node - button label or elements
 * - onClick: func - click handler
 * - disabled: bool - disabled state
 * - variant: string - 'primary' | 'outline' | 'danger' | 'warning' | 'success' | 'info'
 * - size: string - 'small' | 'medium' | 'large'
 * - className: string - additional CSS Modules classes
 */
export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  className = ''
}) {
  const variantClass = variant !== 'primary' ? styles[`Button--${variant}`] : '';
  const sizeClass = size !== 'medium' ? styles[`Button--${size}`] : '';

  return (
    <button
      className={[styles.Button, variantClass, sizeClass, className]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf([
    'primary',
    'outline',
    'danger',
    'warning',
    'success',
    'info'
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string
};

Button.defaultProps = {
  onClick: undefined,
  disabled: false,
  variant: 'primary',
  size: 'medium',
  className: ''
};