import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import api from '../../../api';
import './CrearProfesionales.css';
import { 
  ExclamationCircleIcon, 
  CheckCircleIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  IdentificationIcon, 
  AcademicCapIcon,
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';

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

  // Render personalizado dentro del Modal
  const renderModalContent = () => (
    <div className="crear-profesionales-container">
      {error && (
        <div className="crear-profesionales-error">
          <ExclamationCircleIcon className="crear-profesionales-error-icon" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleCreateProfesional} className="crear-profesionales-form">
        <div className="crear-profesionales-form-group">
          <label htmlFor="cedula" className="crear-profesionales-label-required">
            <IdentificationIcon width={18} height={18} />
            Cédula
          </label>
          <input
            id="cedula"
            type="text"
            value={nuevoProfesional.cedula}
            onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, cedula: e.target.value })}
            className="crear-profesionales-input"
            disabled={loading}
            required
            placeholder="Ingrese el número de cédula"
          />
        </div>
        
        <div className="crear-profesionales-form-group">
          <label htmlFor="nombre" className="crear-profesionales-label-required">
            <UserIcon width={18} height={18} />
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            value={nuevoProfesional.nombre}
            onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, nombre: e.target.value })}
            className="crear-profesionales-input"
            disabled={loading}
            required
            placeholder="Ingrese el nombre"
          />
        </div>
        
        <div className="crear-profesionales-form-group">
          <label htmlFor="apellido" className="crear-profesionales-label-required">
            <UserIcon width={18} height={18} />
            Apellido
          </label>
          <input
            id="apellido"
            type="text"
            value={nuevoProfesional.apellido}
            onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, apellido: e.target.value })}
            className="crear-profesionales-input"
            disabled={loading}
            required
            placeholder="Ingrese el apellido"
          />
        </div>
        
        <div className="crear-profesionales-form-group">
          <label htmlFor="telefono">
            <PhoneIcon width={18} height={18} />
            Teléfono
          </label>
          <input
            id="telefono"
            type="text"
            value={nuevoProfesional.telefono}
            onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, telefono: e.target.value })}
            className="crear-profesionales-input"
            disabled={loading}
            placeholder="Ej: 099123456"
          />
        </div>
        
        <div className="crear-profesionales-form-group">
          <label htmlFor="correo">
            <EnvelopeIcon width={18} height={18} />
            Correo Electrónico
          </label>
          <input
            id="correo"
            type="email"
            value={nuevoProfesional.correo}
            onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, correo: e.target.value })}
            className="crear-profesionales-input"
            disabled={loading}
            placeholder="nombre@ejemplo.com"
          />
        </div>
        
        <div className="crear-profesionales-form-group">
          <label htmlFor="especialidad" className="crear-profesionales-label-required">
            <AcademicCapIcon width={18} height={18} />
            Especialidad
          </label>
          <select
            id="especialidad"
            value={nuevoProfesional.especialidad_id}
            onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, especialidad_id: e.target.value })}
            className="crear-profesionales-select"
            disabled={loading}
            required
          >
            <option value="">Seleccione una especialidad</option>
            {especialidades.map(esp => (
              <option key={esp.especialidad_id} value={esp.especialidad_id}>
                {esp.nombre}
              </option>
            ))}
          </select>
        </div>
        
        {servicios.length > 0 && (
          <div className="crear-profesionales-servicios-container">
            <div className="crear-profesionales-servicios-header">
              <ClipboardDocumentListIcon className="crear-profesionales-servicios-icon" />
              Servicios disponibles
            </div>
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

        <div className="crear-profesionales-form-actions">
          <button 
            type="button" 
            className="crear-profesionales-btn-cancelar" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="crear-profesionales-btn-guardar"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      heading="Agregar Profesional"
      bodyText="Complete el formulario con los datos del nuevo profesional médico."
      size="large"
      noPadding={false}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default CrearProfesionales;
