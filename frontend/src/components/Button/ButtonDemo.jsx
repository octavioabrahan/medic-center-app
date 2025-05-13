// src/components/ButtonDemo.jsx
import React from 'react';
import '../../styles/tokens.css';
import './Button.css';
import { PlusIcon } from '@heroicons/react/24/solid';

const variants = ['primary', 'neutral', 'subtle', 'danger', 'icon'];
const sizes    = ['small', 'medium'];

export default function ButtonDemo() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Button Component Demo</h1>

      {sizes.map(size => (
        <div key={size} style={{ marginBottom: '2rem' }}>
          <h2 style={{ textTransform: 'capitalize' }}>{size}</h2>
          <div
            style={{
              display: 'flex',
              gap: '2rem',
              flexWrap: 'wrap',
              alignItems: 'flex-start'
            }}
          >
            {variants.map(variant => (
              <div key={variant} style={{ textAlign: 'center' }}>
                <strong
                  style={{
                    textTransform: 'capitalize',
                    display: 'block',
                    marginBottom: '.5rem'
                  }}
                >
                  {variant}
                </strong>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {/* Default */}
                  <button className={`btn btn--${variant} btn--${size}`}>
                    <PlusIcon className="btn__icon" />
                    <span style={{ marginLeft: '.5rem', textTransform: 'capitalize' }}>
                      Default
                    </span>
                  </button>

                  {/* Disabled */}
                  <button
                    className={`btn btn--${variant} btn--${size}`}
                    disabled
                  >
                    <PlusIcon className="btn__icon" />
                    <span style={{ marginLeft: '.5rem', textTransform: 'capitalize' }}>
                      Disabled
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
