import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ArchiveBoxIcon, ChevronDownIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';
import './EditarProfesionales.css';

// API URL directamente desde las variables de entorno
const API_URL = process.env.REACT_APP_API_URL || '';

/**
 * Componente para editar profesionales existentes
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Controla si el modal está visible
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Object} props.profesional - Datos del profesional a editar
 * @param {Array} props.especialidades - Lista de especialidades disponibles
 * @param {Function} props.onProfesionalUpdated - Función a llamar cuando se actualiza un profesional
 */
const EditarProfesionales = ({
  isOpen,
  onClose,
  profesional,
  especialidades = [],
  onProfesionalUpdated
}) => {
  // Estado para el profesional editado
  const [profesionalEditado, setProfesionalEditado] = useState({
    id: '',
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    especialidad_id: '',
    activo: true
  });
  
  // Estado para servicios y selección
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false); // Usado para mostrar estados de carga si se necesita
  const [error, setError] = useState(null);

  // Efecto para cargar los datos del profesional cuando se abre el modal
  useEffect(() => {
    if (isOpen && profesional) {
      setProfesionalEditado({
        id: profesional.id || '',
        cedula: profesional.cedula || '',
        nombre: profesional.nombre || '',
        apellido: profesional.apellido || '',
        telefono: profesional.telefono || '',
        correo: profesional.correo || '',
        especialidad_id: profesional.especialidad_id || '',
        activo: profesional.activo !== undefined ? profesional.activo : true
      });
      
      cargarServicios();
    }
  }, [isOpen, profesional, especialidades, cargarServicios]);

  // Función para cargar los servicios asociados al profesional
  const cargarServicios = useCallback(async () => {
    if (!profesional || !profesional.id) return;
    
    try {
      setLoading(true);
      
      // Cargar todos los servicios disponibles
      const serviciosResponse = await axios.get(`${API_URL}/servicios/por-especialidad/${profesional.especialidad_id}`);
      
      // Cargar servicios asignados al profesional
      const serviciosAsignadosResponse = await axios.get(`${API_URL}/profesionales/${profesional.id}/servicios`);
      
      const todosServicios = serviciosResponse.data;
      const serviciosAsignados = serviciosAsignadosResponse.data.map(servicio => servicio.id);
      
      // Marcar los servicios que ya están asignados
      setServicios(todosServicios);
      setServiciosSeleccionados(serviciosAsignados);
      
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      setError("Error al cargar los servicios. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [profesional]);

  // Manejar cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfesionalEditado({
      ...profesionalEditado,
      [name]: value
    });
  };

  // Toggle de un servicio (seleccionarlo o deseleccionarlo)
  const toggleServicio = (servicioId) => {
    setServiciosSeleccionados(prevServicios => {
      if (prevServicios.includes(servicioId)) {
        return prevServicios.filter(id => id !== servicioId);
      } else {
        return [...prevServicios, servicioId];
      }
    });
  };

  // Actualizar profesional
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Actualizar datos del profesional
      await axios.put(`${API_URL}/profesionales/${profesionalEditado.id}`, profesionalEditado);
      
      // Actualizar servicios asignados
      await axios.put(`${API_URL}/profesionales/${profesionalEditado.id}/servicios`, {
        servicios: serviciosSeleccionados
      });
      
      // Notificar actualización exitosa
      onProfesionalUpdated();
      onClose();
      
    } catch (err) {
      console.error("Error al actualizar profesional:", err);
      setError("Error al actualizar el profesional. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Archivar profesional
  const archivarProfesional = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.put(`${API_URL}/profesionales/${profesionalEditado.id}`, {
        ...profesionalEditado,
        activo: false
      });
      
      onProfesionalUpdated();
      onClose();
      
    } catch (err) {
      console.error("Error al archivar profesional:", err);
      setError("Error al archivar el profesional. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Renderizar el modal de edición
  return (
    isOpen && (
      <div className="modal-overlay" onClick={onClose}>
        <div className="editar-profesionales-container" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-body">
            {error && (
              <div className="editar-profesionales-error">
                {error}
              </div>
            )}
            
            <div className="text">
              <div className="editar-a-endher-castillo">
                Editar a {profesional?.nombre || ''} {profesional?.apellido || ''}
              </div>
              
              <div className="input-field">
                <div className="label">Cédula</div>
                <div className="input">
                  <input 
                    type="text" 
                    name="cedula"
                    value={profesionalEditado.cedula}
                    onChange={handleChange}
                    className="value"
                    placeholder="Ej: 00.000.000"
                  />
                </div>
              </div>
              
              <div className="input-field">
                <div className="label">Nombre</div>
                <div className="input">
                  <input 
                    type="text" 
                    name="nombre"
                    value={profesionalEditado.nombre}
                    onChange={handleChange}
                    className="value"
                    placeholder="Nombre del profesional"
                  />
                </div>
              </div>
              
              <div className="input-field">
                <div className="label">Apellido</div>
                <div className="input">
                  <input 
                    type="text" 
                    name="apellido"
                    value={profesionalEditado.apellido}
                    onChange={handleChange}
                    className="value"
                    placeholder="Apellido del profesional"
                  />
                </div>
              </div>
              
              <div className="input-field">
                <div className="label">Teléfono</div>
                <div className="input">
                  <input 
                    type="text" 
                    name="telefono"
                    value={profesionalEditado.telefono}
                    onChange={handleChange}
                    className="value"
                    placeholder="Teléfono del profesional"
                  />
                </div>
              </div>
              
              <div className="input-field">
                <div className="label">Correo</div>
                <div className="input">
                  <input 
                    type="email" 
                    name="correo"
                    value={profesionalEditado.correo}
                    onChange={handleChange}
                    className="value"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>
              
              <div className="select-field">
                <div className="label">Especialidad</div>
                <div className="select">
                  <select 
                    name="especialidad_id"
                    value={profesionalEditado.especialidad_id}
                    onChange={handleChange}
                    className="value"
                  >
                    <option value="">Seleccione una especialidad</option>
                    {especialidades.map(especialidad => (
                      <option key={especialidad.id} value={especialidad.id}>
                        {especialidad.nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="chevron-down" />
                </div>
              </div>
              
              <div className="input-field">
                <div className="servicio">Servicio</div>
                <div className="frame-30">
                  {servicios.map(servicio => (
                    <div className="checkbox-field" key={servicio.id}>
                      <div className="checkbox-and-label">
                        <div 
                          className={serviciosSeleccionados.includes(servicio.id) ? "checkbox2" : "checkbox"}
                          onClick={() => toggleServicio(servicio.id)}
                        >
                          {serviciosSeleccionados.includes(servicio.id) && (
                            <CheckIcon className="check" />
                          )}
                        </div>
                        <div className="label2">{servicio.nombre}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="button-group">
              <div className="button-danger" onClick={archivarProfesional}>
                <ArchiveBoxIcon className="heroicons-mini-archive-box" />
                <div className="button">Archivar</div>
              </div>
              
              <div className="frame-77">
                <div className="button-neutral" onClick={onClose}>
                  <div className="button2">Cancelar</div>
                </div>
                
                <div className="button-primary" onClick={handleUpdate}>
                  <div className="button3">Guardar</div>
                </div>
              </div>
            </div>
            
            <div className="icon-button" onClick={onClose}>
              <XMarkIcon className="x" />
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default EditarProfesionales;
