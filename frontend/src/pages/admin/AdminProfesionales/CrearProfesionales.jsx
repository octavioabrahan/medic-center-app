import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import api from '../../../api';
import './CrearProfesionales.css';
import { XMarkIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/solid';

/**
 * CrearProfesionales component for adding new professionals in the admin dashboard
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls if the modal is visible
 * @param {Function} props.onClose - Function to call when close button is clicked
 * @param {Array} props.especialidades - List of available specialties
 * @param {Function} props.onProfesionalCreated - Function to call when professional is created
 * @param {boolean} props.showArchived - Whether archived professionals are shown
 */
const CrearProfesionales = ({ 
  isOpen, 
  onClose, 
  especialidades = [], 
  onProfesionalCreated, 
  showArchived = false 
}) => {
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
  const [especialidadNombre, setEspecialidadNombre] = useState('');

  // Cargar servicios cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarServicios();
      // Resetear formulario
      resetForm();
    }
  }, [isOpen]);

  // Efecto para actualizar nombre de especialidad al cambiar especialidad_id
  useEffect(() => {
    if (nuevoProfesional.especialidad_id) {
      const especialidadSeleccionada = especialidades.find(
        esp => esp.especialidad_id.toString() === nuevoProfesional.especialidad_id.toString()
      );
      if (especialidadSeleccionada) {
        setEspecialidadNombre(especialidadSeleccionada.nombre);
      }
    } else {
      setEspecialidadNombre('');
    }
  }, [nuevoProfesional.especialidad_id, especialidades]);

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
    setEspecialidadNombre('');
    setError(null);
  };

  // Toggle de un servicio (seleccionarlo o deseleccionarlo)
  const toggleServicio = (servicioId) => {
    if (serviciosSeleccionados.includes(servicioId)) {
      setServiciosSeleccionados(serviciosSeleccionados.filter(id => id !== servicioId));
    } else {
      setServiciosSeleccionados([...serviciosSeleccionados, servicioId]);
    }
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

  // Render principal
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      heading="Agregar nuevo profesional"
      size="large"
      primaryButtonText="Agregar"
      onPrimaryClick={handleCreateProfesional}
      primaryButtonDisabled={loading}
      secondaryButtonText="Cancelar"
      onSecondaryClick={handleClose}
    >
      <div className="crear-profesionales-container">
        {error && (
          <div className="crear-profesionales-error">
            {error}
          </div>
        )}
        
        <div className="input-field">
          <div className="label">Cédula</div>
          <div className="input">
            <input 
              className="value"
              type="text"
              value={nuevoProfesional.cedula}
              onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, cedula: e.target.value })}
              placeholder="00.000.000"
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="input-field">
          <div className="label">Nombre</div>
          <div className="input">
            <input 
              className="value"
              type="text"
              value={nuevoProfesional.nombre}
              onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, nombre: e.target.value })}
              placeholder="Nombre del profesional"
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="input-field">
          <div className="label">Apellido</div>
          <div className="input">
            <input 
              className="value"
              type="text"
              value={nuevoProfesional.apellido}
              onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, apellido: e.target.value })}
              placeholder="Apellido del profesional"
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="input-field">
          <div className="label">Teléfono</div>
          <div className="input">
            <input 
              className="value"
              type="text"
              value={nuevoProfesional.telefono}
              onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, telefono: e.target.value })}
              placeholder="Teléfono del profesional"
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="input-field">
          <div className="label">Correo</div>
          <div className="input">
            <input 
              className="value"
              type="email"
              value={nuevoProfesional.correo}
              onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, correo: e.target.value })}
              placeholder="correo@ejemplo.com"
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="select-field">
          <div className="label">Especialidad</div>
          <div className="select" onClick={() => !loading && document.getElementById('especialidad-select').focus()}>
            <select
              id="especialidad-select"
              className="select-native"
              value={nuevoProfesional.especialidad_id}
              onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, especialidad_id: e.target.value })}
              disabled={loading}
              style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
              <option value="">Seleccione una especialidad</option>
              {especialidades.map(esp => (
                <option key={esp.especialidad_id} value={esp.especialidad_id}>
                  {esp.nombre}
                </option>
              ))}
            </select>
            <div className="value">
              {especialidadNombre || 'Seleccione una especialidad'}
            </div>
            <ChevronDownIcon className="chevron-down" />
          </div>
        </div>
        
        {servicios.length > 0 && (
          <div className="input-field">
            <div className="servicio">Servicio</div>
            <div className="frame-30">
              {servicios.map(servicio => (
                <div key={servicio.id_servicio} className="checkbox-field">
                  <div 
                    className="checkbox-and-label" 
                    onClick={() => !loading && toggleServicio(servicio.id_servicio)}
                  >
                    <div className={serviciosSeleccionados.includes(servicio.id_servicio) ? "checkbox2" : "checkbox"}>
                      {serviciosSeleccionados.includes(servicio.id_servicio) && (
                        <CheckIcon className="check" />
                      )}
                    </div>
                    <div className="label2">{servicio.nombre_servicio}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CrearProfesionales;
