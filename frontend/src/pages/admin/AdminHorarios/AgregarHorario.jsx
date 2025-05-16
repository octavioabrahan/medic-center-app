import React, { useState, useEffect } from 'react';
import './AgregarHorario.css';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import SelectField from '../../../components/Inputs/SelectField';
import CheckboxField from '../../../components/Inputs/CheckboxField';

/**
 * Modal para agregar horarios de profesionales
 * @param {Object} props 
 * @param {boolean} props.isOpen - Controla si el modal está visible
 * @param {Function} props.onClose - Función para cerrar el modal
 */
const AgregarHorario = ({ isOpen, onClose }) => {
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

  // Opciones para selects
  const profesionalesOptions = [
    { value: '1', label: 'Dr. Juan Pérez' },
    { value: '2', label: 'Dra. María González' },
    // Más opciones...
  ];

  const tiposAtencionOptions = [
    { value: '1', label: 'Consulta General' },
    { value: '2', label: 'Especialidad' },
    // Más opciones...
  ];

  const horariosOptions = [
    { value: '08:00', label: '08:00 AM' },
    { value: '09:00', label: '09:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '14:00', label: '02:00 PM' },
    { value: '15:00', label: '03:00 PM' },
    { value: '16:00', label: '04:00 PM' },
    { value: '17:00', label: '05:00 PM' },
    // Más opciones...
  ];

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

  // Manejar agregar horario
  const handleAgregar = () => {
    // Lógica para guardar el horario
    console.log({
      profesional,
      tipoAtencion,
      diasSemana,
      horaInicio,
      horaTermino,
      fechaDesde,
      fechaHasta
    });
    
    // Cerrar modal después de guardar
    onClose();
  };

  return (
    <div className={`agregar-horario-modal ${isOpen ? 'show' : ''}`}>
      <div className="modal-body" onClick={(e) => e.stopPropagation()}>
        <div className="text">
          <div className="agregar-horario-title">
            Agregar horario de atención para un profesional
          </div>
          <div className="agregar-horario-description">
            Si un profesional atiende varios días a la semana, debes agregar cada día
            por separado. Ejemplo: si el profesional atiende lunes a las 8:00,
            miércoles a las 9:00 y viernes a las 10:00, debes crear tres horarios
            distintos, uno por cada día.
          </div>
        </div>
        
        <div className="select-field-container">
          <div className="label">Profesional</div>
          <div className="select">
            <select 
              className="value-select"
              value={profesional} 
              onChange={(e) => setProfesional(e.target.value)}
            >
              <option value="" disabled>Selecciona un profesional</option>
              {profesionalesOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="heroicons-micro-chevron-down" width={16} height={16} />
          </div>
        </div>

        <div className="select-field-container">
          <div className="label">Tipo de atención</div>
          <div className="select">
            <select 
              className="value-select"
              value={tipoAtencion} 
              onChange={(e) => setTipoAtencion(e.target.value)}
            >
              <option value="" disabled>Selecciona una opción</option>
              {tiposAtencionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="heroicons-micro-chevron-down" width={16} height={16} />
          </div>
        </div>

        <div className="select-field-container">
          <div className="dia-de-la-semana">Día de la semana</div>
          <div className="checkbox-field-container">
            <CheckboxField 
              label="Lunes" 
              checked={diasSemana.lunes} 
              onChange={(checked) => handleDiaSemanaChange('lunes', checked)} 
            />
          </div>
          <div className="checkbox-field-container">
            <CheckboxField 
              label="Martes" 
              checked={diasSemana.martes} 
              onChange={(checked) => handleDiaSemanaChange('martes', checked)} 
            />
          </div>
          <div className="checkbox-field-container">
            <CheckboxField 
              label="Miércoles" 
              checked={diasSemana.miercoles} 
              onChange={(checked) => handleDiaSemanaChange('miercoles', checked)} 
            />
          </div>
          <div className="checkbox-field-container">
            <CheckboxField 
              label="Jueves" 
              checked={diasSemana.jueves} 
              onChange={(checked) => handleDiaSemanaChange('jueves', checked)} 
            />
          </div>
          <div className="checkbox-field-container">
            <CheckboxField 
              label="Viernes" 
              checked={diasSemana.viernes} 
              onChange={(checked) => handleDiaSemanaChange('viernes', checked)} 
            />
          </div>
          <div className="checkbox-field-container">
            <CheckboxField 
              label="Sábado" 
              checked={diasSemana.sabado} 
              onChange={(checked) => handleDiaSemanaChange('sabado', checked)} 
            />
          </div>
          <div className="checkbox-field-container">
            <CheckboxField 
              label="Domingo" 
              checked={diasSemana.domingo} 
              onChange={(checked) => handleDiaSemanaChange('domingo', checked)} 
            />
          </div>
        </div>

        <div className="frame-35">
          <div className="select-field-container select-field2">
            <div className="label">Hora de inicio</div>
            <div className="select">
              <select 
                className="value-select"
                value={horaInicio} 
                onChange={(e) => setHoraInicio(e.target.value)}
              >
                <option value="" disabled>--:-- --</option>
                {horariosOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="heroicons-micro-chevron-down" width={16} height={16} />
            </div>
          </div>
          
          <div className="select-field-container select-field2">
            <div className="label">Hora de término</div>
            <div className="select">
              <select 
                className="value-select"
                value={horaTermino} 
                onChange={(e) => setHoraTermino(e.target.value)}
              >
                <option value="" disabled>--:-- --</option>
                {horariosOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="heroicons-micro-chevron-down" width={16} height={16} />
            </div>
          </div>
        </div>

        <div className="frame-36">
          <div className="select-field-container select-field2">
            <div className="label">Desde</div>
            <div className="select">
              <input
                type="date"
                className="value-select"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                placeholder="dd/mm/aaaa"
              />
              <ChevronDownIcon className="heroicons-micro-chevron-down" width={16} height={16} />
            </div>
          </div>
          
          <div className="select-field-container select-field2">
            <div className="label">Hasta</div>
            <div className="select">
              <input
                type="date"
                className="value-select"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                placeholder="dd/mm/aaaa"
              />
              <ChevronDownIcon className="heroicons-micro-chevron-down" width={16} height={16} />
            </div>
          </div>
        </div>

        <div className="button-group">
          <button 
            className="cancel-button" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className={`agregar-button ${formValido ? 'enabled' : 'disabled'}`} 
            onClick={handleAgregar}
            disabled={!formValido}
          >
            Agregar
          </button>
        </div>
        
        <div className="icon-button" onClick={onClose}>
          <XMarkIcon className="x" width={20} height={20} />
        </div>
      </div>
    </div>
  );
};

export default AgregarHorario;
