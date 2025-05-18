import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import InputField from '../../../components/Inputs/InputField';
import Button from '../../../components/Button/Button';
import styles from './EditarEmpresaConvenio.module.css';

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

  // Custom close button for top right
  const CloseButton = (
    <button
      type="button"
      aria-label="Cerrar"
      onClick={onClose}
      style={{
        padding: 8,
        position: 'absolute',
        right: 8,
        top: 8,
        overflow: 'hidden',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'inline-flex',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 5.5L5 15.5M5 5.5L15 15.5" stroke="var(--Icon-Default-Default, #1E1E1E)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium" noPadding>
      <div
        className="DialogBody"
        style={{
          width: '100%',
          maxWidth: 600,
          padding: 32,
          position: 'relative',
          background: 'var(--Background-Default-Default, white)',
          boxShadow: '0px 4px 4px -4px rgba(12, 12, 13, 0.05)',
          borderRadius: 8,
          outline: '1px var(--Border-Default-Default, #D9D9D9) solid',
          outlineOffset: '-1px',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 24,
          display: 'inline-flex',
        }}
      >
        {CloseButton}
        <div
          className="Text"
          style={{
            alignSelf: 'stretch',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 12,
            display: 'flex',
          }}
        >
          <div
            className="EditarEmpresa"
            style={{
              alignSelf: 'stretch',
              color: 'var(--Text-Default-Default, #1E1E1E)',
              fontSize: 24,
              fontFamily: 'Inter',
              fontWeight: 600,
              lineHeight: '28.80px',
              wordWrap: 'break-word',
            }}
          >
            Editar empresa
          </div>
          <InputField
            label="Nombre de la empresa"
            value={nombre}
            onChange={setNombre}
            placeholder="Nombre de la empresa"
            fillContainer
            style={{ marginBottom: 0 }}
          />
          <InputField
            label="RIF"
            value={rif}
            onChange={setRif}
            placeholder="A00000000-0"
            fillContainer
            style={{ marginBottom: 0 }}
          />
        </div>
        <div
          className="ButtonGroup"
          style={{
            alignSelf: 'stretch',
            justifyContent: 'space-between',
            alignItems: 'center',
            display: 'inline-flex',
          }}
        >
          <Button
            variant="subtle"
            size="medium"
            onClick={onArchive}
            style={{
              padding: 12,
              overflow: 'hidden',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              display: 'flex',
              color: 'var(--Text-Danger-Default, #900B09)',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: 400,
              lineHeight: '22.40px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5998 2.8999C1.15798 2.8999 0.799805 3.25807 0.799805 3.6999V4.4999C0.799805 4.94173 1.15798 5.2999 1.5998 5.2999H14.3998C14.8416 5.2999 15.1998 4.94173 15.1998 4.4999V3.6999C15.1998 3.25807 14.8416 2.8999 14.3998 2.8999H1.5998Z" fill="var(--Icon-Danger-Default, #900B09)"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M1.5998 6.4999H14.3998L13.7506 12.6674C13.6649 13.4817 12.9782 14.0999 12.1594 14.0999H3.84022C3.02141 14.0999 2.33473 13.4817 2.24901 12.6674L1.5998 6.4999ZM5.5998 9.2999C5.5998 8.85807 5.95798 8.4999 6.3998 8.4999H9.5998C10.0416 8.4999 10.3998 8.85807 10.3998 9.2999C10.3998 9.74173 10.0416 10.0999 9.5998 10.0999H6.3998C5.95798 10.0999 5.5998 9.74173 5.5998 9.2999Z" fill="var(--Icon-Danger-Default, #900B09)"/>
              </svg>
            </span>
            <span style={{ color: 'var(--Text-Danger-Default, #900B09)' }}>Archivar</span>
          </Button>
          <div
            className="Frame77"
            style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex' }}
          >
            <Button
              variant="neutral"
              size="medium"
              onClick={onClose}
              style={{
                padding: 12,
                background: 'var(--Background-Neutral-Tertiary, #E3E3E3)',
                overflow: 'hidden',
                borderRadius: 8,
                outline: '1px var(--Border-Neutral-Secondary, #767676) solid',
                outlineOffset: '-1px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                display: 'flex',
                color: 'var(--Text-Default-Default, #1E1E1E)',
                fontSize: 16,
                fontFamily: 'Inter',
                fontWeight: 400,
                lineHeight: '22.40px',
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={handleSave}
              disabled={!nombre.trim() || !rif.trim()}
              style={{
                padding: 12,
                background: 'var(--Background-Brand-Default, #20377A)',
                overflow: 'hidden',
                borderRadius: 8,
                outline: '1px var(--Border-Brand-Default, #20377A) solid',
                outlineOffset: '-1px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                display: 'flex',
                color: 'var(--Text-Brand-On-Brand, #F0F3FF)',
                fontSize: 16,
                fontFamily: 'Inter',
                fontWeight: 400,
                lineHeight: '22.40px',
              }}
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
