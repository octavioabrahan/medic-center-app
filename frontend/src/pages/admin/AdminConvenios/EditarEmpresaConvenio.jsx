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

  // Button group: left-aligned Archivar, right-aligned Cancelar/Guardar
  const buttonGroup = (
    <div className={styles.buttonGroup}>
      <Button
        variant="subtle"
        size="medium"
        onClick={onArchive}
        className={styles.archivarButton}
      >
        <span className={styles.archiveIconWrapper}>
          <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5998 2.8999C1.15798 2.8999 0.799805 3.25807 0.799805 3.6999V4.4999C0.799805 4.94173 1.15798 5.2999 1.5998 5.2999H14.3998C14.8416 5.2999 15.1998 4.94173 15.1998 4.4999V3.6999C15.1998 3.25807 14.8416 2.8999 14.3998 2.8999H1.5998Z" fill="var(--sds-color-icon-danger-default, #900B09)"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M1.5998 6.4999H14.3998L13.7506 12.6674C13.6649 13.4817 12.9782 14.0999 12.1594 14.0999H3.84022C3.02141 14.0999 2.33473 13.4817 2.24901 12.6674L1.5998 6.4999ZM5.5998 9.2999C5.5998 8.85807 5.95798 8.4999 6.3998 8.4999H9.5998C10.0416 8.4999 10.3998 8.85807 10.3998 9.2999C10.3998 9.74173 10.0416 10.0999 9.5998 10.0999H6.3998C5.95798 10.0999 5.5998 9.74173 5.5998 9.2999Z" fill="var(--sds-color-icon-danger-default, #900B09)"/>
          </svg>
        </span>
        <span className={styles.archivarButtonText}>Archivar</span>
      </Button>
      <div className={styles.frame77}>
        <Button variant="neutral" size="medium" onClick={onClose}>Cancelar</Button>
        <Button
          variant="primary"
          size="medium"
          onClick={handleSave}
          disabled={!nombre.trim() || !rif.trim()}
        >
          Guardar
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      contentClassName={styles.editarEmpresaConvenioModal}
      noPadding={false}
    >
      <h2 className={styles.title}>Editar empresa</h2>
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
      {buttonGroup}
    </Modal>
  );
};

export default EditarEmpresaConvenio;
