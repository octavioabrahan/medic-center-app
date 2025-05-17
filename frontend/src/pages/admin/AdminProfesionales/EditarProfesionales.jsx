import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api';
import { ArchiveBoxIcon, ChevronDownIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';
import './EditarProfesionales.css';
import './EditarProfesionales-fix.css';
import './modal-fix.css';
import './checkbox-fix.css';
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
      
      // Asegurarse de que especialidad_id sea del mismo tipo de datos que se espera en el select
      const especialidadId = profesional.especialidad_id ? profesional.especialidad_id.toString() : '';
      console.log('Especialidad ID que se va a seleccionar:', especialidadId);
      
      setProfesionalEditado({
        id: profesional.profesional_id || '',
        cedula: profesional.cedula || '',
        nombre: profesional.nombre || '',
        apellido: profesional.apellido || '',
        telefono: profesional.telefono || '',
        correo: profesional.email || '', // backend uses email, not correo
        especialidad_id: especialidadId,
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

  // Custom footer component para el modal que reemplaza la funcionalidad de los botones predeterminados
  const CustomFooter = () => (
    <div className="custom-button-group">
      <Button
        variant="danger"
        onClick={archivarProfesional}
        disabled={loading}
      >
        <ArchiveBoxIcon className="btn__icon" />
        <span style={{ marginLeft: '.5rem' }}>{loading ? "Archivando..." : "Archivar"}</span>
      </Button>
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
        {loading ? "Guardando..." : "Guardar"}
      </Button>
    </div>
  );

  // Renderizar el modal de edición con el nuevo diseño
  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      heading={`Editar a ${profesional?.nombre || ''} ${profesional?.apellido || ''}`}
      bodyText=""
      contentClassName="hide-original-buttons full-width-modal"
      size="medium"
    >
      {error && (
        <div className="mensaje-error">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mensaje-error" style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          borderLeft: '4px solid #155724'
        }}>
          {successMessage}
        </div>
      )}
      
      <div className="campo-completo">
        <InputField
          label="Cédula"
          value={profesionalEditado.cedula}
          placeholder="Ej: 00.000.000"
          fillContainer={true}
          onChange={(value) => setProfesionalEditado({
            ...profesionalEditado,
            cedula: value
          })}
        />
      </div>
            
      <div className="campo-completo">
        <InputField
          label="Nombre"
          value={profesionalEditado.nombre}
          placeholder="Nombre del profesional"
          fillContainer={true}
          onChange={(value) => setProfesionalEditado({
            ...profesionalEditado,
            nombre: value
          })}
        />
      </div>
        
      <div className="campo-completo">
        <InputField
          label="Apellido"
          value={profesionalEditado.apellido}
          placeholder="Apellido del profesional"
          fillContainer={true}
          onChange={(value) => setProfesionalEditado({
            ...profesionalEditado,
            apellido: value
          })}
        />
      </div>
        
      <div className="campo-completo">
        <InputField
          label="Teléfono"
          value={profesionalEditado.telefono}
          placeholder="Teléfono del profesional"
          fillContainer={true}
          onChange={(value) => setProfesionalEditado({
            ...profesionalEditado,
            telefono: value
          })}
        />
      </div>
        
      <div className="campo-completo">
        <InputField
          label="Correo"
          value={profesionalEditado.correo}
          placeholder="correo@ejemplo.com"
          fillContainer={true}
          onChange={(value) => setProfesionalEditado({
            ...profesionalEditado,
            correo: value
          })}
        />
      </div>
        
      <div className="campo-completo">
        <SelectField
          label="Especialidad"
          value={profesionalEditado.especialidad_id}
          placeholder="Seleccione una especialidad"
          fillContainer={true}
          options={especialidades.map(esp => ({
            label: esp.nombre,
            value: esp.especialidad_id.toString() // Convertir explícitamente a string
          }))}
          onChange={(value) => {
            console.log('Especialidad seleccionada:', value);
            setProfesionalEditado({
              ...profesionalEditado,
              especialidad_id: value
            });
          }}
        />
      </div>
        
      <div className="servicios-grupo">
        <p className="servicios-titulo">Servicios</p>
        <div className="servicios-opciones">
          {loading ? (
            <div>Cargando servicios...</div>
          ) : (
            Array.isArray(servicios) && servicios.length > 0 ? (
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
            )
          )}
        </div>
      </div>
      
      <CustomFooter />
    </Modal>
  );
};

export default EditarProfesionales;
