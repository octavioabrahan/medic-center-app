import React, { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import InputField from '../../../components/Inputs/InputField';

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
      heading="Agregar empresa"
      contentClassName="agregar-empresa-convenio-modal"
      primaryButtonText="Agregar"
      onPrimaryClick={handleAdd}
      primaryButtonDisabled={!nombre.trim() || !rif.trim()}
      secondaryButtonText="Cancelar"
      onSecondaryClick={handleClose}
      size="medium"
    >
      <div style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
      </div>
    </Modal>
  );
};

export default AgregarEmpresaConvenio;
