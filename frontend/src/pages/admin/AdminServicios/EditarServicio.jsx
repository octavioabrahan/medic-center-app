import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/Inputs/InputField';
import TextAreaField from '../../../components/Inputs/TextAreaField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import { ArchiveBoxIcon } from '@heroicons/react/24/solid';
import api from '../../../api';
import ArchivarServicioModal from './ArchivarServicioModal';
import './EditarServicio.css';
import './modal-fix.css';

const EditarServicio = ({ isOpen, onClose, servicio, onServicioUpdated, onConfirmArchive }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [priceUsd, setPriceUsd] = useState(0);
  const [isRecommended, setIsRecommended] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showArchivarModal, setShowArchivarModal] = useState(false);

  // Actualizar valores cuando cambia el servicio seleccionado
  useEffect(() => {
    if (servicio && isOpen) {
      // Handle both property name formats
      setNombre(servicio.nombre || servicio.nombre_servicio || '');
      setDescripcion(servicio.descripcion || '');
      setPriceUsd(servicio.price_usd || 0);
      setIsRecommended(servicio.is_recommended || false);
      console.log("Editing service:", servicio); // Debug to see structure
    }
  }, [servicio, isOpen]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleArchive = () => {
    console.log("Servicio a archivar desde EditarServicio:", servicio);
    setShowArchivarModal(true);
  };
  
  const confirmarArchivar = async (servicioParaArchivar) => {
    try {
      console.log('Confirmando archivar servicio en EditarServicio:', servicioParaArchivar);
      
      // Si no se recibe un servicio válido en el parámetro, usar el del estado
      const servicioAArchivar = servicioParaArchivar || servicio;
      
      if (!servicioAArchivar) {
        throw new Error('No hay servicio para archivar');
      }
      
      // Asegurarse de verificar que exista un ID válido
      const servicioId = servicioAArchivar?.id_servicio || servicioAArchivar?.servicio_id;
      if (!servicioId) {
        console.error('Error: No se puede archivar, ID de servicio no válido', servicioAArchivar);
        throw new Error('Error: ID de servicio no válido');
      }
      
      console.log(`Confirmando archivar servicio con ID: ${servicioId}`);
      
      const result = await onConfirmArchive(servicioAArchivar);
      
      // Asegurarse de cerrar los modales incluso si no hay un resultado explícito
      setShowArchivarModal(false);
      handleClose();
      
      return result;
    } catch (err) {
      console.error("Error al archivar servicio:", err);
      setError("Error al archivar el servicio. Por favor intente nuevamente.");
      
      // En caso de error, cerramos los modales después de un tiempo para no dejar al usuario atrapado
      setTimeout(() => {
        setShowArchivarModal(false);
      }, 2000);
      
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!nombre.trim()) {
      setError('El nombre del servicio es obligatorio');
      return;
    }
    
    // Check for servicio_id or id_servicio (from old code)
    const servicioId = servicio?.servicio_id || servicio?.id_servicio;
    if (!servicio || !servicioId) {
      setError('Error: Información del servicio no disponible');
      return;
    }
    
    setLoading(true);
    try {
      // Use the property name and format from old code
      await api.put(`/servicios/${servicioId}`, {
        nombre_servicio: nombre.trim(),
        descripcion: descripcion.trim() || null,
        price_usd: parseFloat(priceUsd) || 0,
        is_recommended: isRecommended
      });
      
      // Actualizar lista en el componente padre
      onServicioUpdated();
      handleClose();
    } catch (err) {
      console.error('Error al actualizar servicio:', err);
      setError('Error al actualizar el servicio. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar servicio"
      className="editar-servicio-modal modal-heading"
    >
      <form onSubmit={handleSubmit} className="editar-servicio-form">
        {error && (
          <div className="editar-servicio__error-message">
            {error}
          </div>
        )}
        
        <div className="editar-servicio__field">
          <InputField
            label="Nombre del servicio"
            value={nombre}
            onChange={setNombre}
            placeholder="Ingrese el nombre del servicio"
            fillContainer={true}
          />
        </div>
        
        <div className="editar-servicio__field">
          <TextAreaField
            label="Descripción (opcional)"
            value={descripcion}
            onChange={setDescripcion}
            placeholder="Ingrese una descripción para el servicio"
            rows={3}
          />
        </div>
        
        <div className="editar-servicio__field">
          <InputField
            label="Precio (USD)"
            value={priceUsd.toString()}
            onChange={(value) => setPriceUsd(value)}
            placeholder="Ingrese el precio en USD"
            type="number"
            min="0"
            step="0.01"
            fillContainer={true}
          />
        </div>
        
        <div className="editar-servicio__field">
          <CheckboxField
            label="Es recomendado"
            checked={isRecommended}
            onChange={setIsRecommended}
          />
        </div>
        
        <div className="editar-servicio__actions-row">
          <Button
            variant="danger"
            onClick={handleArchive}
            disabled={loading}
          >
            <ArchiveBoxIcon className="btn__icon" />
            <span>Archivar servicio</span>
          </Button>
          
          <div className="editar-servicio__primary-actions">
            <Button
              variant="neutral"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              type="submit"
              loading={loading}
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      </form>
    </Modal>
    
    {/* Modal de confirmación para archivar servicio */}
    <ArchivarServicioModal
      isOpen={showArchivarModal}
      onClose={() => setShowArchivarModal(false)}
      servicio={servicio}
      onConfirmArchive={confirmarArchivar}
      loading={loading}
    />
    </>
  );
};

export default EditarServicio;
