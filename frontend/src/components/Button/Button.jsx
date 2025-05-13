// src/components/Button.jsx

import React from 'react';
import './Button.css';

/**
 * Button component leveraging CSS custom properties from tokens.css for consistent styling.
 *
 * Variants:
 *   - 'primary' (default)
 *   - 'neutral'
 *   - 'subtle'
 *   - 'danger'
 *   - 'icon'    (icon-only square buttons)
 *
 * Sizes:
 *   - 'medium' (default)
 *   - 'small'
 *
 * Props:
 *   - variant: one of the above strings
 *   - size:    'medium' | 'small'
 *   - disabled:boolean
 *   - children: JSX (text, icon, or both)
 */
export const Button = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  children,
  ...props
}) => {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    disabled && 'btn--disabled'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
