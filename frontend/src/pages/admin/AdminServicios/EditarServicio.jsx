import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/Inputs/InputField';
import TextAreaField from '../../../components/Inputs/TextAreaField';
import api from '../../../api';
import './EditarServicio.css';

const EditarServicio = ({ isOpen, onClose, servicio, onServicioUpdated, onConfirmArchive }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Actualizar valores cuando cambia el servicio seleccionado
  useEffect(() => {
    if (servicio && isOpen) {
      // Handle both property name formats
      setNombre(servicio.nombre || servicio.nombre_servicio || '');
      setDescripcion(servicio.descripcion || '');
      console.log("Editing service:", servicio); // Debug to see structure
    }
  }, [servicio, isOpen]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleArchive = () => {
    onConfirmArchive(servicio);
    handleClose();
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
        // Keep existing values if they exist
        price_usd: servicio.price_usd || 0,
        is_recommended: servicio.is_recommended || false
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar servicio"
      className="editar-servicio-modal"
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
        
        <div className="editar-servicio__actions-row">
          <Button
            variant="danger"
            onClick={handleArchive}
            disabled={loading}
          >
            Archivar servicio
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
  );
};

export default EditarServicio;
