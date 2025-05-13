// src/components/ButtonDemo.jsx
import React from 'react';
import '../../styles/tokens.css';
import './Button.css';
import { PlusIcon } from '@heroicons/react/24/solid';
import Button from './Button'; // Importamos el componente Button

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
      {/* Demo original */}
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
      
      {/* Nueva sección de demostración para opciones de ancho (Hug Content vs Fill Container) */}
      <section style={{ marginBottom: '3rem' }}>
        <h1>Opciones de Ancho (Layout)</h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <h2>Hug Content (Default)</h2>
          <div style={{ 
            border: '1px dashed gray', 
            padding: '1rem',
            width: '100%',
            maxWidth: '500px'
          }}>
            <Button variant="primary" size="medium">
              <PlusIcon className="btn__icon" />
              <span style={{ marginLeft: '.5rem' }}>Hug Content</span>
            </Button>
          </div>
          <p style={{ marginTop: '0.5rem', color: '#666' }}>
            El botón se ajusta al tamaño de su contenido
          </p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h2>Fill Container (fullWidth=true)</h2>
          <div style={{ 
            border: '1px dashed gray', 
            padding: '1rem',
            width: '100%',
            maxWidth: '500px'
          }}>
            <Button variant="primary" size="medium" fullWidth={true}>
              <PlusIcon className="btn__icon" />
              <span style={{ marginLeft: '.5rem' }}>Fill Container</span>
            </Button>
          </div>
          <p style={{ marginTop: '0.5rem', color: '#666' }}>
            El botón ocupa todo el ancho disponible del contenedor
          </p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h2>Comparación de Variantes</h2>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1rem',
            border: '1px dashed gray', 
            padding: '1rem',
            width: '100%',
            maxWidth: '500px'
          }}>
            <Button variant="primary" fullWidth={true}>
              <PlusIcon className="btn__icon" />
              <span style={{ marginLeft: '.5rem' }}>Primary (Fill)</span>
            </Button>
            
            <Button variant="neutral" fullWidth={true}>
              <PlusIcon className="btn__icon" />
              <span style={{ marginLeft: '.5rem' }}>Neutral (Fill)</span>
            </Button>
            
            <Button variant="subtle" fullWidth={true}>
              <PlusIcon className="btn__icon" />
              <span style={{ marginLeft: '.5rem' }}>Subtle (Fill)</span>
            </Button>
            
            <Button variant="danger" fullWidth={true}>
              <PlusIcon className="btn__icon" />
              <span style={{ marginLeft: '.5rem' }}>Danger (Fill)</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
