import React, { useState } from 'react';
import Modal from './Modal';
import './DemoModals.css';

const DemoModals = () => {
  // Estado para controlar la visibilidad de los modales
  const [showDefaultModal, setShowDefaultModal] = useState(true);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  
  // Función para restablecer la visibilidad de todos los modales
  const resetModals = () => {
    setShowDefaultModal(true);
    setShowSheetModal(false);
    setShowCustomModal(false);
  };

  return (
    <div className="demo-container">
      <h1>Demostración de Modales</h1>
      
      <section className="demo-section">
        <h2>Tipos de Modal</h2>
        
        <div className="modal-group">
          <h3>Modal Estándar</h3>
          <button className="reset-button" onClick={() => setShowDefaultModal(true)}>
            Mostrar modal estándar
          </button>
          <Modal 
            heading="Text Heading"
            bodyText="Body text"
            primaryButtonText="Button"
            secondaryButtonText="Button"
            onPrimaryClick={() => alert('Botón primario clickeado')}
            onSecondaryClick={() => alert('Botón secundario clickeado')}
            onClose={() => setShowDefaultModal(false)}
            isOpen={showDefaultModal}
          />
        </div>
        
        <div className="modal-group">
          <h3>Modal Sheet</h3>
          <button className="reset-button" onClick={() => setShowSheetModal(true)}>
            Mostrar modal sheet
          </button>
          <Modal 
            heading="Text Heading"
            bodyText="Body text"
            primaryButtonText="Button"
            secondaryButtonText="Button"
            onPrimaryClick={() => alert('Botón primario clickeado')}
            onSecondaryClick={() => alert('Botón secundario clickeado')}
            onClose={() => setShowSheetModal(false)}
            variant="sheet"
            isOpen={showSheetModal}
          />
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Variaciones</h2>
        
        <div className="modal-group">
          <h3>Modal con contenido personalizado</h3>
          <button className="reset-button" onClick={() => setShowCustomModal(true)}>
            Mostrar modal con contenido personalizado
          </button>
          <Modal 
            heading="Contenido personalizado"
            primaryButtonText="Aceptar"
            onPrimaryClick={() => setShowCustomModal(false)}
            onClose={() => setShowCustomModal(false)}
            isOpen={showCustomModal}
          >
            <div className="custom-content">
              <p>Este es un ejemplo de un modal con contenido personalizado.</p>
              <div className="custom-form">
                <label htmlFor="custom-input">Ingresa un valor:</label>
                <input 
                  id="custom-input" 
                  type="text" 
                  className="custom-input"
                  placeholder="Escribe aquí..."
                />
              </div>
            </div>
          </Modal>
        </div>
        
        <div className="modal-group">
          <h3>Modal sin botón secundario</h3>
          <button className="reset-button" onClick={() => {
            setShowDefaultModal(false);
            setShowSheetModal(false);
            setShowCustomModal(false);
            setTimeout(() => {
              setShowDefaultModal(true);
            }, 100);
          }}>
            Mostrar modal sin botón secundario
          </button>
          <Modal 
            heading="Text Heading"
            bodyText="Este modal solo tiene un botón principal."
            primaryButtonText="Entendido"
            onPrimaryClick={() => setShowDefaultModal(false)}
            onClose={() => setShowDefaultModal(false)}
            isOpen={showDefaultModal}
          />
        </div>
      </section>
      
      <section className="demo-section">
        <button className="main-reset-button" onClick={resetModals}>
          Restablecer todos los modales
        </button>
      </section>
    </div>
  );
};

export default DemoModals;
