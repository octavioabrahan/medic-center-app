import React, { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/Inputs/InputField';
import TextAreaField from '../../../components/Inputs/TextAreaField';
import api from '../../../api';
import './CrearConvenio.css';

/**
 * Modal para crear una nueva empresa con convenio
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Determina si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función que se ejecuta al crear exitosamente
 */
const CrearConvenio = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    email: '',
    sitio_web: '',
    logo_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Verificar campos requeridos
      if (!formData.nombre) {
        throw new Error('El nombre de la empresa es obligatorio');
      }

      console.log('Enviando datos:', formData);
      
      // Enviar datos a la API
      const response = await api.post('/empresas', formData);
      console.log('Respuesta:', response.data);
      
      // Llamar a la función de éxito con los datos de la nueva empresa
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Cerrar modal
      onClose();
    } catch (err) {
      console.error('Error al crear empresa:', err);
      setError(err.response?.data?.message || err.message || 'Error al crear la empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      heading="Agregar empresa con convenio"
      size="medium"
    >
      <div className="crear-convenio-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <InputField
              label="Nombre de la empresa *"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingrese el nombre de la empresa"
              required
            />
          </div>

          <div className="form-group">
            <TextAreaField
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Ingrese una descripción del convenio"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <InputField
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ingrese la dirección"
              />
            </div>
            <div className="form-group">
              <InputField
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ingrese el teléfono"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <InputField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingrese el email de contacto"
                type="email"
              />
            </div>
            <div className="form-group">
              <InputField
                label="Sitio web"
                name="sitio_web"
                value={formData.sitio_web}
                onChange={handleChange}
                placeholder="Ingrese el sitio web"
              />
            </div>
          </div>

          <div className="form-group">
            <InputField
              label="URL del logo"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleChange}
              placeholder="Ingrese la URL del logo de la empresa"
            />
          </div>

          <div className="modal-actions">
            <Button
              variant="neutral"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar empresa'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CrearConvenio;
