import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import InputField from '../../../components/Inputs/InputField';
import styles from './EditarEmpresaConvenio.module.css';

/**
 * Modal for editing a convenio company.
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onSave: function({ nombre, rif })
 * - onArchive: function()
 * - empresa: { nombre: string, rif: string }
 */
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      heading="Editar empresa"
      contentClassName={styles.editarEmpresaConvenioModal}
      primaryButtonText="Guardar"
      onPrimaryClick={handleSave}
      primaryButtonDisabled={!nombre.trim() || !rif.trim()}
      secondaryButtonText="Cancelar"
      onSecondaryClick={onClose}
      size="medium"
    >
      <div className={styles.editarEmpresaConvenioModalBody}>
        <div className={styles.editarEmpresaConvenioFields}>
          <InputField
            label="Nombre de la empresa"
            value={nombre}
            onChange={setNombre}
            placeholder="DAKA"
            fillContainer
          />
          <InputField
            label="RIF"
            value={rif}
            onChange={setRif}
            placeholder="00000000-0"
            fillContainer
          />
        </div>
        <div className={styles.editarEmpresaConvenioButtonGroup}>
          <button
            className={styles.archivarButton}
            type="button"
            onClick={onArchive}
          >
            <span className={styles.archiveIconWrapper}>
              <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5998 2.8999C1.15798 2.8999 0.799805 3.25807 0.799805 3.6999V4.4999C0.799805 4.94173 1.15798 5.2999 1.5998 5.2999H14.3998C14.8416 5.2999 15.1998 4.94173 15.1998 4.4999V3.6999C15.1998 3.25807 14.8416 2.8999 14.3998 2.8999H1.5998Z" fill="var(--sds-color-icon-danger-default, #900B09)"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M1.5998 6.4999H14.3998L13.7506 12.6674C13.6649 13.4817 12.9782 14.0999 12.1594 14.0999H3.84022C3.02141 14.0999 2.33473 13.4817 2.24901 12.6674L1.5998 6.4999ZM5.5998 9.2999C5.5998 8.85807 5.95798 8.4999 6.3998 8.4999H9.5998C10.0416 8.4999 10.3998 8.85807 10.3998 9.2999C10.3998 9.74173 10.0416 10.0999 9.5998 10.0999H6.3998C5.95798 10.0999 5.5998 9.74173 5.5998 9.2999Z" fill="var(--sds-color-icon-danger-default, #900B09)"/>
              </svg>
            </span>
            <span className={styles.archivarButtonText}>Archivar</span>
          </button>
          <div className={styles.frame77}>
            {/* The Modal's button-group already renders Cancel/Guardar, so nothing here */}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditarEmpresaConvenio;
