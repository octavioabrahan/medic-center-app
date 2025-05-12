// src/components/ButtonDemo.jsx
import React from 'react';
import '../../styles/tokens.css';
import './Button.css';
import { PlusIcon } from '@heroicons/react/solid'; // o tu librería de íconos

const variants = ['primary', 'neutral', 'subtle'];
const sizes    = ['small', 'medium'];
const states   = ['default', 'hover', 'disabled'];

export default function ButtonDemo() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Button Component Demo</h1>
      {sizes.map(size => (
        <div key={size} style={{ marginBottom: '2rem' }}>
          <h2 style={{ textTransform: 'capitalize' }}>{size}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: '1rem', alignItems: 'start' }}>
            {variants.map(variant => (
              <div key={variant}>
                <strong style={{ textTransform: 'capitalize' }}>{variant}</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {states.map(state => {
                    const isDisabled = state === 'disabled';
                    // Para mostrar estado hover de forma forzada, usamos una clase auxiliar
                    const hoverClass = state === 'hover' ? 'btn--hover' : '';
                    return (
                      <button
                        key={state}
                        className={`btn btn--${variant} btn--${size} ${hoverClass}`}
                        disabled={isDisabled}
                      >
                        <PlusIcon className="btn__icon" />
                        <span style={{ marginLeft: '0.5rem', textTransform: 'capitalize' }}>
                          {state}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
