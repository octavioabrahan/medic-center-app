import React from 'react';
import './Button.css';

/**
 * Button component leveraging CSS custom properties from tokens.css for consistent styling.
 * Variants: primary, neutral, subtle
 * Sizes: medium, small
 */
export const Button = ({
  variant = 'primary',   // 'primary' | 'neutral' | 'subtle'
  size = 'medium',       // 'medium' | 'small'
  disabled = false,
  children,
  ...props
}) => {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    disabled ? 'btn--disabled' : ''
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