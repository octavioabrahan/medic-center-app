// src/components/ButtonDemo.jsx
import React from 'react';
import '../../styles/tokens.css';
import './Button.css';
import { PlusIcon } from '@heroicons/react/24/solid';

const componentSets = [
  {
    name: 'Button',
    variants: ['primary', 'neutral', 'subtle'],
  },
  {
    name: 'Button Danger',
    // Figma define dos “sub-variants” dentro de Danger: Primary y Subtle
    variants: ['danger-primary', 'danger-subtle'],
  },
  {
    name: 'Icon Button',
    variants: ['icon-primary', 'icon-neutral', 'icon-subtle'],
  }
];

const sizes  = ['medium', 'small'];
const states = ['default', 'disabled'];

export default function ButtonDemo() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {componentSets.map(set => (
        <section key={set.name} style={{ marginBottom: '3rem' }}>
          <h1>{set.name}</h1>

          {sizes.map(size => (
            <div key={size} style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ textTransform: 'capitalize' }}>{size}</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${states.length}, auto)`,
                gap: '1rem',
                alignItems: 'start'
              }}>
                {/* estados */}
                {states.map(state => (
                  <div key={state} style={{ textAlign: 'center' }}>
                    <strong style={{ display: 'block', marginBottom: '.5rem', textTransform: 'capitalize' }}>
                      {state}
                    </strong>
                  </div>
                ))}

                {/* filas de variantes */}
                {set.variants.map(rawVariant => {
                  // rawVariant puede ser "danger-subtle" o "icon-primary", etc.
                  const parts = rawVariant.split('-'); 
                  // e.g. ['danger','subtle']  o ['icon','primary']
                  return parts.map((_, idx) => null), null; // just to clarify
                })}

                {/* Mejor: construimos por variante */}
                {set.variants.map(rawVariant => {
                  const parts = rawVariant.split('-');
                  // cuando parts=[ 'danger','primary' ], la clase es btn--danger btn--primary
                  // cuando parts=[ 'icon','subtle' ], es btn--icon btn--subtle
                  const variantClasses = parts.map(p => `btn--${p}`).join(' ');
                  // label legible:
                  const label = rawVariant
                    .replace('danger-', '')
                    .replace('icon-', '')
                    .replace('-', ' ')
                    .toUpperCase().replace(/^\w/, c => c.toUpperCase());

                  return (
                    <React.Fragment key={rawVariant}>
                      {states.map(state => {
                        const isDisabled = state === 'disabled';
                        const hoverClass = state === 'hover' ? 'btn--hover' : '';
                        const className = [
                          'btn',
                          variantClasses,
                          `btn--${size}`,
                          hoverClass
                        ]
                          .filter(Boolean)
                          .join(' ');

                        return (
                          <button
                            key={`${rawVariant}-${state}`}
                            className={className}
                            disabled={isDisabled}
                          >
                            {rawVariant.startsWith('icon') ? (
                              <PlusIcon className="btn__icon" />
                            ) : (
                              <>
                                <PlusIcon className="btn__icon" />
                                <span style={{ marginLeft: '.5rem' }}>{label}</span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
