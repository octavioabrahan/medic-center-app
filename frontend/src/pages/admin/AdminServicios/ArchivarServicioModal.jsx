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
      console.log('Ejecutando confirmación de archivo de servicio:', servicio);
      try {
        // Debug la función que recibimos
        console.log('Función onConfirmArchive:', onConfirmArchive.toString().slice(0, 100) + '...');
        
        // Asegurarnos de pasar el servicio completo con todos sus datos
        await onConfirmArchive(servicio);
        
        // Cerrar el modal después de confirmar exitosamente
        console.log('Archivo completado con éxito, cerrando modal');
        onClose();
      } catch (error) {
        console.error('Error al confirmar archivar servicio:', error);
        // En caso de error, igual cerramos el modal después de mostrar el error
        // para evitar que el usuario se quede atrapado
        setTimeout(() => onClose(), 2000);
      }
    } else {
      console.warn('No se puede archivar: checkbox no marcado, falta función handler, o falta servicio', { 
        confirmacionArchivado, 
        hasOnConfirmArchive: !!onConfirmArchive, 
        servicioPresente: !!servicio,
        servicioId: servicio?.id_servicio || servicio?.servicio_id || 'no-id'
      });
      
      // Si falta el servicio, podemos mostrar un mensaje más específico
      if (!servicio) {
        alert('Error: No se pudo obtener la información del servicio para archivar.');
      } else if (!onConfirmArchive) {
        alert('Error interno: Falta la función para procesar el archivado.');
      }
    }
  };

  // Obtener el nombre del servicio para mostrar en el título
  const nombreServicio = servicio ? (servicio.nombre || servicio.nombre_servicio || 'este servicio') : 'este servicio';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      heading={`¿Quieres archivar ${nombreServicio}?`}
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
            onClick={() => {
              // Log every time button is clicked
              console.log("→→→ BOTÓN ARCHIVAR PRESIONADO");
              
              // Just call the handler directly - the fallback was causing issues
              if (confirmacionArchivado) {
                handleConfirmar();
              } else {
                console.log("Checkbox no marcado - no se puede archivar");
              }
            }}
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
