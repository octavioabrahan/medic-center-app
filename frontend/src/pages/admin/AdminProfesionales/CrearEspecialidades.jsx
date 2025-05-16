import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/Inputs/InputField';
import { PlusIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
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
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('');
  const [mostrarInputNueva, setMostrarInputNueva] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar especialidades al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarEspecialidades();
    }
  }, [isOpen]);

  // Función para cargar especialidades desde la API
  const cargarEspecialidades = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/especialidades');
      setEspecialidades(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar especialidades:", err);
      setError("No se pudieron cargar las especialidades. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar una nueva especialidad
  const agregarEspecialidad = () => {
    if (!nuevaEspecialidad.trim()) return;
    
    // Agregar temporalmente a la lista local
    const nuevaEspecialidadObj = {
      id: `temp-${Date.now()}`, // ID temporal
      nombre: nuevaEspecialidad.trim(),
      isNew: true // Marcar como nueva para identificarla al guardar
    };
    
    setEspecialidades([...especialidades, nuevaEspecialidadObj]);
    setNuevaEspecialidad(''); // Limpiar el input para la siguiente entrada
  };

  // Función para guardar los cambios
  const handleGuardar = async () => {
    setLoading(true);
    try {
      // Filtrar especialidades nuevas (marcadas con isNew)
      const nuevasEspecialidades = especialidades.filter(esp => esp.isNew);
      
      // Si hay nuevas especialidades, guardarlas en la BD
      if (nuevasEspecialidades.length > 0) {
        for (const esp of nuevasEspecialidades) {
          await axios.post('/api/especialidades', { 
            nombre: esp.nombre 
          });
        }
      }
      
      // Recargar todas las especialidades para obtener las IDs correctas
      const response = await axios.get('/api/especialidades');
      
      // Actualizar y notificar al componente padre
      if (onSpecialtyCreated) {
        onSpecialtyCreated(response.data);
      }
      
      setError(null);
      onClose();
    } catch (err) {
      console.error("Error al guardar especialidades:", err);
      setError("No se pudieron guardar las especialidades. Intente nuevamente.");
      setLoading(false);
    }
  };

  return (
    <div className="crear-especialidades-container">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        heading="Especialidades"
        bodyText="Cada profesional debe tener asignada una especialidad para poder mostrarse en el sitio de agendamiento."
        primaryButtonText="Guardar"
        onPrimaryClick={handleGuardar}
        secondaryButtonText="Cancelar"
        onSecondaryClick={onClose}
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
        
        {/* Contenedor para el input y botón de nueva especialidad */}
        <div className="especialidades-nueva-seccion">
          {/* Input para nueva especialidad */}
          {mostrarInputNueva && (
            <div className="especialidades-nueva-input">
              <InputField
                value={nuevaEspecialidad}
                onChange={(value) => setNuevaEspecialidad(value)}
                placeholder="Nombre de especialidad"
              />
            </div>
          )}
          
          {/* Botón para añadir especialidad */}
          <Button 
            variant="neutral" 
            onClick={mostrarInputNueva ? agregarEspecialidad : () => setMostrarInputNueva(true)}
            disabled={mostrarInputNueva && !nuevaEspecialidad.trim()}
            className="especialidades-btn-crear"
          >
            <PlusIcon className="especialidades-plus-icon" />
            <span>{mostrarInputNueva ? "Añadir especialidad" : "Crear nueva especialidad"}</span>
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CrearEspecialidades;