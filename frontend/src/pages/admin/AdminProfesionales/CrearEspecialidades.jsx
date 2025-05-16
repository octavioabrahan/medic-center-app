import React, { useState } from 'react';
import Button from '../../../components/Button/Button';
import axios from 'axios';
import './AdminProfesionales.css';

/**
 * CrearEspecialidades component
 * Modal component for creating new specialties
 */
const CrearEspecialidades = ({ isOpen, onClose, onSpecialtyCreated }) => {
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({ nombre: '' });
  const [error, setError] = useState(null);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setNuevaEspecialidad({ nombre: '' });
      setError(null);
    }
  }, [isOpen]);

  // Handle form submission
  const handleCreateEspecialidad = async (e) => {
    e.preventDefault();
    if (!nuevaEspecialidad.nombre.trim()) {
      setError("El nombre de la especialidad es obligatorio");
      return;
    }

    try {
      await axios.post('/api/especialidades', nuevaEspecialidad);
      const res = await axios.get('/api/especialidades');
      setNuevaEspecialidad({ nombre: '' });
      
      // Call the callback to update specialties in parent component
      if (onSpecialtyCreated) {
        onSpecialtyCreated(res.data);
      }
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error("Error al crear especialidad:", err);
      setError("Error al crear la especialidad");
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="admin-profesionales__modal-overlay">
      <div className="admin-profesionales__modal-content">
        <div className="admin-profesionales__modal-header">
          <h2>Crear especialidad</h2>
          <button className="admin-profesionales__close-btn" onClick={onClose}>×</button>
        </div>
        <div className="admin-profesionales__modal-body">
          {error && <div className="admin-profesionales__error">{error}</div>}
          <form onSubmit={handleCreateEspecialidad}>
            <div className="admin-profesionales__form-group">
              <label htmlFor="nombre">Nombre de la especialidad</label>
              <input
                id="nombre"
                type="text"
                value={nuevaEspecialidad.nombre}
                onChange={(e) => setNuevaEspecialidad({ ...nuevaEspecialidad, nombre: e.target.value })}
                className="admin-profesionales__input"
                required
              />
            </div>
          </form>
        </div>
        <div className="admin-profesionales__modal-footer">
          <Button variant="neutral" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateEspecialidad}>
            Crear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CrearEspecialidades;
