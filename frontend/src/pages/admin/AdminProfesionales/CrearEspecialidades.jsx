import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button/Button';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import './CrearEspecialidades.css';

/**
 * CrearEspecialidades component
 * Modal component for creating new specialties with improved design
 */
const CrearEspecialidades = ({ isOpen, onClose, onSpecialtyCreated }) => {
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({ nombre: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNuevaEspecialidad({ nombre: '' });
      setError(null);
      setIsSubmitting(false);
      setSuccess(false);
    }
  }, [isOpen]);

  // Manejar ESC para cerrar el modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (isOpen && event.keyCode === 27) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Handle form submission
  const handleCreateEspecialidad = async (e) => {
    e.preventDefault();
    if (!nuevaEspecialidad.nombre.trim()) {
      setError("El nombre de la especialidad es obligatorio");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await axios.post('/api/especialidades', nuevaEspecialidad);
      const res = await axios.get('/api/especialidades');
      setNuevaEspecialidad({ nombre: '' });
      setSuccess(true);
      
      // Esperar un momento para mostrar el mensaje de éxito antes de cerrar
      setTimeout(() => {
        // Call the callback to update specialties in parent component
        if (onSpecialtyCreated) {
          onSpecialtyCreated(res.data);
        }
        
        // Close the modal
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error al crear especialidad:", err);
      setError(err.response?.data?.error || "Error al crear la especialidad");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="crear-especialidades__modal-overlay" onClick={onClose}>
      <div className="crear-especialidades__modal-content" onClick={e => e.stopPropagation()}>
        <div className="crear-especialidades__modal-header">
          <h2>Crear especialidad</h2>
          <button 
            className="crear-especialidades__close-btn" 
            onClick={onClose}
            aria-label="Cerrar"
          >
            <XMarkIcon width={24} height={24} />
          </button>
        </div>
        
        <div className="crear-especialidades__modal-body">
          {error && (
            <div className="crear-especialidades__error">
              <ExclamationCircleIcon width={20} height={20} />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="crear-especialidades__success">
              <CheckCircleIcon width={20} height={20} />
              <span>¡Especialidad creada con éxito!</span>
            </div>
          )}
          
          <form onSubmit={handleCreateEspecialidad}>
            <div className="crear-especialidades__form-group">
              <label htmlFor="nombre">Nombre de la especialidad</label>
              <input
                id="nombre"
                type="text"
                value={nuevaEspecialidad.nombre}
                onChange={(e) => setNuevaEspecialidad({ ...nuevaEspecialidad, nombre: e.target.value })}
                className="crear-especialidades__input"
                placeholder="Ingrese el nombre de la especialidad"
                required
                autoFocus
                disabled={isSubmitting}
              />
            </div>
          </form>
        </div>
        
        <div className="crear-especialidades__modal-footer">
          <Button 
            variant="neutral" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateEspecialidad}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CrearEspecialidades;
