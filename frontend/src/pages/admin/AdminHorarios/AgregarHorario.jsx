import React, { useState, useEffect } from 'react';
import './AgregarHorario.css';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid';
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
    { value: '3', label: 'Dr. Carlos Rodríguez' },
    { value: '4', label: 'Dra. Ana Silva' },
    { value: '5', label: 'Dr. Roberto Méndez' }
  ];

  const tiposAtencionOptions = [
    { value: '1', label: 'Consulta General' },
    { value: '2', label: 'Especialidad' },
    { value: '3', label: 'Control' },
    { value: '4', label: 'Examen' },
    { value: '5', label: 'Procedimiento' }
  ];

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
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      heading="Agregar horario de atención para un profesional"
      bodyText="Si un profesional atiende varios días a la semana, debes agregar cada día por separado. Ejemplo: si el profesional atiende lunes a las 8:00, miércoles a las 9:00 y viernes a las 10:00, debes crear tres horarios distintos, uno por cada día."
      primaryButtonText={formValido ? "Agregar" : ""}
      secondaryButtonText="Cancelar"
      onPrimaryClick={formValido ? handleAgregar : null}
      onSecondaryClick={onClose}
      size="large"
    >
      <SelectField
        label="Profesional"
        placeholder="Selecciona un profesional"
        value={profesional}
        onChange={setProfesional}
        options={profesionalesOptions}
      />

      <SelectField
        label="Tipo de atención"
        placeholder="Selecciona una opción"
        value={tipoAtencion}
        onChange={setTipoAtencion}
        options={tiposAtencionOptions}
      />

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
          />
        </div>
        <div className="horario-campo">
          <SelectField
            label="Hora de término"
            placeholder="--:-- --"
            value={horaTermino}
            onChange={setHoraTermino}
            options={horariosOptions}
          />
        </div>
      </div>

      <div className="fechas-grupo">
        <div className="fecha-campo">
          <label className="fecha-etiqueta">Desde</label>
          <div className="fecha-contenedor">
            <input
              type="text" 
              className="fecha-input"
              value={fechaDesde ? formatDateForDisplay(fechaDesde) : ""}
              placeholder="dd/mm/aaaa"
              onClick={(e) => {
                e.currentTarget.nextElementSibling.showPicker();
              }}
              readOnly
            />
            <input
              type="date"
              className="fecha-picker"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        <div className="fecha-campo">
          <label className="fecha-etiqueta">Hasta</label>
          <div className="fecha-contenedor">
            <input
              type="text" 
              className="fecha-input"
              value={fechaHasta ? formatDateForDisplay(fechaHasta) : ""}
              placeholder="dd/mm/aaaa"
              onClick={(e) => {
                e.currentTarget.nextElementSibling.showPicker();
              }}
              readOnly
            />
            <input
              type="date"
              className="fecha-picker"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              min={fechaDesde || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {!formValido && (
        <div className="botones-inferiores">
          <Button variant="primary" disabled={true}>
            Agregar
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default AgregarHorario;
