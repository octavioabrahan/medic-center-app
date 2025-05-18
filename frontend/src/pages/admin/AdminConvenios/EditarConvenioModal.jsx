import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/Inputs/InputField';
import TextAreaField from '../../../components/Inputs/TextAreaField';
import api from '../../../api';
import './EditarConvenioModal.css';

/**
 * Modal para editar una empresa con convenio existente
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Determina si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Object} props.convenio - Datos de la empresa a editar
 * @param {Function} props.onSuccess - Función que se ejecuta al editar exitosamente
 */
const EditarConvenioModal = ({ isOpen, onClose, convenio, onSuccess }) => {
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

  // Cargar datos del convenio cuando el modal se abre
  useEffect(() => {
    if (isOpen && convenio) {
      setFormData({
        nombre: convenio.nombre || '',
        descripcion: convenio.descripcion || '',
        direccion: convenio.direccion || '',
        telefono: convenio.telefono || '',
        email: convenio.email || '',
        sitio_web: convenio.sitio_web || '',
        logo_url: convenio.logo_url || ''
      });
    }
  }, [isOpen, convenio]);

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

      if (!convenio || !convenio.id_empresa) {
        throw new Error('No se encontró el ID de la empresa para actualizar');
      }

      console.log('Enviando datos actualizados:', formData);
      
      // Enviar datos a la API
      const response = await api.put(`/empresas/${convenio.id_empresa}`, formData);
      console.log('Respuesta:', response.data);
      
      // Llamar a la función de éxito con los datos actualizados
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Cerrar modal
      onClose();
    } catch (err) {
      console.error('Error al actualizar empresa:', err);
      setError(err.response?.data?.message || err.message || 'Error al actualizar la empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      heading={`Editar ${convenio?.nombre || 'empresa con convenio'}`}
      size="medium"
    >
      <div className="editar-convenio-content">
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
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditarConvenioModal;
