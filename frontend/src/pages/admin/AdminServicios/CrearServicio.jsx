import React, { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/Inputs/InputField';
import TextAreaField from '../../../components/Inputs/TextAreaField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import api from '../../../api';
import './CrearServicio.css';

const CrearServicio = ({ isOpen, onClose, onServicioCreated, showArchived }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [priceUsd, setPriceUsd] = useState(0);
  const [isRecommended, setIsRecommended] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setNombre('');
    setDescripcion('');
    setPriceUsd(0);
    setIsRecommended(false);
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
      await api.post('/servicios', {
        // Use property name that matches the old code's backend expectations
        nombre_servicio: nombre.trim(),
        descripcion: descripcion.trim() || null,
        price_usd: parseFloat(priceUsd) || 0,
        is_recommended: isRecommended,
        is_active: true // Set as active by default
      });
      
      // Recargar la lista de servicios - no params like in old code
      const serviciosRes = await api.get('/servicios');
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
          <InputField
            label="Nombre del servicio"
            value={nombre}
            onChange={setNombre}
            placeholder="Ingrese el nombre del servicio"
            fillContainer={true}
          />
        </div>
        
        <div className="crear-servicio__field">
          <TextAreaField
            label="Descripción (opcional)"
            value={descripcion}
            onChange={setDescripcion}
            placeholder="Ingrese una descripción para el servicio"
            rows={3}
          />
        </div>
        
        <div className="crear-servicio__field">
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
        
        <div className="crear-servicio__field">
          <CheckboxField
            label="Es recomendado"
            checked={isRecommended}
            onChange={setIsRecommended}
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
