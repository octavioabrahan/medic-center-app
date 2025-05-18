import React, { useState, useEffect } from 'react';
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
  
  // Verificar que tengamos los datos del servicio al cargar el componente
  useEffect(() => {
    if (isOpen && !servicio) {
      console.error('Error: Modal de archivar abierto sin datos de servicio');
    } else if (isOpen) {
      console.log('Modal abierto con servicio:', servicio);
    }
  }, [isOpen, servicio]);

  const handleConfirmar = async () => {
    // Siempre registrar en consola la intención de archivar para depuración
    console.log('Botón "Sí, archivar" presionado', {
      confirmacionArchivado,
      hasOnConfirmArchive: !!onConfirmArchive,
      servicio,
      servicioId: servicio?.id_servicio || servicio?.servicio_id || 'no-id'
    });
    
    if (!servicio) {
      console.error('Error: No hay datos del servicio para archivar');
      alert('Error: No se pudo obtener la información del servicio para archivar.');
      return;
    }
    
    if (confirmacionArchivado && onConfirmArchive) {
      try {
        await onConfirmArchive(servicio);
        console.log('Archivo completado con éxito, cerrando modal');
        onClose();
      } catch (error) {
        console.error('Error al confirmar archivar servicio:', error);
        setTimeout(() => onClose(), 2000);
      }
    } else {
      console.warn('No se puede archivar: checkbox no marcado o falta función handler', { 
        confirmacionArchivado, 
        hasOnConfirmArchive: !!onConfirmArchive, 
        servicioPresente: !!servicio
      });
      
      if (!onConfirmArchive) {
        alert('Error interno: Falta la función para procesar el archivado.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      heading={`¿Quieres archivar ${servicio?.nombre || 'este servicio'}?`}
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
        
        <CheckboxField
          label="Entiendo que este servicio y los profesionales que solo lo ofrecen dejarán de mostrarse en el portal."
          checked={confirmacionArchivado}
          onChange={(checked) => setConfirmacionArchivado(checked)}
          fillContainer={true}
        />

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
