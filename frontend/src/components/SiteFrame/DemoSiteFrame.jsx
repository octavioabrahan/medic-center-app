// src/components/SiteFrame/DemoSiteFrame.jsx
import React from 'react';
import SiteFrame from './SiteFrame';
import '../../styles/tokens.css';
import './SiteFrame.css';

/**
 * Demo component to showcase the SiteFrame
 */
const DemoSiteFrame = () => {
  return (
    <SiteFrame>
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>SiteFrame Demo</h1>
        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Descripción</h2>
          <p>
            El componente SiteFrame proporciona una estructura básica para todas las páginas
            de la aplicación, incluyendo un header y un footer consistentes.
          </p>
        </section>
        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Uso</h2>
          <div style={{ 
            padding: '1rem', 
            background: '#f5f5f5', 
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            {`import SiteFrame from '../components/SiteFrame/SiteFrame';
            
function MiPagina() {
  return (
    <SiteFrame>
      {/* Contenido de la página */}
      <h1>Título de la página</h1>
      <p>Contenido...</p>
    </SiteFrame>
  );
}`}
          </div>
        </section>
      </div>
    </SiteFrame>
  );
};

export default DemoSiteFrame;
