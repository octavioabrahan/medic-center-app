import React from 'react';
import Button from './Button';
import './ButtonDemo.css';

/**
 * ButtonDemo shows all combinations of Button variants, sizes, and states.
 */
const variants = ['primary', 'neutral', 'subtle'];
const sizes = ['medium', 'small'];

export default function ButtonDemo() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Button Component Demo</h1>
      {sizes.map(size => (
        <section key={size} style={{ marginBottom: '2rem' }}>
          <h2>Size: {size}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(variants.length, auto)', gap: '1rem', alignItems: 'center' }}>
            {variants.map(variant => (
              <div key={`${size}-${variant}`} style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '0.5rem' }}><strong>{variant}</strong></div>
                <Button size={size} variant={variant}>Default</Button>
                <Button size={size} variant={variant} disabled style={{ marginLeft: '0.5rem' }}>Disabled</Button>
              </div>
            ))}
          </div>
        </section>
      ))}
      <p>Hover over buttons to see hover styles in action.</p>
    </div>
  );
}