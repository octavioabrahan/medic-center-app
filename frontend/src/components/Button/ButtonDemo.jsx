// src/components/ButtonDemo.jsx

import React from 'react';
import '../../styles/tokens.css'; // design tokens
import './Button.css';       // estilos base del botón

const variants = ['Primary', 'Neutral', 'Subtle'];
const sizes = ['Small', 'Medium'];

export default function ButtonDemo() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Button Component Demo</h1>
      {variants.map(variant => (
        <section key={variant} style={{ marginBottom: '2rem' }}>
          <h2>{variant} Variant</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {sizes.map(size => {
              const className = `btn btn--${variant.toLowerCase()} btn--${size.toLowerCase()}`;
              return (
                <button key={size} className={className}>
                  {`${variant} ${size}`}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
