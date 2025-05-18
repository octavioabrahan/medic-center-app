import React, { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import './ArchivarServicioModal.css';
import './modal-fix.css';

/**
 * Modal de confirmación para archivar un servicio
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Controla si el modal está visible
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Object} props.servicio - Datos del servicio a archivar
 * @param {Function} props.onConfirmArchive - Función a llamar cuando se confirma el archivado
 * @param {boolean} props.loading - Indica si hay una operación en proceso
 */
const ArchivarServicioModal = ({ isOpen, onClose, servicio, onConfirmArchive, loading }) => {
  const [confirmacionArchivado, setConfirmacionArchivado] = useState(false);

  const handleConfirmar = async () => {
    if (confirmacionArchivado && onConfirmArchive) {
      await onConfirmArchive(servicio);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      heading={`¿Quieres archivar el servicio?`}
      size="small"
      contentClassName="hide-original-buttons modal-heading"
    >
      <div className="archivar-servicio-modal-content">
        <p>Al archivar este servicio:</p>
        <ul>
          <li>Ya no estará disponible en el sitio de agendamiento.</li>
          <li>Los profesionales que lo tienen asignado dejarán de mostrarse si no tienen otros servicios activos.</li>
          <li>Los agendamientos previamente generados no se eliminarán.</li>
        </ul>
        
        <div className="checkbox-container">
          <CheckboxField
            label="Entiendo que este servicio y los profesionales que solo lo ofrecen dejarán de mostrarse en el portal."
            checked={confirmacionArchivado}
            onChange={(checked) => setConfirmacionArchivado(checked)}
            fillContainer={true}
          />
        </div>

        <div className="archivar-servicio-modal-buttons">
          <Button 
            variant="neutral" 
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmar}
            disabled={!confirmacionArchivado || loading}
          >
            {loading ? "Archivando..." : "Sí, archivar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ArchivarServicioModal;
