import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button/Button';
import api from '../../../api';
import './AdminProfesionales.css'; // Reutilizamos los estilos

/**
 * EditarProfesionales component for editing professional information
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls if the modal is visible
 * @param {Function} props.onClose - Function to call when close button is clicked
 * @param {Object} props.profesional - The professional data to edit
 * @param {Array} props.especialidades - List of available specialties
 * @param {Function} props.onConfirmArchive - Function to confirm archiving a professional
 * @param {Function} props.onProfesionalUpdated - Function to call when professional is updated
 * @param {boolean} props.showArchived - Whether archived professionals are shown
 */
const EditarProfesionales = ({
  isOpen,
  onClose,
  profesional,
  especialidades = [],
  onConfirmArchive,
  onProfesionalUpdated,
  showArchived = false
}) => {
  // Estado local
  const [currentProfesional, setCurrentProfesional] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Inicializar estado cuando se abre el modal
  useEffect(() => {
    if (isOpen && profesional) {
      setCurrentProfesional({...profesional});
      
      // Cargar servicios
      fetchServicios();
      
      // Cargar servicios seleccionados por el profesional
      if (profesional.profesional_id) {
        fetchServiciosProfesional(profesional.profesional_id);
      }
    }
  }, [isOpen, profesional]);

  // Función para cargar servicios disponibles
  const fetchServicios = async () => {
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

  // Función para cargar servicios seleccionados por el profesional
  const fetchServiciosProfesional = async (profesionalId) => {
    try {
      const res = await api.get(`/profesionales/relaciones/${profesionalId}`);
      setServiciosSeleccionados(res.data.servicios || []);
    } catch (err) {
      console.error("Error al cargar servicios del profesional:", err);
    }
  };

  // Función para actualizar el profesional
  const handleUpdateProfesional = async (e) => {
    e?.preventDefault();
    
    if (!currentProfesional.nombre || 
        !currentProfesional.apellido || 
        !currentProfesional.especialidad_id) {
      setError("Todos los campos obligatorios deben ser completados");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/profesionales/${currentProfesional.profesional_id}`, {
        nombre: currentProfesional.nombre,
        apellido: currentProfesional.apellido,
        cedula: currentProfesional.cedula,
        telefono: currentProfesional.telefono,
        correo: currentProfesional.email,
        especialidad_id: currentProfesional.especialidad_id
      });
      
      // Actualizar servicios
      if (serviciosSeleccionados.length > 0) {
        await api.post('/profesionales/asignar-servicios', {
          profesional_id: currentProfesional.profesional_id,
          servicios: serviciosSeleccionados
        });
      }
      
      // Actualizar lista de profesionales
      const updatedProfesionales = await api.get('/profesionales', { 
        params: { soloActivos: !showArchived } 
      });
      
      // Notificar al componente padre
      onProfesionalUpdated && onProfesionalUpdated(updatedProfesionales.data);
      
      // Cerrar modal
      handleClose();
    } catch (err) {
      console.error("Error al actualizar profesional:", err);
      setError(err.response?.data?.error || "Error al actualizar el profesional");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    setCurrentProfesional(null);
    setServiciosSeleccionados([]);
    setError(null);
    onClose();
  };

  // Si no hay profesional o el modal está cerrado, no renderizar nada
  if (!isOpen || !currentProfesional) return null;

  return (
    <div className="admin-profesionales__modal-overlay">
      <div className="admin-profesionales__modal-content">
        <div className="admin-profesionales__modal-header">
          <h2>Editar Profesional</h2>
          <button className="admin-profesionales__close-btn" onClick={handleClose}>×</button>
        </div>
        {error && (
          <div className="admin-profesionales__error-message">
            {error}
          </div>
        )}
        <div className="admin-profesionales__modal-body">
          <form onSubmit={handleUpdateProfesional}>
            <div className="admin-profesionales__form-group">
              <label htmlFor="edit-cedula">Cédula *</label>
              <input
                id="edit-cedula"
                type="text"
                value={currentProfesional.cedula || ''}
                onChange={(e) => setCurrentProfesional({ ...currentProfesional, cedula: e.target.value })}
                className="admin-profesionales__input"
                required
                disabled // La cédula no se debería modificar una vez creado
              />
            </div>
            
            <div className="admin-profesionales__form-group">
              <label htmlFor="edit-nombre">Nombre *</label>
              <input
                id="edit-nombre"
                type="text"
                value={currentProfesional.nombre || ''}
                onChange={(e) => setCurrentProfesional({ ...currentProfesional, nombre: e.target.value })}
                className="admin-profesionales__input"
                required
              />
            </div>
            
            <div className="admin-profesionales__form-group">
              <label htmlFor="edit-apellido">Apellido *</label>
              <input
                id="edit-apellido"
                type="text"
                value={currentProfesional.apellido || ''}
                onChange={(e) => setCurrentProfesional({ ...currentProfesional, apellido: e.target.value })}
                className="admin-profesionales__input"
                required
              />
            </div>
            
            <div className="admin-profesionales__form-group">
              <label htmlFor="edit-telefono">Teléfono</label>
              <input
                id="edit-telefono"
                type="text"
                value={currentProfesional.telefono || ''}
                onChange={(e) => setCurrentProfesional({ ...currentProfesional, telefono: e.target.value })}
                className="admin-profesionales__input"
              />
            </div>
            
            <div className="admin-profesionales__form-group">
              <label htmlFor="edit-correo">Correo Electrónico</label>
              <input
                id="edit-correo"
                type="email"
                value={currentProfesional.email || ''}
                onChange={(e) => setCurrentProfesional({ ...currentProfesional, email: e.target.value })}
                className="admin-profesionales__input"
              />
            </div>
            
            <div className="admin-profesionales__form-group">
              <label htmlFor="edit-especialidad">Especialidad *</label>
              <select
                id="edit-especialidad"
                value={currentProfesional.especialidad_id || ''}
                onChange={(e) => setCurrentProfesional({ ...currentProfesional, especialidad_id: e.target.value })}
                className="admin-profesionales__select"
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
              <div className="admin-profesionales__form-group">
                <label>Servicios</label>
                <div className="admin-profesionales__servicios-list">
                  {servicios.map(servicio => (
                    <div key={servicio.id_servicio} className="admin-profesionales__servicio-item">
                      <input
                        type="checkbox"
                        id={`edit-servicio-${servicio.id_servicio}`}
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
                      <label htmlFor={`edit-servicio-${servicio.id_servicio}`}>{servicio.nombre_servicio}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
        <div className="admin-profesionales__modal-footer">
          <Button 
            variant="danger" 
            onClick={() => onConfirmArchive(currentProfesional)}
            disabled={loading}
          >
            Archivar profesional
          </Button>
          <div>
            <Button variant="neutral" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpdateProfesional}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarProfesionales;
