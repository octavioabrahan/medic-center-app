import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import InputField from '../../../components/Inputs/InputField';
import Button from '../../../components/Button/Button';

const modalBodyStyle = {
  width: '100%',
  maxWidth: 600,
  padding: 'var(--sds-size-space-800, 32px)',
  position: 'relative',
  background: 'var(--sds-color-background-default-default, white)',
  boxShadow: '0px 4px 4px -4px rgba(12, 12, 13, 0.05), 0px 1px 1px -1px rgba(12, 12, 13, 0.03)',
  borderRadius: 'var(--sds-size-radius-200, 8px)',
  outline: '1px var(--sds-color-border-default-default, #D9D9D9) solid',
  outlineOffset: '-1px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 'var(--sds-size-space-600, 24px)',
  alignSelf: 'stretch',
};

const closeButtonStyle = {
  padding: 8,
  position: 'absolute',
  right: 8,
  top: 8,
  borderRadius: 32,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const EditarEmpresaConvenio = ({ isOpen, onClose, onSave, onArchive, empresa }) => {
  const [nombre, setNombre] = useState(empresa?.nombre || '');
  const [rif, setRif] = useState(empresa?.rif || '');

  useEffect(() => {
    setNombre(empresa?.nombre || '');
    setRif(empresa?.rif || '');
  }, [empresa, isOpen]);

  const handleSave = () => {
    if (nombre.trim() && rif.trim()) {
      onSave?.({ nombre, rif });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium" noPadding>
      <div style={modalBodyStyle}>
        {/* Close Button */}
        <button style={closeButtonStyle} onClick={onClose} aria-label="Cerrar">
          <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5.5L5 15.5M5 5.5L15 15.5" stroke="var(--sds-color-icon-default-default, #1E1E1E)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Title and Inputs */}
        <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: 'var(--sds-color-text-default-default, #1E1E1E)', fontSize: 24, fontWeight: 600, lineHeight: '28.8px', fontFamily: 'Inter', alignSelf: 'stretch' }}>
            Editar empresa
          </div>
          <InputField
            label="Nombre de la empresa"
            value={nombre}
            onChange={setNombre}
            placeholder="Nombre de la empresa"
            fillContainer
          />
          <InputField
            label="RIF"
            value={rif}
            onChange={setRif}
            placeholder="A00000000-0"
            fillContainer
          />
        </div>
        {/* Button Group */}
        <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Archivar Button */}
          <Button
            variant="subtle"
            size="medium"
            onClick={onArchive}
            style={{ padding: 12, borderRadius: 8, color: 'var(--sds-color-text-danger-default, #900B09)', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5998 2.8999C1.15798 2.8999 0.799805 3.25807 0.799805 3.6999V4.4999C0.799805 4.94173 1.15798 5.2999 1.5998 5.2999H14.3998C14.8416 5.2999 15.1998 4.94173 15.1998 4.4999V3.6999C15.1998 3.25807 14.8416 2.8999 14.3998 2.8999H1.5998Z" fill="var(--sds-color-icon-danger-default, #900B09)"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M1.5998 6.4999H14.3998L13.7506 12.6674C13.6649 13.4817 12.9782 14.0999 12.1594 14.0999H3.84022C3.02141 14.0999 2.33473 13.4817 2.24901 12.6674L1.5998 6.4999ZM5.5998 9.2999C5.5998 8.85807 5.95798 8.4999 6.3998 8.4999H9.5998C10.0416 8.4999 10.3998 8.85807 10.3998 9.2999C10.3998 9.74173 10.0416 10.0999 9.5998 10.0999H6.3998C5.95798 10.0999 5.5998 9.74173 5.5998 9.2999Z" fill="var(--sds-color-icon-danger-default, #900B09)"/>
              </svg>
            </span>
            <span>Archivar</span>
          </Button>
          {/* Right Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button variant="neutral" size="medium" onClick={onClose} style={{ padding: 12, borderRadius: 8 }}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={handleSave}
              disabled={!nombre.trim() || !rif.trim()}
              style={{ padding: 12, borderRadius: 8 }}
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditarEmpresaConvenio;
