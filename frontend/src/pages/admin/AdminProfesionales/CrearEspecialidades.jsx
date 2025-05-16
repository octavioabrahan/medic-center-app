import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/Inputs/InputField';
import { PlusIcon } from '@heroicons/react/20/solid';
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
    const nombreNormalizado = normalizarTexto(nombre);
    
    // Verificar en especialidades existentes
    const existeEnExistentes = especialidades.some(
      esp => normalizarTexto(esp.nombre) === nombreNormalizado
    );
    
    // Verificar en nuevas especialidades
    const existeEnNuevas = nuevasEspecialidades.some(
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

  // Función para guardar los cambios
  const handleGuardar = async () => {
    setLoading(true);
    try {
      // Si hay nuevas especialidades, guardarlas en la BD
      if (nuevasEspecialidades.length > 0) {
        for (const esp of nuevasEspecialidades) {
          await api.post('/especialidades', { 
            nombre: esp.nombre 
          });
        }
      }
      
      // Recargar todas las especialidades para obtener las IDs correctas
      const response = await api.get('/especialidades');
      
      // Actualizar y notificar al componente padre
      if (onSpecialtyCreated) {
        onSpecialtyCreated(response.data);
      }
      
      setError(null);
      handleClose();
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
              <div key={especialidad.id} className="especialidades-item">
                <div className="especialidades-input">
                  <div className="especialidades-value">{especialidad.nombre}</div>
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
              nuevasEspecialidades.length >= MAX_NUEVAS_ESPECIALIDADES
            }
          >
            <PlusIcon className="especialidades-plus-icon" />
            <span>Crear nueva especialidad</span>
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