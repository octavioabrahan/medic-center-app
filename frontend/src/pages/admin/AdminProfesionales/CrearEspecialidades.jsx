import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
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

  // Custom content for the modal body
  const renderModalContent = () => (
    <>
      {!showCreateNew ? (
        <>
          <div className="especialidad-item">
            <InputField
              label="Nombre de la especialidad"
              disabled={true}
              value="Cardiología"
            />
          </div>
          
          <Button
            variant="neutral"
            onClick={handleAddNewSpecialty}
            className="crear-especialidad-btn"
          >
            <PlusIcon width={20} height={20} />
            <span>Crear nueva especialidad</span>
          </Button>
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
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      heading="Especialidades"
      bodyText="Cada profesional debe tener asignada una especialidad para poder mostrarse en el sitio de agendamiento."
      contentClassName="crear-especialidades-content"
      size="medium"
      primaryButtonText={showCreateNew ? "Guardar" : null}
      onPrimaryClick={showCreateNew ? handleCreateEspecialidad : null}
      primaryButtonDisabled={isSubmitting || (showCreateNew && !nuevaEspecialidad.nombre.trim())}
      secondaryButtonText="Cancelar"
      onSecondaryClick={onClose}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default CrearEspecialidades;
