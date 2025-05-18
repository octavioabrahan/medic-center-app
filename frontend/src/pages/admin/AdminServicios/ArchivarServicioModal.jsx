import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import './ArchivarServicioModal.css';

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
  
  // Verificar que tengamos los datos del servicio al cargar el componente
  useEffect(() => {
    if (isOpen && !servicio) {
      console.error('Error: Modal de archivar abierto sin datos de servicio');
    } else if (isOpen) {
      console.log('Modal abierto con servicio:', servicio);
    }
    
    // Reset checkbox state when modal opens/closes
    setConfirmacionArchivado(false);
  }, [isOpen, servicio]);

  const handleConfirmar = async () => {
    if (!servicio) {
      console.error('Error: No hay datos del servicio para archivar');
      alert('Error: No se pudo obtener la información del servicio para archivar.');
      return;
    }
    
    if (confirmacionArchivado && onConfirmArchive) {
      try {
        await onConfirmArchive(servicio);
        onClose();
      } catch (error) {
        console.error('Error al confirmar archivar servicio:', error);
        setTimeout(() => onClose(), 2000);
      }
    }
  };

  const nombreServicio = servicio ? (servicio.nombre || servicio.nombre_servicio || 'este servicio') : 'este servicio';

  const modalContent = (
    <div className="archivar-content">
      <p>Al archivar este servicio:</p>
      <ul>
        <li>Ya no estará disponible en el sitio de agendamiento.</li>
        <li>Los profesionales que lo tienen asignado dejarán de mostrarse si no tienen otros servicios activos.</li>
        <li>Los agendamientos previamente generados no se eliminarán.</li>
      </ul>
      
      <div className="checkbox-wrapper">
        <CheckboxField
          label="Entiendo que este servicio y los profesionales que solo lo ofrecen dejarán de mostrarse en el portal."
          checked={confirmacionArchivado}
          onChange={(checked) => setConfirmacionArchivado(checked)}
          fillContainer={true}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* We need to create our own buttons to show danger variant */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        heading={`¿Quieres archivar ${nombreServicio}?`}
        size="small"
        variant="default"
        contentClassName="hide-original-buttons"
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-600)'}}>
          {modalContent}
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 'var(--sds-space-400)'}}>
            <Button variant="neutral" onClick={onClose}>
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
    </>
  );
};

export default ArchivarServicioModal;
