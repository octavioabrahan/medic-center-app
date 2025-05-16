import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import InputField from '../../../components/Inputs/InputField';
import { Button } from '../../../components/Button/Button';
import Text from '../../../components/Text/Text';
import { PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import './CrearEspecialidades.css';

/**
 * CrearEspecialidades component
 * Modal component for creating new specialties following the design system
 * exactly as shown in the mockup image
 */
const CrearEspecialidades = ({ isOpen, onClose, onSpecialtyCreated }) => {
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({ nombre: 'Cardiología' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNuevaEspecialidad({ nombre: 'Cardiología' });
      setError(null);
      setIsSubmitting(false);
      setShowCreateNew(false);
    }
  }, [isOpen]);

  const handleAddNewSpecialty = () => {
    setShowCreateNew(true);
    setNuevaEspecialidad({ nombre: '' });
    setError(null);
  };

  // Handle form submission
  const handleCreateEspecialidad = async () => {
    if (!nuevaEspecialidad.nombre.trim()) {
      setError("El nombre de la especialidad es obligatorio");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await axios.post('/api/especialidades', nuevaEspecialidad);
      const res = await axios.get('/api/especialidades');
      
      // Call the callback to update specialties in parent component
      if (onSpecialtyCreated) {
        onSpecialtyCreated(res.data);
      }
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error("Error al crear especialidad:", err);
      setError("Error al crear la especialidad");
    } finally {
      setIsSubmitting(false);
    }
  };

  // No necesitamos esta función ya que ahora renderizamos directamente en el return

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="custom-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close-btn" onClick={onClose}>
          <XMarkIcon width={20} height={20} />
        </button>
        
        {/* Header section with title and description side by side */}
        <div className="modal-header">
          <h2 className="modal-title">Especialidades</h2>
          <p className="modal-description">
            Cada profesional debe tener asignada una especialidad para poder mostrarse en el sitio de agendamiento.
          </p>
        </div>
        
        {/* Content area */}
        <div className="modal-content">
          {!showCreateNew ? (
            <>
              <div className="especialidad-input">
                <InputField
                  label="Nombre de la especialidad"
                  disabled={true}
                  value="Cardiología"
                />
              </div>
              
              <div className="modal-actions">
                <Button
                  variant="neutral"
                  onClick={handleAddNewSpecialty}
                  className="crear-especialidad-btn"
                >
                  <PlusIcon width={20} height={20} />
                  <span>Crear nueva especialidad</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="especialidad-form">
              <InputField
                label="Nombre de la especialidad"
                value={nuevaEspecialidad.nombre}
                onChange={(value) => setNuevaEspecialidad({ ...nuevaEspecialidad, nombre: value })}
                placeholder="Ingrese el nombre de la especialidad"
                error={!!error}
                disabled={isSubmitting}
                autoFocus
              />
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer with buttons */}
        <div className="modal-footer">
          <Button
            variant="neutral"
            onClick={onClose}
          >
            Cancelar
          </Button>
          
          {showCreateNew && (
            <Button
              variant="primary"
              onClick={handleCreateEspecialidad}
              disabled={isSubmitting || !nuevaEspecialidad.nombre.trim()}
            >
              Guardar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrearEspecialidades;
