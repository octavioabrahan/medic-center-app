import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button/Button';
import Modal from '../../../components/Modal/Modal';
import api from '../../../api';
import './CrearProfesionales.css';

/**
 * CrearProfesionales component for adding new professionals in the admin dashboard
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls if the modal is visible
 * @param {Function} props.onClose - Function to call when close button is clicked
 * @param {Array} props.especialidades - List of available specialties
 * @param {Function} props.onProfesionalCreated - Function to call when professional is created
 * @param {boolean} props.showArchived - Whether archived professionals are shown
 */
const CrearProfesionales = ({ isOpen, onClose, especialidades = [], onProfesionalCreated, showArchived = false }) => {
  const [nuevoProfesional, setNuevoProfesional] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    especialidad_id: '',
  });
  
  // Estado para servicios y selección
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar servicios cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarServicios();
      // Resetear formulario
      resetForm();
    }
  }, [isOpen]);

  // Función para cargar servicios
  const cargarServicios = async () => {
    setLoading(true);
    try {
      const res = await api.get('/servicios');
      setServicios(res.data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      setError("Error al cargar los servicios disponibles");
    } finally {
      setLoading(false);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setNuevoProfesional({
      cedula: '',
      nombre: '',
      apellido: '',
      telefono: '',
      correo: '',
      especialidad_id: '',
    });
    setServiciosSeleccionados([]);
    setError(null);
  };

  // Función para crear nuevo profesional
  const handleCreateProfesional = async (e) => {
    e?.preventDefault();
    
    if (!nuevoProfesional.cedula || 
        !nuevoProfesional.nombre || 
        !nuevoProfesional.apellido || 
        !nuevoProfesional.especialidad_id) {
      setError("Todos los campos obligatorios deben ser completados");
      return;
    }

    setLoading(true);
    try {
      // 1. Crear profesional
      const res = await api.post('/profesionales', nuevoProfesional);
      const profesionalId = res.data.profesional_id;
      
      // 2. Asignar servicios si existen
      if (serviciosSeleccionados.length > 0) {
        await api.post('/profesionales/asignar-servicios', {
          profesional_id: profesionalId,
          servicios: serviciosSeleccionados
        });
      }
      
      // Actualizar lista de profesionales
      const updatedProfesionales = await api.get('/profesionales', { 
        params: { soloActivos: !showArchived } 
      });
      
      // Notificar al componente padre
      onProfesionalCreated && onProfesionalCreated(updatedProfesionales.data);
      
      // Cerrar modal y resetear formulario
      handleClose();
    } catch (err) {
      console.error("Error al crear profesional:", err);
      setError(err.response?.data?.error || "Error al crear profesional");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      heading="Agregar Profesional"
      bodyText="Ingresa los datos del nuevo profesional."
      primaryButtonText="Guardar"
      onPrimaryClick={handleCreateProfesional}
      secondaryButtonText="Cancelar"
      onSecondaryClick={handleClose}
      size="large"
    >
      <div className="crear-profesionales-container">
        {error && <div className="crear-profesionales-error">{error}</div>}
        
        <div className="crear-profesionales-form">
          <div className="crear-profesionales-form-group">
            <label htmlFor="cedula">Cédula *</label>
            <input
              id="cedula"
              type="text"
              value={nuevoProfesional.cedula}
              onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, cedula: e.target.value })}
              className="crear-profesionales-input"
              disabled={loading}
              required
            />
          </div>
          
          <div className="crear-profesionales-form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              id="nombre"
              type="text"
              value={nuevoProfesional.nombre}
              onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, nombre: e.target.value })}
              className="crear-profesionales-input"
              disabled={loading}
              required
            />
          </div>
          
          <div className="crear-profesionales-form-group">
            <label htmlFor="apellido">Apellido *</label>
            <input
              id="apellido"
              type="text"
              value={nuevoProfesional.apellido}
              onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, apellido: e.target.value })}
              className="crear-profesionales-input"
              disabled={loading}
              required
            />
          </div>
          
          <div className="crear-profesionales-form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              type="text"
              value={nuevoProfesional.telefono}
              onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, telefono: e.target.value })}
              className="crear-profesionales-input"
              disabled={loading}
            />
          </div>
          
          <div className="crear-profesionales-form-group">
            <label htmlFor="correo">Correo Electrónico</label>
            <input
              id="correo"
              type="email"
              value={nuevoProfesional.correo}
              onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, correo: e.target.value })}
              className="crear-profesionales-input"
              disabled={loading}
            />
          </div>
          
          <div className="crear-profesionales-form-group">
            <label htmlFor="especialidad">Especialidad *</label>
            <select
              id="especialidad"
              value={nuevoProfesional.especialidad_id}
              onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, especialidad_id: e.target.value })}
              className="crear-profesionales-select"
              disabled={loading}
              required
            >
              <option value="">Selecciona una especialidad</option>
              {especialidades.map(esp => (
                <option key={esp.especialidad_id} value={esp.especialidad_id}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </div>
          
          {servicios.length > 0 && (
            <div className="crear-profesionales-form-group">
              <label>Servicios</label>
              <div className="crear-profesionales-servicios-list">
                {servicios.map(servicio => (
                  <div key={servicio.id_servicio} className="crear-profesionales-servicio-item">
                    <input
                      type="checkbox"
                      id={`servicio-${servicio.id_servicio}`}
                      checked={serviciosSeleccionados.includes(servicio.id_servicio)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setServiciosSeleccionados([...serviciosSeleccionados, servicio.id_servicio]);
                        } else {
                          setServiciosSeleccionados(serviciosSeleccionados.filter(id => id !== servicio.id_servicio));
                        }
                      }}
                      disabled={loading}
                    />
                    <label htmlFor={`servicio-${servicio.id_servicio}`}>{servicio.nombre_servicio}</label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CrearProfesionales;
