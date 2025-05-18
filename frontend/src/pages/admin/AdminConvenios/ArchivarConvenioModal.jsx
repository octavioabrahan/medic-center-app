import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import './ArchivarConvenioModal.css';

/**
 * Modal de confirmación para archivar una empresa con convenio
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Controla si el modal está visible
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Object} props.convenio - Datos de la empresa con convenio a archivar
 * @param {Function} props.onConfirmArchive - Función a llamar cuando se confirma el archivado
 * @param {boolean} props.loading - Indica si hay una operación en proceso
 */
const ArchivarConvenioModal = ({ isOpen, onClose, convenio, onConfirmArchive, loading }) => {
  const [confirmacionArchivado, setConfirmacionArchivado] = useState(false);
  
  // Verificar que tengamos los datos del convenio al cargar el componente
  useEffect(() => {
    if (isOpen && !convenio) {
      console.error('Error: Modal de archivar abierto sin datos de empresa');
    } else if (isOpen) {
      console.log('Modal abierto con empresa:', convenio);
    }
  }, [isOpen, convenio]);

  const handleConfirmar = async () => {
    // Siempre registrar en consola la intención de archivar para depuración
    console.log('Botón "Sí, archivar" presionado', {
      confirmacionArchivado,
      hasOnConfirmArchive: !!onConfirmArchive,
      convenio,
      convenioId: convenio?.id_empresa || 'no-id'
    });
    
    if (!convenio) {
      console.error('Error: No hay datos de la empresa para archivar');
      alert('Error: No se pudo obtener la información de la empresa para archivar.');
      return;
    }
    
    if (confirmacionArchivado && onConfirmArchive) {
      console.log('Ejecutando confirmación de archivo de empresa:', convenio);
      try {
        // Debug la función que recibimos
        console.log('Función onConfirmArchive:', onConfirmArchive.toString().slice(0, 100) + '...');
        
        // Asegurarnos de pasar el convenio completo con todos sus datos
        await onConfirmArchive(convenio);
        
        // Cerrar el modal después de confirmar exitosamente
        console.log('Archivo completado con éxito, cerrando modal');
        onClose();
      } catch (error) {
        console.error('Error al confirmar archivar empresa:', error);
        // En caso de error, igual cerramos el modal después de mostrar el error
        // para evitar que el usuario se quede atrapado
        setTimeout(() => onClose(), 2000);
      }
    } else {
      console.warn('No se puede archivar: checkbox no marcado, falta función handler, o falta convenio', { 
        confirmacionArchivado, 
        hasOnConfirmArchive: !!onConfirmArchive, 
        convenioPresente: !!convenio,
        convenioId: convenio?.id_empresa || 'no-id'
      });
      
      // Si falta el convenio, podemos mostrar un mensaje más específico
      if (!convenio) {
        alert('Error: No se pudo obtener la información de la empresa para archivar.');
      } else if (!onConfirmArchive) {
        alert('Error interno: Falta la función para procesar el archivado.');
      }
    }
  };

  // Obtener el nombre del convenio para mostrar en el título
  const nombreConvenio = convenio ? (convenio.nombre || 'esta empresa') : 'esta empresa';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      heading={`¿Quieres archivar ${nombreConvenio}?`}
      size="small"
      contentClassName="hide-original-buttons modal-heading"
    >
      <div className="archivar-convenio-modal-content">
        <p>Al archivar esta empresa con convenio:</p>
        <ul>
          <li>Ya no estará disponible en el sitio para nuevos pacientes.</li>
          <li>Los agendamientos previamente generados con esta empresa no se eliminarán.</li>
          <li>Podrás desactivar el archivado en cualquier momento si lo necesitas.</li>
        </ul>
        
        <div className="checkbox-container">
          <CheckboxField
            label="Entiendo que esta empresa con convenio dejará de mostrarse en el portal."
            checked={confirmacionArchivado}
            onChange={(checked) => setConfirmacionArchivado(checked)}
            fillContainer={true}
          />
        </div>

        <div className="archivar-convenio-modal-buttons">
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

export default ArchivarConvenioModal;
