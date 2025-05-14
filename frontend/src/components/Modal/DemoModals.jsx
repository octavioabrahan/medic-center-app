import React, { useState } from 'react';
import Modal from './Modal';
import InputField from '../Inputs/InputField';
import TextAreaField from '../Inputs/TextAreaField';
import SelectField from '../Inputs/SelectField';
import CheckboxField from '../Inputs/CheckboxField';
import RadioField from '../Inputs/RadioField';
import SwitchField from '../Inputs/SwitchField';
import SearchField from '../Inputs/SearchField';
import './DemoModals.css';

const DemoModals = () => {
  // Estado para controlar la visibilidad de los modales
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showTwoButtonModal, setShowTwoButtonModal] = useState(true);
  const [showSingleButtonModal, setShowSingleButtonModal] = useState(false);
  const [showSecondaryOnlyModal, setShowSecondaryOnlyModal] = useState(false);
  const [showNoButtonsModal, setShowNoButtonsModal] = useState(false);
  const [showLongTextModal, setShowLongTextModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showNoPaddingModal, setShowNoPaddingModal] = useState(false);
  const [showSmallModal, setShowSmallModal] = useState(false);
  const [showLargeModal, setShowLargeModal] = useState(false);
  const [showAllInputsModal, setShowAllInputsModal] = useState(false);
  
  // Estado para el campo de entrada en el modal personalizado
  const [inputValue, setInputValue] = useState('');
  const [nombreValue, setNombreValue] = useState('');
  const [apellidoValue, setApellidoValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  
  // Estado para componentes de entrada adicionales
  const [textAreaValue, setTextAreaValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('opcion1');
  const [switchValue, setSwitchValue] = useState(false);
  
  // Opciones para el SelectField
  const selectOptions = [
    { label: 'Opción 1', value: 'opcion1' },
    { label: 'Opción 2', value: 'opcion2' },
    { label: 'Opción 3', value: 'opcion3' },
  ];
  
  // Función para restablecer la visibilidad de todos los modales
  const resetModals = () => {
    setShowDefaultModal(false);
    setShowSheetModal(false);
    setShowCustomModal(false);
    setShowTwoButtonModal(true);
    setShowSingleButtonModal(false);
    setShowSecondaryOnlyModal(false);
    setShowNoButtonsModal(false);
    setShowLongTextModal(false);
    setShowFormModal(false);
    setShowNoPaddingModal(false);
    setShowSmallModal(false);
    setShowLargeModal(false);
    setShowAllInputsModal(false);
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
                <SearchField
                  value={searchValue}
                  onChange={setSearchValue}
                  placeholder="Buscar..."
                  onClear={() => setSearchValue("")}
                  fillContainer={true}
                  style={{ marginTop: '16px' }}
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
                <SelectField
                  label="Tipo de identificación"
                  value={selectValue}
                  options={selectOptions}
                  onChange={setSelectValue}
                  style={{ width: '100%', marginBottom: '16px' }}
                />
                <p className="form-note">Todos los campos son obligatorios</p>
              </div>
            </div>
          </Modal>
        </div>

        <div className="modal-group">
          <h3>Modal solo con botón secundario</h3>
          <button className="reset-button" onClick={() => setShowSecondaryOnlyModal(true)}>
            Mostrar modal solo con botón secundario
          </button>
          <Modal 
            heading="Solo botón secundario"
            bodyText="Este modal solo tiene un botón secundario."
            secondaryButtonText="Cancelar"
            onSecondaryClick={() => setShowSecondaryOnlyModal(false)}
            onClose={() => setShowSecondaryOnlyModal(false)}
            isOpen={showSecondaryOnlyModal}
          />
        </div>
        
        <div className="modal-group">
          <h3>Modal sin botones</h3>
          <button className="reset-button" onClick={() => setShowNoButtonsModal(true)}>
            Mostrar modal sin botones
          </button>
          <Modal 
            heading="Sin botones"
            bodyText="Este modal no tiene botones, solo puede cerrarse con el botón X."
            onClose={() => setShowNoButtonsModal(false)}
            isOpen={showNoButtonsModal}
          />
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Tamaños de Modal</h2>
        
        <div className="modal-group">
          <h3>Modal pequeño</h3>
          <button className="reset-button" onClick={() => setShowSmallModal(true)}>
            Mostrar modal pequeño
          </button>
          <Modal 
            heading="Modal pequeño"
            bodyText="Este es un ejemplo de un modal de tamaño pequeño (max-width: 400px)."
            primaryButtonText="Aceptar"
            onPrimaryClick={() => setShowSmallModal(false)}
            onClose={() => setShowSmallModal(false)}
            isOpen={showSmallModal}
            size="small"
          />
        </div>
        
        <div className="modal-group">
          <h3>Modal grande</h3>
          <button className="reset-button" onClick={() => setShowLargeModal(true)}>
            Mostrar modal grande
          </button>
          <Modal 
            heading="Modal grande"
            bodyText="Este es un ejemplo de un modal de tamaño grande (max-width: 800px). Es útil para mostrar mayor cantidad de contenido o formularios más complejos."
            primaryButtonText="Aceptar"
            onPrimaryClick={() => setShowLargeModal(false)}
            onClose={() => setShowLargeModal(false)}
            isOpen={showLargeModal}
            size="large"
          />
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Modal sin padding</h2>
        
        <div className="modal-group">
          <h3>Modal sin padding para contenido personalizado</h3>
          <button className="reset-button" onClick={() => setShowNoPaddingModal(true)}>
            Mostrar modal sin padding
          </button>
          <Modal 
            heading="Contenido sin padding"
            primaryButtonText="Cerrar"
            onPrimaryClick={() => setShowNoPaddingModal(false)}
            onClose={() => setShowNoPaddingModal(false)}
            isOpen={showNoPaddingModal}
            noPadding={true}
          >
            <div className="custom-edge-to-edge-container">
              <div className="custom-image-container">
                <div className="image-placeholder">Imagen / Contenido sin padding</div>
              </div>
              <div className="content-padding">
                <p>Este modal muestra contenido personalizado que llega hasta los bordes del modal, sin padding interno adicional.</p>
                <p>Es útil para mostrar imágenes, mapas o cualquier contenido que necesite aprovechar el espacio completo.</p>
              </div>
            </div>
          </Modal>
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Modal con todos los tipos de inputs</h2>
        
        <div className="modal-group">
          <h3>Modal con todos los componentes de entrada</h3>
          <button className="reset-button" onClick={() => setShowAllInputsModal(true)}>
            Mostrar modal con todos los inputs
          </button>
          <Modal 
            heading="Formulario completo"
            primaryButtonText="Guardar"
            secondaryButtonText="Cancelar"
            onPrimaryClick={() => setShowAllInputsModal(false)}
            onSecondaryClick={() => setShowAllInputsModal(false)}
            onClose={() => setShowAllInputsModal(false)}
            isOpen={showAllInputsModal}
            size="large"
          >
            <div className="custom-content">
              <p>Este modal incluye ejemplos de todos los componentes de entrada disponibles:</p>
              <div className="form-container">
                <div className="form-row">
                  <InputField
                    label="Campo de texto"
                    value={inputValue}
                    onChange={setInputValue}
                    placeholder="Escribe aquí..."
                    style={{ width: '100%', marginBottom: '16px' }}
                  />
                </div>
                
                <div className="form-row">
                  <TextAreaField
                    label="Área de texto"
                    value={textAreaValue}
                    onChange={setTextAreaValue}
                    placeholder="Escribe un comentario..."
                    style={{ width: '100%', marginBottom: '16px' }}
                  />
                </div>
                
                <div className="form-row">
                  <SelectField
                    label="Menú desplegable"
                    value={selectValue}
                    options={selectOptions}
                    onChange={setSelectValue}
                    style={{ width: '100%', marginBottom: '16px' }}
                  />
                </div>
                
                <div className="form-row">
                  <SearchField
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Buscar..."
                    onClear={() => setSearchValue("")}
                    fillContainer={true}
                    style={{ marginBottom: '16px' }}
                  />
                </div>
                
                <div className="form-row checkbox-row">
                  <CheckboxField
                    label="Acepto los términos y condiciones"
                    checked={checkboxValue}
                    onChange={setCheckboxValue}
                    style={{ width: '100%', marginBottom: '16px' }}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-section-title">Opciones disponibles:</div>
                  <div className="radio-group-container">
                    <RadioField
                      label="Opción 1"
                      checked={radioValue === 'opcion1'}
                      onChange={() => setRadioValue('opcion1')}
                      name="opciones-radio"
                      style={{ width: '100%', marginBottom: '8px' }}
                    />
                    <RadioField
                      label="Opción 2"
                      checked={radioValue === 'opcion2'}
                      onChange={() => setRadioValue('opcion2')}
                      name="opciones-radio"
                      style={{ width: '100%', marginBottom: '16px' }}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <SwitchField
                    label="Activar notificaciones"
                    checked={switchValue}
                    onChange={setSwitchValue}
                    style={{ width: '100%', marginBottom: '16px' }}
                  />
                </div>
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
