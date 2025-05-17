import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api';
import { ArchiveBoxIcon, ChevronDownIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';
import './EditarProfesionales.css';
import Modal from '../../../components/Modal/Modal';
import InputField from '../../../components/Inputs/InputField';
import SelectField from '../../../components/Inputs/SelectField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import { Button } from '../../../components/Button/Button';

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
  const [successMessage, setSuccessMessage] = useState(null);

  // Función para cargar los servicios asociados al profesional
  const cargarServicios = useCallback(async () => {
    if (!profesional || !profesional.profesional_id) return;
    
    try {
      setLoading(true);
      
      // Cargar todos los servicios disponibles
      const serviciosResponse = await api.get(`/servicios`);
      
      // Cargar servicios asignados al profesional (relaciones)
      const relacionesResponse = await api.get(`/profesionales/relaciones/${profesional.profesional_id}`);
      
      console.log('Profesional ID:', profesional.profesional_id);
      console.log('Todos los servicios:', serviciosResponse.data);
      console.log('Relaciones:', relacionesResponse.data);
      
      const todosServicios = serviciosResponse.data || [];
      
      // La respuesta del backend es { categorias: [...ids], servicios: [...ids] }
      // Extraer los IDs de servicios directamente de la respuesta
      const serviciosAsignados = Array.isArray(relacionesResponse.data?.servicios) 
        ? relacionesResponse.data.servicios
        : [];
        
      console.log('Servicios asignados procesados:', serviciosAsignados);
      
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
  
  // Efecto para cargar los datos del profesional cuando se abre el modal
  useEffect(() => {
    if (isOpen && profesional) {
      console.log('Profesional recibido:', profesional);
      
      setProfesionalEditado({
        id: profesional.profesional_id || '',
        cedula: profesional.cedula || '',
        nombre: profesional.nombre || '',
        apellido: profesional.apellido || '',
        telefono: profesional.telefono || '',
        correo: profesional.email || '', // backend uses email, not correo
        especialidad_id: profesional.especialidad_id || '',
        activo: profesional.is_active !== undefined ? profesional.is_active : true
      });
      
      // Cargar servicios solo cuando tenemos un profesional válido con ID
      if (profesional.profesional_id) {
        console.log('Cargando servicios para el profesional ID:', profesional.profesional_id);
        cargarServicios();
      }
    }
  }, [isOpen, profesional, cargarServicios]);

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
    console.log('Toggle servicio:', servicioId);
    setServiciosSeleccionados(prevServicios => {
      // Verificar si el servicio ya está seleccionado
      if (prevServicios.includes(servicioId)) {
        console.log('Removiendo servicio:', servicioId);
        // Si está seleccionado, lo quitamos
        return prevServicios.filter(id => id !== servicioId);
      } else {
        console.log('Agregando servicio:', servicioId);
        // Si no está seleccionado, lo agregamos
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
      
      console.log('Actualizando profesional:', profesionalEditado);
      console.log('Servicios seleccionados:', serviciosSeleccionados);
      
      // Actualizar datos del profesional
      const updateResponse = await api.put(`/profesionales/estado/${profesionalEditado.id}`, {
        activo: profesionalEditado.activo
      });
      
      console.log('Respuesta actualización profesional:', updateResponse);
      
      // Actualizar servicios asignados
      const serviciosResponse = await api.post(`/profesionales/asignar-servicios`, {
        profesional_id: profesionalEditado.id,
        servicios: serviciosSeleccionados
      });
      
      console.log('Respuesta asignación servicios:', serviciosResponse);
      
      // Mostrar mensaje de éxito
      setSuccessMessage("Profesional actualizado correctamente");
      
      // Esperar un breve momento antes de cerrar el modal
      setTimeout(() => {
        // Notificar actualización exitosa
        onProfesionalUpdated();
        onClose();
      }, 1500);
      
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
      
      console.log('Archivando profesional:', profesionalEditado.id);
      
      // Llamar a la API para archivar el profesional (cambiar estado a inactivo)
      const response = await api.put(`/profesionales/estado/${profesionalEditado.id}`, {
        activo: false
      });
      
      console.log('Respuesta archivar profesional:', response);
      
      // Mostrar mensaje de éxito
      setSuccessMessage("Profesional archivado correctamente");
      
      // Esperar un breve momento antes de cerrar el modal
      setTimeout(() => {
        // Notificar que el profesional ha sido actualizado
        onProfesionalUpdated();
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error("Error al archivar profesional:", err);
      setError("Error al archivar el profesional. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Renderizar el modal de edición
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={`Editar a ${profesional?.nombre || ''} ${profesional?.apellido || ''}`}
    >
      {error && (
        <div className="editar-profesionales-error">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="editar-profesionales-success" style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '0.75rem 1.25rem', 
          marginBottom: '1rem', 
          borderRadius: '0.25rem' 
        }}>
          {successMessage}
        </div>
      )}
      
      <div className="text">
        <InputField
          label="Cédula"
          value={profesionalEditado.cedula}
          placeholder="Ej: 00.000.000"
          onChange={(value) => setProfesionalEditado({
            ...profesionalEditado,
            cedula: value
          })}
          style={{ marginBottom: '16px' }}
        />
            
        <InputField
          label="Nombre"
          value={profesionalEditado.nombre}
          placeholder="Nombre del profesional"
          onChange={(value) => setProfesionalEditado({
            ...profesionalEditado,
            nombre: value
          })}
          style={{ marginBottom: '16px' }}
        />
        
        <InputField
          label="Apellido"
          value={profesionalEditado.apellido}
          placeholder="Apellido del profesional"
          onChange={(value) => setProfesionalEditado({
            ...profesionalEditado,
            apellido: value
          })}
          style={{ marginBottom: '16px' }}
        />
        
        <InputField
          label="Teléfono"
          value={profesionalEditado.telefono}
          placeholder="Teléfono del profesional"
          onChange={(value) => setProfesionalEditado({
            ...profesionalEditado,
            telefono: value
          })}
          style={{ marginBottom: '16px' }}
        />
        
        <InputField
          label="Correo"
          value={profesionalEditado.correo}
          placeholder="correo@ejemplo.com"
          onChange={(value) => setProfesionalEditado({
            ...profesionalEditado,
            correo: value
          })}
          style={{ marginBottom: '16px' }}
        />
        
        <SelectField
          label="Especialidad"
          value={profesionalEditado.especialidad_id}
          placeholder="Seleccione una especialidad"
          options={especialidades.map(esp => ({
            label: esp.nombre,
            value: esp.especialidad_id
          }))}
          onChange={(value) => setProfesionalEditado({
            ...profesionalEditado,
            especialidad_id: value
          })}
          style={{ marginBottom: '16px' }}
        />
        
        <div className="input-field">
          <div className="servicio">Servicio</div>
          {loading ? (
            <div>Cargando servicios...</div>
          ) : (
            <div className="frame-30">
              {Array.isArray(servicios) && servicios.length > 0 ? (
                servicios.map(servicio => (
                  <CheckboxField
                    key={servicio.id_servicio}
                    label={servicio.nombre_servicio}
                    checked={serviciosSeleccionados.includes(servicio.id_servicio)}
                    onChange={() => toggleServicio(servicio.id_servicio)}
                    description={servicio.price_usd ? `USD ${servicio.price_usd}` : ''}
                  />
                ))
              ) : (
                <div>No hay servicios disponibles para esta especialidad</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="button-group">
        <Button
          variant="danger"
          onClick={archivarProfesional}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={loading}
        >
          <ArchiveBoxIcon className="heroicons-mini-archive-box" />
          {loading ? 'Archivando...' : 'Archivar'}
        </Button>
        
        <div className="frame-77">
          <Button
            variant="neutral"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
      
      <Button
        variant="icon"
        onClick={onClose}
        style={{ position: 'absolute', top: '12px', right: '12px' }}
      >
        <XMarkIcon className="x" />
      </Button>
    </Modal>
  );
};

export default EditarProfesionales;
