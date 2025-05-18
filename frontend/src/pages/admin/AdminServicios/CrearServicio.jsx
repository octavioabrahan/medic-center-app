import React, { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import TextField from '../../../components/Inputs/TextField';
import api from '../../../api';
import './CrearServicio.css';

const CrearServicio = ({ isOpen, onClose, onServicioCreated, showArchived }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setNombre('');
    setDescripcion('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!nombre.trim()) {
      setError('El nombre del servicio es obligatorio');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/servicios', {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null
      });
      
      // Recargar la lista de servicios
      const serviciosRes = await api.get('/servicios', { params: { soloActivos: !showArchived } });
      onServicioCreated(serviciosRes.data);
      
      handleClose();
    } catch (err) {
      console.error('Error al crear servicio:', err);
      setError('Error al crear el servicio. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear servicio"
      className="crear-servicio-modal"
    >
      <form onSubmit={handleSubmit} className="crear-servicio-form">
        {error && (
          <div className="crear-servicio__error-message">
            {error}
          </div>
        )}
        
        <div className="crear-servicio__field">
          <TextField
            label="Nombre del servicio"
            value={nombre}
            onChange={setNombre}
            placeholder="Ingrese el nombre del servicio"
            required
          />
        </div>
        
        <div className="crear-servicio__field">
          <TextField
            label="Descripción (opcional)"
            value={descripcion}
            onChange={setDescripcion}
            placeholder="Ingrese una descripción para el servicio"
            multiline
            rows={3}
          />
        </div>
        
        <div className="crear-servicio__actions">
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
            Crear servicio
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CrearServicio;
