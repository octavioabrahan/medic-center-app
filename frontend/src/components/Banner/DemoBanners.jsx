import React, { useState } from 'react';
import Banner from './Banner';
import './DemoBanners.css';

const DemoBanners = () => {
  // Estado para controlar la visibilidad de los banners
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [showDangerBanner, setShowDangerBanner] = useState(true);
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  
  // Función para restablecer la visibilidad de todos los banners
  const resetBanners = () => {
    setShowInfoBanner(true);
    setShowDangerBanner(true);
    setShowWarningBanner(true);
  };

  return (
    <div className="demo-container">
      <h1>Demostración de Banners</h1>
      
      <section className="demo-section">
        <h2>Tipos de Banner</h2>
        
        <div className="banner-group">
          <h3>Banner Informativo</h3>
          {showInfoBanner ? (
            <Banner 
              title="Title"
              text="Body text."
              buttonText="Button"
              onButtonClick={() => alert('Botón de información clickeado')}
              onClose={() => setShowInfoBanner(false)}
            />
          ) : (
            <button className="reset-button" onClick={() => setShowInfoBanner(true)}>
              Mostrar banner informativo
            </button>
          )}
        </div>
        
        <div className="banner-group">
          <h3>Banner de Peligro</h3>
          {showDangerBanner ? (
            <Banner 
              title="Title"
              text="Body text."
              buttonText="Button"
              variant="danger"
              onButtonClick={() => alert('Botón de peligro clickeado')}
              onClose={() => setShowDangerBanner(false)}
            />
          ) : (
            <button className="reset-button" onClick={() => setShowDangerBanner(true)}>
              Mostrar banner de peligro
            </button>
          )}
        </div>
        
        <div className="banner-group">
          <h3>Banner de Advertencia</h3>
          {showWarningBanner ? (
            <Banner 
              title="Title"
              text="Body text."
              buttonText="Button"
              variant="warning"
              onButtonClick={() => alert('Botón de advertencia clickeado')}
              onClose={() => setShowWarningBanner(false)}
            />
          ) : (
            <button className="reset-button" onClick={() => setShowWarningBanner(true)}>
              Mostrar banner de advertencia
            </button>
          )}
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Variaciones</h2>
        
        <div className="banner-group">
          <h3>Sin botón</h3>
          <Banner 
            title="Sin botón" 
            text="Este banner no incluye un botón de acción."
            onClose={() => {}}
          />
        </div>
        
        <div className="banner-group">
          <h3>Sin botón de cierre</h3>
          <Banner 
            title="Sin cerrar" 
            text="Este banner no se puede cerrar (no hay botón X)."
            buttonText="Acción"
            onButtonClick={() => alert('Botón clickeado')}
          />
        </div>
        
        <div className="banner-group">
          <h3>Banner de peligro minimalista</h3>
          <Banner 
            title="Solo título" 
            variant="danger"
          />
        </div>
        
        <div className="banner-group">
          <h3>Banner de advertencia sin cierre</h3>
          <Banner 
            title="Advertencia importante" 
            text="Este es un mensaje de advertencia que no puede cerrarse."
            buttonText="Entiendo"
            variant="warning"
            onButtonClick={() => alert('Acción de entendimiento confirmada')}
          />
        </div>
      </section>
      
      <section className="demo-section">
        <button className="main-reset-button" onClick={resetBanners}>
          Restablecer todos los banners
        </button>
      </section>
    </div>
  );
};

export default DemoBanners;
