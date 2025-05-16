import React, { useState, useEffect } from 'react';
import './AgregarHorario.css';
import './EditarHorario.css';
import { ChevronDownIcon, XMarkIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import SelectField from '../../../components/Inputs/SelectField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import axios from 'axios';

/**
 * Modal para editar horarios de profesionales
 * @param {Object} props 
 * @param {boolean} props.isOpen - Controla si el modal está visible
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Object} props.horario - Datos del horario a editar
 * @param {Function} props.onSuccess - Función que se llama después de editar o eliminar el horario
 */
const EditarHorario = ({ isOpen, onClose, horario, onSuccess }) => {
  // Referencias para los contenedores de los date pickers
  const desdeFechaRef = React.useRef(null);
  const hastaFechaRef = React.useRef(null);

  // Estados para los campos del formulario
  const [profesional, setProfesional] = useState('');
  const [tipoAtencion, setTipoAtencion] = useState('');
  const [diasSemana, setDiasSemana] = useState({
    lunes: false,
    martes: false,
    miercoles: false,
    jueves: false,
    viernes: false,
    sabado: false,
    domingo: false,
  });
  const [horaInicio, setHoraInicio] = useState('');
  const [horaTermino, setHoraTermino] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [formValido, setFormValido] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para datos del backend
  const [profesionalesOptions, setProfesionalesOptions] = useState([]);
  const [tiposAtencionOptions, setTiposAtencionOptions] = useState([]);

  // Generamos todas las opciones de horario desde las 6:00 AM hasta las 10:00 PM en incrementos de 30 minutos
  const horariosOptions = (() => {
    const options = [];
    for (let hour = 6; hour <= 22; hour++) {
      const hour12 = hour > 12 ? hour - 12 : hour;
      const amPm = hour >= 12 ? 'PM' : 'AM';
      
      // Hora en punto
      options.push({
        value: `${hour.toString().padStart(2, '0')}:00`,
        label: `${hour12.toString().padStart(2, '0')}:00 ${amPm}`
      });
      
      // Media hora
      options.push({
        value: `${hour.toString().padStart(2, '0')}:30`,
        label: `${hour12.toString().padStart(2, '0')}:30 ${amPm}`
      });
    }
    return options;
  })();

  // Convertir formato de días de la semana numéricos a objeto booleano
  const mapDiasSemanaToObject = (diasArray) => {
    if (!Array.isArray(diasArray) || diasArray.length === 0) {
      return {
        lunes: false,
        martes: false,
        miercoles: false,
        jueves: false,
        viernes: false,
        sabado: false,
        domingo: false,
      };
    }

    const diasMap = {
      1: 'lunes',
      2: 'martes',
      3: 'miercoles',
      4: 'jueves',
      5: 'viernes',
      6: 'sabado',
      7: 'domingo'
    };

    const result = {
      lunes: false,
      martes: false,
      miercoles: false,
      jueves: false,
      viernes: false,
      sabado: false,
      domingo: false,
    };

    diasArray.forEach(dia => {
      const diaString = diasMap[dia];
      if (diaString) {
        result[diaString] = true;
      }
    });

    return result;
  };

  // Cargar datos del backend al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar profesionales
        const profesionalesResponse = await axios.get('/api/profesionales');
        const profesionalesData = profesionalesResponse.data.map(p => ({
          value: p.profesional_id,
          label: `${p.nombre} ${p.apellido}`
        }));
        setProfesionalesOptions(profesionalesData);
        
        // Cargar tipos de atención
        const tiposAtencionResponse = await axios.get('/api/tipo-atencion');
        const tiposAtencionData = tiposAtencionResponse.data.map(t => ({
          value: t.tipo_atencion_id,
          label: t.nombre
        }));
        setTiposAtencionOptions(tiposAtencionData);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar datos necesarios. Por favor, recarga la página.');
      }
    };
    
    fetchData();
  }, []);
  
  // Actualizar el formulario cuando se carga un horario para editar
  useEffect(() => {
    if (horario && isOpen) {
      setProfesional(horario.profesional_id);
      setTipoAtencion(horario.tipo_atencion_id);
      setDiasSemana(mapDiasSemanaToObject(horario.dia_semana));
      setHoraInicio(horario.hora_inicio?.slice(0, 5) || "");
      setHoraTermino(horario.hora_termino?.slice(0, 5) || "");
      setFechaDesde(horario.valido_desde || "");
      setFechaHasta(horario.valido_hasta || "");
    }
  }, [horario, isOpen]);

  // Validar formulario
  useEffect(() => {
    const profesionalSeleccionado = !!profesional;
    const tipoAtencionSeleccionado = !!tipoAtencion;
    const alMenosUnDia = Object.values(diasSemana).some(dia => dia);
    const horasSeleccionadas = horaInicio && horaTermino;
    const fechasSeleccionadas = fechaDesde && fechaHasta;

    setFormValido(
      profesionalSeleccionado && 
      tipoAtencionSeleccionado && 
      alMenosUnDia && 
      horasSeleccionadas && 
      fechasSeleccionadas
    );
  }, [profesional, tipoAtencion, diasSemana, horaInicio, horaTermino, fechaDesde, fechaHasta]);

  // Manejar cambio en días de la semana
  const handleDiaSemanaChange = (dia, checked) => {
    setDiasSemana(prevState => ({
      ...prevState,
      [dia]: checked
    }));
  };

  // Función para formatear fechas en formato dd/mm/aaaa
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Convertir formato de días de la semana para el backend
  const getDiasSemanaArray = () => {
    const diasMapping = {
      lunes: 1,
      martes: 2,
      miercoles: 3,
      jueves: 4,
      viernes: 5,
      sabado: 6,
      domingo: 7
    };
    
    return Object.entries(diasSemana)
      .filter(([_, isSelected]) => isSelected)
      .map(([dia]) => diasMapping[dia]);
  };

  // Manejar actualización de horario
  const handleGuardar = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validar horario
      if (horaInicio >= horaTermino) {
        setError('La hora de inicio debe ser anterior a la hora de término');
        setLoading(false);
        return;
      }
      
      // Obtener array de días de la semana
      const diasArray = getDiasSemanaArray();
      
      if (diasArray.length === 0) {
        setError('Debe seleccionar al menos un día de la semana');
        setLoading(false);
        return;
      }
      
      // Crear el objeto de horario para enviar al backend
      const horarioData = {
        profesional_id: profesional,
        tipo_atencion_id: tipoAtencion,
        dia_semana: diasArray,
        hora_inicio: horaInicio,
        hora_termino: horaTermino,
        valido_desde: fechaDesde,
        valido_hasta: fechaHasta,
      };
      
      // Enviar solicitud al backend
      await axios.put(`/api/horarios/${horario.horario_id}`, horarioData);
      
      // Notificar éxito y cerrar
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error al actualizar horario:', err);
      setError(err.response?.data?.error || 'Error al actualizar el horario. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar la eliminación del horario
  const handleBorrar = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/horarios/${horario.horario_id}`);
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } catch (err) {
        console.error('Error al eliminar horario:', err);
        setError(err.response?.data?.error || 'Error al eliminar el horario. Por favor, intenta de nuevo.');
        setLoading(false);
      }
    }
  };

  // Custom footer component para el modal que reemplaza la funcionalidad de los botones predeterminados
  const CustomFooter = () => (
    <div className="custom-button-group">
      <Button
        variant="danger"
        onClick={handleBorrar}
        disabled={loading}
      >
        <TrashIcon className="btn__icon" />
        <span style={{ marginLeft: '.5rem' }}>{loading ? "Borrando..." : "Borrar"}</span>
      </Button>
      <Button 
        variant="neutral" 
        onClick={onClose}
      >
        Cancelar
      </Button>
      <Button 
        variant="primary" 
        onClick={handleGuardar}
        disabled={!formValido || loading}
      >
        {loading ? "Guardando..." : "Guardar"}
      </Button>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      heading="Editar horario de atención"
      bodyText=""
      contentClassName="hide-original-buttons"
      size="medium"
    >
      {error && (
        <div className="mensaje-error">
          {error}
        </div>
      )}
      
      <div className="campo-completo">
        <SelectField
          label="Profesional"
          placeholder="Selecciona un profesional"
          value={profesional}
          onChange={setProfesional}
          options={profesionalesOptions}
          disabled={loading}
        />
      </div>

      <div className="campo-completo">
        <SelectField
          label="Tipo de atención"
          placeholder="Selecciona una opción"
          value={tipoAtencion}
          onChange={setTipoAtencion}
          options={tiposAtencionOptions}
          disabled={loading}
        />
      </div>

      <div className="dias-semana-grupo">
        <p className="dias-semana-titulo">Día de la semana</p>
        <div className="dias-semana-opciones">
          <CheckboxField 
            label="Lunes" 
            checked={diasSemana.lunes} 
            onChange={(checked) => handleDiaSemanaChange('lunes', checked)} 
          />
          <CheckboxField 
            label="Martes" 
            checked={diasSemana.martes} 
            onChange={(checked) => handleDiaSemanaChange('martes', checked)} 
          />
          <CheckboxField 
            label="Miércoles" 
            checked={diasSemana.miercoles} 
            onChange={(checked) => handleDiaSemanaChange('miercoles', checked)} 
          />
          <CheckboxField 
            label="Jueves" 
            checked={diasSemana.jueves} 
            onChange={(checked) => handleDiaSemanaChange('jueves', checked)} 
          />
          <CheckboxField 
            label="Viernes" 
            checked={diasSemana.viernes} 
            onChange={(checked) => handleDiaSemanaChange('viernes', checked)} 
          />
          <CheckboxField 
            label="Sábado" 
            checked={diasSemana.sabado} 
            onChange={(checked) => handleDiaSemanaChange('sabado', checked)} 
          />
          <CheckboxField 
            label="Domingo" 
            checked={diasSemana.domingo} 
            onChange={(checked) => handleDiaSemanaChange('domingo', checked)} 
          />
        </div>
      </div>

      <div className="horarios-grupo">
        <div className="horario-campo">
          <SelectField
            label="Hora de inicio"
            placeholder="--:-- --"
            value={horaInicio}
            onChange={setHoraInicio}
            options={horariosOptions}
            disabled={loading}
          />
        </div>
        <div className="horario-campo">
          <SelectField
            label="Hora de término"
            placeholder="--:-- --"
            value={horaTermino}
            onChange={setHoraTermino}
            options={horariosOptions}
            disabled={loading}
          />
        </div>
      </div>

      <div className="fechas-grupo">
        <div className="fecha-campo">
          <div className="label">Desde</div>
          <div className="fecha-input-wrapper" ref={desdeFechaRef}>
            <div className="fecha-input-container">
              <input
                type="text" 
                className="input-fecha"
                value={fechaDesde ? formatDateForDisplay(fechaDesde) : ""}
                placeholder="dd/mm/aaaa"
                readOnly
                onClick={(e) => {
                  // Delegamos el clic en el input al botón del calendario
                  e.currentTarget.nextElementSibling.click();
                }}
              />
              <button 
                type="button" 
                className="fecha-calendario-icon" 
                onClick={() => {
                  // Creamos y mostramos el date picker nativo directamente con un click
                  const datePicker = document.createElement('input');
                  datePicker.type = 'date';
                  datePicker.style.position = 'fixed';
                  datePicker.style.opacity = '0';
                  datePicker.style.height = '0';
                  datePicker.style.padding = '0';
                  datePicker.style.border = 'none';
                  datePicker.min = new Date().toISOString().split('T')[0];
                  datePicker.value = fechaDesde || '';
                  
                  // Posicionar el elemento bajo el contenedor
                  const rect = desdeFechaRef.current.getBoundingClientRect();
                  datePicker.style.left = `${rect.left}px`;
                  datePicker.style.top = `${rect.bottom + 2}px`;
                  
                  // Agregar el picker al DOM y mostrarlo
                  document.body.appendChild(datePicker);
                  datePicker.focus();
                  datePicker.showPicker();
                  
                  // Manejar el cambio y limpiar
                  datePicker.addEventListener('change', (event) => {
                    setFechaDesde(event.target.value);
                    document.body.removeChild(datePicker);
                  });
                  
                  // Manejar cuando se cierra sin elegir
                  datePicker.addEventListener('blur', () => {
                    setTimeout(() => {
                      if (document.body.contains(datePicker)) {
                        document.body.removeChild(datePicker);
                      }
                    }, 300);
                  });
                }}
                aria-label="Abrir calendario"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="fecha-campo">
          <div className="label">Hasta</div>
          <div className="fecha-input-wrapper" ref={hastaFechaRef}>
            <div className="fecha-input-container">
              <input
                type="text" 
                className="input-fecha"
                value={fechaHasta ? formatDateForDisplay(fechaHasta) : ""}
                placeholder="dd/mm/aaaa"
                readOnly
                onClick={(e) => {
                  // Delegamos el clic en el input al botón del calendario
                  e.currentTarget.nextElementSibling.click();
                }}
              />
              <button 
                type="button" 
                className="fecha-calendario-icon" 
                onClick={() => {
                  // Creamos y mostramos el date picker nativo directamente con un click
                  const datePicker = document.createElement('input');
                  datePicker.type = 'date';
                  datePicker.style.position = 'fixed';
                  datePicker.style.opacity = '0';
                  datePicker.style.height = '0';
                  datePicker.style.padding = '0';
                  datePicker.style.border = 'none';
                  datePicker.min = fechaDesde || new Date().toISOString().split('T')[0];
                  datePicker.value = fechaHasta || '';
                  
                  // Posicionar el elemento bajo el contenedor
                  const rect = hastaFechaRef.current.getBoundingClientRect();
                  datePicker.style.left = `${rect.left}px`;
                  datePicker.style.top = `${rect.bottom + 2}px`;
                  
                  // Agregar el picker al DOM y mostrarlo
                  document.body.appendChild(datePicker);
                  datePicker.focus();
                  datePicker.showPicker();
                  
                  // Manejar el cambio y limpiar
                  datePicker.addEventListener('change', (event) => {
                    setFechaHasta(event.target.value);
                    document.body.removeChild(datePicker);
                  });
                  
                  // Manejar cuando se cierra sin elegir
                  datePicker.addEventListener('blur', () => {
                    setTimeout(() => {
                      if (document.body.contains(datePicker)) {
                        document.body.removeChild(datePicker);
                      }
                    }, 300);
                  });
                }}
                aria-label="Abrir calendario"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      
      {/* Renderizamos el footer personalizado con los tres botones */}
      <CustomFooter />
    </Modal>
  );
};

export default EditarHorario;
