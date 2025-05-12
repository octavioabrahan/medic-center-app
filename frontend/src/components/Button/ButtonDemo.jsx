import React from 'react';
import Button from '../Button/Button';
import './ButtonDemo.css';

const variants = ['primary', 'outline', 'danger', 'warning', 'success', 'info'];
const sizes = ['small', 'medium', 'large'];

export default function ButtonDemo() {
  return (
    <div className="ButtonDemo">
      <h1>Button Component Demo</h1>
      {variants.map((variant) => (
        <div key={variant} className="demo-section">
          <h2>{variant.charAt(0).toUpperCase() + variant.slice(1)}</h2>
          <div className="button-row">
            {sizes.map((size) => (
              <Button
                key={`${variant}-${size}`}
                variant={variant}
                size={size}
                onClick={() => alert(`${variant} ${size} clicked`)}
              >
                {`${variant} ${size}`}
              </Button>
            ))}
            <Button variant={variant} size="medium" disabled>
              {`${variant} disabled`}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
