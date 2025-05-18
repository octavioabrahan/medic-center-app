import React, { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import InputField from '../../../components/Inputs/InputField';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      contentClassName={styles.agregarEmpresaConvenioModal}
      primaryButtonText="Agregar"
      onPrimaryClick={handleAdd}
      primaryButtonDisabled={!nombre.trim() || !rif.trim()}
      secondaryButtonText="Cancelar"
      onSecondaryClick={handleClose}
      size="medium"
    >
      <div className={styles.agregarEmpresaConvenioModal}>
        <div className={styles['agregar-empresa-convenio-modal__title']}>
          Agregar empresa
        </div>
        <form className={styles['agregar-empresa-convenio-modal__form']} onSubmit={e => { e.preventDefault(); handleAdd(); }}>
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
        </form>
      </div>
    </Modal>
  );
};

export default AgregarEmpresaConvenio;
