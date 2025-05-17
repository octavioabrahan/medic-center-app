import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api';
import { ArchiveBoxIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import './EditarProfesionales.css';
import './EditarProfesionales-fix.css';
import './modal-fix.css';
import './checkbox-fix.css';
import './ArchivarModal.css';
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
  onConfirmArchive,
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
  
  // Estado para el modal de confirmación de archivar profesional
  const [showArchivarModal, setShowArchivarModal] = useState(false);
  const [confirmacionArchivado, setConfirmacionArchivado] = useState(false);

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
      
      // Mantener el especialidad_id en su formato original pero asegurarnos que sea string
      const especialidadId = profesional.especialidad_id ? String(profesional.especialidad_id) : '';
      console.log('Especialidad ID que se va a seleccionar:', especialidadId);
      
      // Verificar que exista en las opciones disponibles
      const especialidadExiste = especialidades.some(esp => 
        String(esp.especialidad_id) === especialidadId
      );
      
      console.log('¿Especialidad existe en las opciones?', especialidadExiste);
      
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
      
      // Inicializar los servicios como arrays vacíos para evitar errores
      setServicios([]);
      setServiciosSeleccionados([]);
      
      // Cargar servicios solo cuando tenemos un profesional válido con ID
      if (profesional.profesional_id) {
        console.log('Cargando servicios para el profesional ID:', profesional.profesional_id);
        cargarServicios();
      }
    }
  }, [isOpen, profesional, cargarServicios, especialidades]);

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
      // Asegurarnos que prevServicios es un array
      const serviciosArray = Array.isArray(prevServicios) ? prevServicios : [];
      
      // Verificar si el servicio ya está seleccionado
      if (serviciosArray.includes(servicioId)) {
        console.log('Removiendo servicio:', servicioId);
        // Si está seleccionado, lo quitamos
        return serviciosArray.filter(id => id !== servicioId);
      } else {
        console.log('Agregando servicio:', servicioId);
        // Si no está seleccionado, lo agregamos
        return [...serviciosArray, servicioId];
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

  // Mostrar el modal de confirmación para archivar
  const archivarProfesional = () => {
    if (typeof onConfirmArchive === 'function') {
      // Pasar el profesional al componente padre para archivar
      // Convertimos el objeto profesionalEditado para que tenga el formato esperado por el componente padre
      const profesionalParaArchivar = {
        profesional_id: profesionalEditado.id,
        nombre: profesionalEditado.nombre,
        apellido: profesionalEditado.apellido
      };
      onConfirmArchive(profesionalParaArchivar);
    } else {
      // Fallback al comportamiento anterior si no se proporciona la función
      setShowArchivarModal(true);
    }
  };
  
  // Confirmar archivado del profesional
  const confirmarArchivarProfesional = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!profesionalEditado || !profesionalEditado.id) {
        throw new Error("No se pudo identificar al profesional para archivar");
      }
      
      console.log('Archivando profesional:', profesionalEditado.id);
      
      // Llamar a la API para archivar el profesional (cambiar estado a inactivo)
      const profesionalId = profesionalEditado.id;
      console.log('URL de la solicitud:', `/profesionales/estado/${profesionalId}`);
      
      const response = await api.put(`/profesionales/estado/${profesionalId}`, {
        activo: false
      });
      
      console.log('Respuesta archivar profesional:', response);
      
      // Cerrar el modal de confirmación
      setShowArchivarModal(false);
      setConfirmacionArchivado(false);
      
      // Mostrar mensaje de éxito
      setSuccessMessage("Profesional archivado correctamente");
      
      // Asegurar que los servicios seleccionados sea un array
      setServiciosSeleccionados([]);
      
      // Esperar un breve momento antes de cerrar el modal
      setTimeout(() => {
        // Notificar que el profesional ha sido actualizado
        if (typeof onProfesionalUpdated === 'function') {
          onProfesionalUpdated();
        }
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
    <>
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
            value={String(profesionalEditado.especialidad_id)}
            placeholder="Seleccione una especialidad"
            fillContainer={true}
            options={especialidades.map(esp => ({
              label: esp.nombre,
              value: String(esp.especialidad_id)
            }))}
            onChange={(value) => {
              console.log('Especialidad seleccionada desde SelectField:', value);
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
                    checked={Array.isArray(serviciosSeleccionados) && serviciosSeleccionados.includes(servicio.id_servicio)}
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

      {/* Modal de confirmación para archivar profesional */}
      <Modal
        isOpen={showArchivarModal}
        onClose={() => {
          setShowArchivarModal(false);
          setConfirmacionArchivado(false);
        }}
        heading="Estás a punto de archivar al profesional"
        size="small"
        contentClassName="hide-original-buttons"
      >
        <div className="archivar-modal-content">
          <p>Al archivar a <strong>{profesionalEditado.nombre} {profesionalEditado.apellido}</strong>:</p>
          <ul>
            <li>El profesional no estará disponible para nuevas citas.</li>
            <li>Los datos del profesional se mantendrán en los registros históricos.</li>
            <li>Las citas existentes no se verán afectadas.</li>
            <li>El profesional podrá ser activado nuevamente si es necesario.</li>
          </ul>
          
          <div className="checkbox-container">
            <CheckboxField
              label="Entiendo que el profesional dejará de estar disponible para agendamiento."
              checked={confirmacionArchivado}
              onChange={(checked) => setConfirmacionArchivado(checked)}
            />
            {!confirmacionArchivado && (
              <div className="mensaje-advertencia">
                Debes confirmar que entiendes las consecuencias para continuar.
              </div>
            )}
          </div>

          <div className="archivar-modal-buttons">
            <Button 
              variant="neutral" 
              onClick={() => {
                setShowArchivarModal(false);
                setConfirmacionArchivado(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmarArchivarProfesional}
              disabled={!confirmacionArchivado || loading}
            >
              {loading ? "Archivando..." : "Sí, archivar"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EditarProfesionales;
