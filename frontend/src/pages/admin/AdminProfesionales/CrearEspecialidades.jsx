import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/Inputs/InputField';
import { PlusIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/20/solid';
import api from '../../../api'; // Importar api en lugar de axios
import './CrearEspecialidades.css';

/**
 * CrearEspecialidades component for managing specialties in the admin dashboard
 * Allows adding, viewing, and managing medical specialties
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls if the modal is visible
 * @param {Function} props.onClose - Function to call when close button is clicked
 * @param {Function} props.onSpecialtyCreated - Function to call when specialties are saved
 */
const CrearEspecialidades = ({ isOpen, onClose, onSpecialtyCreated }) => {
  const [especialidades, setEspecialidades] = useState([]);
  const [nuevasEspecialidades, setNuevasEspecialidades] = useState([]);
  const [nombreEspecialidad, setNombreEspecialidad] = useState('');
  const [mostrarInputNueva, setMostrarInputNueva] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorValidacion, setErrorValidacion] = useState('');
  
  // Estados para edición inline
  const [editandoId, setEditandoId] = useState(null);
  const [valorEditando, setValorEditando] = useState('');
  const [errorEdicion, setErrorEdicion] = useState('');

  // Máximo número de nuevas especialidades permitidas
  const MAX_NUEVAS_ESPECIALIDADES = 3;

  // Cargar especialidades al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarEspecialidades();
      // Reiniciar el estado de las nuevas especialidades
      setNuevasEspecialidades([]);
      setNombreEspecialidad('');
      setMostrarInputNueva(false);
      setErrorValidacion('');
    }
  }, [isOpen]);

  // Función para cargar especialidades desde la API
  const cargarEspecialidades = async () => {
    setLoading(true);
    try {
      const response = await api.get('/especialidades');
      setEspecialidades(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar especialidades:", err);
      setError("No se pudieron cargar las especialidades. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Función para normalizar texto (quitar acentos, espacios extras y convertir a minúsculas)
  const normalizarTexto = (texto) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .trim()
      .replace(/\s+/g, " "); // Normalizar espacios
  };

  // Función para validar si la especialidad ya existe
  const validarEspecialidadExistente = (nombre) => {
    if (!nombre || nombre.trim().length === 0) return false;
    
    const nombreNormalizado = normalizarTexto(nombre);
    
    // Verificar en especialidades existentes
    const existeEnExistentes = Array.isArray(especialidades) && especialidades.some(
      esp => normalizarTexto(esp.nombre) === nombreNormalizado
    );
    
    // Verificar en nuevas especialidades
    const existeEnNuevas = Array.isArray(nuevasEspecialidades) && nuevasEspecialidades.some(
      esp => normalizarTexto(esp.nombre) === nombreNormalizado
    );
    
    return existeEnExistentes || existeEnNuevas;
  };

  // Función para agregar una nueva especialidad
  const agregarEspecialidad = () => {
    if (nombreEspecialidad.trim().length < 3) {
      setErrorValidacion('La especialidad debe tener al menos 3 caracteres');
      return;
    }
    
    if (validarEspecialidadExistente(nombreEspecialidad)) {
      setErrorValidacion('Esta especialidad ya existe (aunque con diferente formato)');
      return;
    }
    
    // Agregar a la lista de nuevas especialidades
    const nuevaEspecialidadObj = {
      id: `temp-${Date.now()}`,
      nombre: nombreEspecialidad.trim(),
      isNew: true
    };
    
    const nuevaLista = [...nuevasEspecialidades, nuevaEspecialidadObj];
    setNuevasEspecialidades(nuevaLista);
    setNombreEspecialidad('');
    setErrorValidacion('');
    
    // Si ya alcanzamos el máximo, ocultar el input
    if (nuevaLista.length >= MAX_NUEVAS_ESPECIALIDADES) {
      setMostrarInputNueva(false);
    }
  };

  // Función para iniciar la edición de una especialidad
  const iniciarEdicion = (especialidad) => {
    setEditandoId(especialidad.especialidad_id);
    setValorEditando(especialidad.nombre);
    setErrorEdicion('');
  };

  // Función para cancelar la edición
  const cancelarEdicion = () => {
    setEditandoId(null);
    setValorEditando('');
    setErrorEdicion('');
  };

  // Función para guardar la edición
  const guardarEdicion = async () => {
    if (valorEditando.trim().length < 3) {
      setErrorEdicion('La especialidad debe tener al menos 3 caracteres');
      return;
    }

    // Verificar si el nuevo nombre ya existe (excluyendo la especialidad actual)
    const nombreNormalizado = normalizarTexto(valorEditando);
    const yaExiste = especialidades.some(esp => 
      esp.especialidad_id !== editandoId && 
      normalizarTexto(esp.nombre) === nombreNormalizado
    );

    if (yaExiste) {
      setErrorEdicion('Ya existe una especialidad con este nombre');
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/especialidades/${editandoId}`, {
        nombre: valorEditando.trim()
      });

      // Actualizar la lista local
      setEspecialidades(prev => prev.map(esp => 
        esp.especialidad_id === editandoId 
          ? { ...esp, nombre: valorEditando.trim() }
          : esp
      ));

      // Cancelar edición
      cancelarEdicion();
      setError(null);
    } catch (err) {
      console.error("Error al actualizar especialidad:", err);
      setErrorEdicion(err.response?.data?.error || "Error al actualizar la especialidad");
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una especialidad
  const eliminarEspecialidad = async (especialidadId, nombreEspecialidad) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de que deseas eliminar la especialidad "${nombreEspecialidad}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    try {
      setLoading(true);
      await api.delete(`/especialidades/${especialidadId}`);

      // Actualizar la lista local
      setEspecialidades(prev => prev.filter(esp => esp.especialidad_id !== especialidadId));
      setError(null);
      
      // Si se está editando esta especialidad, cancelar la edición
      if (editandoId === especialidadId) {
        cancelarEdicion();
      }
    } catch (err) {
      console.error("Error al eliminar especialidad:", err);
      setError(err.response?.data?.error || "Error al eliminar la especialidad");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el doble clic en una especialidad
  const handleDoubleClick = (especialidad) => {
    if (editandoId !== especialidad.especialidad_id) {
      iniciarEdicion(especialidad);
    }
  };

  // Función para manejar Enter y Escape en el input de edición
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      guardarEdicion();
    } else if (e.key === 'Escape') {
      cancelarEdicion();
    }
  };

  // Función para guardar los cambios
  const handleGuardar = async () => {
    setLoading(true);
    try {
      // Si hay texto en el input y es válido, agregarlo primero a las nuevas especialidades
      if (nombreEspecialidad.trim() && nombreEspecialidad.trim().length >= 3 && !validarEspecialidadExistente(nombreEspecialidad)) {
        const nuevaEspecialidadObj = {
          id: `temp-${Date.now()}`,
          nombre: nombreEspecialidad.trim(),
          isNew: true
        };
        setNuevasEspecialidades(prev => [...prev, nuevaEspecialidadObj]);
      }
      
      // Asegurarnos de tener la lista actualizada antes de procesar
      const especialidadesAGuardar = nombreEspecialidad.trim().length >= 3 && !validarEspecialidadExistente(nombreEspecialidad) 
        ? [...nuevasEspecialidades, { id: `temp-${Date.now()}`, nombre: nombreEspecialidad.trim(), isNew: true }]
        : nuevasEspecialidades;
        
      // Si hay nuevas especialidades, guardarlas en la BD
      if (especialidadesAGuardar.length > 0) {
        for (const esp of especialidadesAGuardar) {
          await api.post('/especialidades', { 
            nombre: esp.nombre 
          });
        }
        
        // Recargar todas las especialidades para obtener las IDs correctas
        const response = await api.get('/especialidades');
        
        // Actualizar y notificar al componente padre
        if (onSpecialtyCreated) {
          onSpecialtyCreated(response.data);
        }
        
        setError(null);
        handleClose();
      } else if (nombreEspecialidad.trim().length > 0 && nombreEspecialidad.trim().length < 3) {
        // Si hay texto pero no cumple los requisitos mínimos
        setErrorValidacion('La especialidad debe tener al menos 3 caracteres');
        setLoading(false);
        return;
      } else if (nombreEspecialidad.trim().length > 0 && validarEspecialidadExistente(nombreEspecialidad)) {
        // Si hay texto pero ya existe
        setErrorValidacion('Parece que esta especialidad ya está registrada. Evita duplicados para mantener el sistema ordenado.');
        setLoading(false);
        return;
      } else {
        // Si no hay nuevas especialidades ni texto para procesar, simplemente cerrar
        handleClose();
      }
    } catch (err) {
      console.error("Error al guardar especialidades:", err);
      setError("No se pudieron guardar las especialidades. Intente nuevamente.");
      setLoading(false);
    }
  };

  // Función para manejar el cierre y reiniciar el modal
  const handleClose = () => {
    // Reinicia el estado del modal
    setNombreEspecialidad('');
    setMostrarInputNueva(false);
    setNuevasEspecialidades([]);
    setError(null);
    setErrorValidacion('');
    
    // Cancelar cualquier edición en progreso
    cancelarEdicion();
    
    onClose();
  };

  return (
    <div className="crear-especialidades-container">
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        heading="Especialidades"
        bodyText="Cada profesional debe tener asignada una especialidad para poder mostrarse en el sitio de agendamiento."
        primaryButtonText="Guardar"
        onPrimaryClick={handleGuardar}
        secondaryButtonText="Cancelar"
        onSecondaryClick={handleClose}
        size="medium"
      >
        {/* Lista de especialidades existentes */}
        <div className="especialidades-lista">
          {loading ? (
            <div className="especialidades-loading">Cargando especialidades...</div>
          ) : error ? (
            <div className="especialidades-error">{error}</div>
          ) : (
            especialidades.map((especialidad) => (
              <div key={especialidad.especialidad_id} className="especialidades-item">
                <div className="especialidades-input-container">
                  {editandoId === especialidad.especialidad_id ? (
                    // Modo edición
                    <div className="especialidades-edicion fullwidth">
                      <InputField
                        value={valorEditando}
                        onChange={(value) => setValorEditando(value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        style={{ width: '100%' }}
                        placeholder="Nombre de especialidad"
                      />
                      {errorEdicion && (
                        <div className="especialidades-error-edicion">{errorEdicion}</div>
                      )}
                      <div className="especialidades-edicion-botones">
                        <Button variant="primary" onClick={guardarEdicion} size="small">
                          Guardar
                        </Button>
                        <Button variant="neutral" onClick={cancelarEdicion} size="small">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Modo visualización
                    <div className="especialidades-input-con-botones">
                      <div 
                        className="especialidades-input fullwidth"
                        onDoubleClick={() => handleDoubleClick(especialidad)}
                        title="Doble clic para editar"
                      >
                        <div className="especialidades-value">{especialidad.nombre}</div>
                        <div className="especialidades-botones-accion">
                          <Button
                            variant="subtle"
                            size="small"
                            onClick={() => iniciarEdicion(especialidad)}
                            title="Editar especialidad"
                            disabled={loading}
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="subtle"
                            size="small"
                            onClick={() => eliminarEspecialidad(especialidad.especialidad_id, especialidad.nombre)}
                            title="Eliminar especialidad"
                            disabled={loading}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Nuevas especialidades agregadas temporalmente */}
        {nuevasEspecialidades.length > 0 && (
          <div className="especialidades-nuevas-lista">
            <div className="especialidades-nuevas-titulo">Nuevas especialidades:</div>
            {nuevasEspecialidades.map((especialidad) => (
              <div key={especialidad.id} className="especialidades-item">
                <div className="especialidades-input nuevas">
                  <div className="especialidades-value">{especialidad.nombre}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Contenedor para el input y botón de nueva especialidad */}
        <div className="especialidades-nueva-seccion">
          {/* Input para nueva especialidad */}
          {mostrarInputNueva && (
            <div className="especialidades-nueva-input">
              <InputField
                value={nombreEspecialidad}
                onChange={(value) => setNombreEspecialidad(value)}
                placeholder="Nombre de especialidad"
                style={{ width: '100%' }}
              />
              {errorValidacion && (
                <div className="especialidades-error-validacion">{errorValidacion}</div>
              )}
            </div>
          )}
          
          {/* Botón para crear nueva especialidad */}
          <Button 
            variant="neutral" 
            onClick={mostrarInputNueva ? agregarEspecialidad : () => setMostrarInputNueva(true)}
            disabled={
              (mostrarInputNueva && nombreEspecialidad.trim().length < 3) || 
              nuevasEspecialidades.length >= MAX_NUEVAS_ESPECIALIDADES ||
              (mostrarInputNueva && validarEspecialidadExistente(nombreEspecialidad))
            }
          >
            <PlusIcon className="especialidades-plus-icon" />
            <span>{mostrarInputNueva && nombreEspecialidad.trim() ? 'Agregar a la lista' : 'Crear nueva especialidad'}</span>
          </Button>
          
          {/* Mensaje de límite alcanzado */}
          {nuevasEspecialidades.length >= MAX_NUEVAS_ESPECIALIDADES && (
            <div className="especialidades-max-message">
              Has alcanzado el límite de {MAX_NUEVAS_ESPECIALIDADES} nuevas especialidades por sesión
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CrearEspecialidades;