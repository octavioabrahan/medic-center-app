import React, { useState } from 'react';
import InputField from '../../../components/Inputs/InputField';
import Button from '../../../components/Button/Button';
import styles from './AgregarEmpresaConvenio.module.css';

/**
 * Modal for adding a new convenio company.
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onAdd: function({ nombre, rif })
 */
const AgregarEmpresaConvenio = ({ isOpen, onClose, onAdd }) => {
  const [nombre, setNombre] = useState('');
  const [rif, setRif] = useState('');

  const handleAdd = () => {
    if (nombre.trim() && rif.trim()) {
      onAdd?.({ nombre, rif });
      setNombre('');
      setRif('');
    }
  };

  const handleClose = () => {
    setNombre('');
    setRif('');
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose} role="dialog" aria-modal="true">
      <div className={styles.dialogBody} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Agregar empresa</h2>
        
        <div className={styles.textSection}>
          <div className={styles.fieldsSection}>
            <InputField
              label="Nombre de la empresa"
              value={nombre}
              onChange={setNombre}
              placeholder="Nombre de la empresa"
              fillContainer
              autoFocus
            />
            <InputField
              label="RIF"
              value={rif}
              onChange={setRif}
              placeholder="A00000000-0"
              fillContainer
            />
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          <div className={styles.frame77}>
            <Button variant="neutral" size="medium" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={handleAdd}
              disabled={!nombre.trim() || !rif.trim()}
            >
              Agregar
            </Button>
          </div>
        </div>
        
        <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
          <svg className={styles.closeIcon} width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5.5L5 15.5M5 5.5L15 15.5" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AgregarEmpresaConvenio;
