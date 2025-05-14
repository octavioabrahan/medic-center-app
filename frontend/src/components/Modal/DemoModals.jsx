import React, { useState } from 'react';
import Modal from './Modal';
import InputField from '../Inputs/InputField';
import './DemoModals.css';

const DemoModals = () => {
  // Estado para controlar la visibilidad de los modales
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showTwoButtonModal, setShowTwoButtonModal] = useState(true);
  const [showSingleButtonModal, setShowSingleButtonModal] = useState(false);
  const [showLongTextModal, setShowLongTextModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  
  // Estado para el campo de entrada en el modal personalizado
  const [inputValue, setInputValue] = useState('');
  const [nombreValue, setNombreValue] = useState('');
  const [apellidoValue, setApellidoValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  
  // Función para restablecer la visibilidad de todos los modales
  const resetModals = () => {
    setShowDefaultModal(false);
    setShowSheetModal(false);
    setShowCustomModal(false);
    setShowTwoButtonModal(true);
    setShowSingleButtonModal(false);
    setShowLongTextModal(false);
    setShowFormModal(false);
  };

  return (
    <div className="demo-container">
      <h1>Demostración de Modales</h1>
      
      <section className="demo-section">
        <h2>Tipos de Modal</h2>
        
        <div className="modal-group">
          <h3>Modal Estándar con Dos Botones</h3>
          <button className="reset-button" onClick={() => setShowTwoButtonModal(true)}>
            Mostrar modal estándar con dos botones
          </button>
          <Modal 
            heading="Text Heading"
            bodyText="Body text"
            primaryButtonText="Button"
            secondaryButtonText="Button"
            onPrimaryClick={() => alert('Botón primario clickeado')}
            onSecondaryClick={() => alert('Botón secundario clickeado')}
            onClose={() => setShowTwoButtonModal(false)}
            isOpen={showTwoButtonModal}
          />
        </div>
        
        <div className="modal-group">
          <h3>Modal Estándar</h3>
          <button className="reset-button" onClick={() => setShowDefaultModal(true)}>
            Mostrar modal estándar
          </button>
          <Modal 
            heading="Text Heading"
            bodyText="Body text"
            primaryButtonText="Button"
            onPrimaryClick={() => alert('Botón primario clickeado')}
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
                <InputField
                  label="Ingresa un valor"
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder="Escribe aquí..."
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </Modal>
        </div>
        
        <div className="modal-group">
          <h3>Modal con texto largo</h3>
          <button className="reset-button" onClick={() => setShowLongTextModal(true)}>
            Mostrar modal con texto largo
          </button>
          <Modal 
            heading="Información detallada"
            primaryButtonText="Entendido"
            onPrimaryClick={() => setShowLongTextModal(false)}
            onClose={() => setShowLongTextModal(false)}
            isOpen={showLongTextModal}
          >
            <div className="custom-content">
              <p>Este es un ejemplo de un modal con texto largo para probar cómo se comporta con contenido extenso. Los modales deben ser capaces de adaptarse a diferentes cantidades de contenido, manteniendo una estructura coherente y legible.</p>
              
              <h4>Características importantes</h4>
              <p>El componente Modal ha sido diseñado para ser flexible y adaptarse a distintos tipos de contenido. Puede contener desde mensajes simples hasta formularios complejos.</p>
              
              <h4>Buenas prácticas</h4>
              <ul>
                <li>Mantener títulos concisos y descriptivos</li>
                <li>Limitar la cantidad de información mostrada</li>
                <li>Usar lenguaje claro y directo</li>
                <li>Proporcionar opciones de acción claras al usuario</li>
                <li>Evitar modales dentro de modales</li>
              </ul>
              
              <p>Los modales son útiles para centrar la atención del usuario en una tarea específica, pero deben usarse con moderación para no interrumpir constantemente el flujo de trabajo.</p>
            </div>
          </Modal>
        </div>
        
        <div className="modal-group">
          <h3>Modal sin botón secundario</h3>
          <button className="reset-button" onClick={() => setShowSingleButtonModal(true)}>
            Mostrar modal sin botón secundario
          </button>
          <Modal 
            heading="Text Heading"
            bodyText="Este modal solo tiene un botón principal."
            primaryButtonText="Entendido"
            onPrimaryClick={() => setShowSingleButtonModal(false)}
            onClose={() => setShowSingleButtonModal(false)}
            isOpen={showSingleButtonModal}
          />
        </div>

        <div className="modal-group">
          <h3>Modal con formulario</h3>
          <button className="reset-button" onClick={() => setShowFormModal(true)}>
            Mostrar modal con formulario completo
          </button>
          <Modal 
            heading="Datos del paciente"
            primaryButtonText="Guardar"
            secondaryButtonText="Cancelar"
            onPrimaryClick={() => setShowFormModal(false)}
            onSecondaryClick={() => setShowFormModal(false)}
            onClose={() => setShowFormModal(false)}
            isOpen={showFormModal}
          >
            <div className="custom-content">
              <p>Por favor complete la información del paciente:</p>
              <div className="form-container">
                <InputField
                  label="Nombres"
                  value={nombreValue}
                  onChange={setNombreValue}
                  placeholder="Ingrese nombres"
                  style={{ width: '100%', marginBottom: '16px' }}
                />
                <InputField
                  label="Apellidos"
                  value={apellidoValue}
                  onChange={setApellidoValue}
                  placeholder="Ingrese apellidos"
                  style={{ width: '100%', marginBottom: '16px' }}
                />
                <InputField
                  label="Correo electrónico"
                  value={emailValue}
                  onChange={setEmailValue}
                  placeholder="ejemplo@correo.com"
                  style={{ width: '100%', marginBottom: '16px' }}
                />
                <p className="form-note">Todos los campos son obligatorios</p>
              </div>
            </div>
          </Modal>
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
