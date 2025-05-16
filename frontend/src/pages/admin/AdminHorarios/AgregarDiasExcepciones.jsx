import React, { useState, useEffect } from 'react';
import './AgregarDiasExcepciones.css';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import SelectField from '../../../components/Inputs/SelectField';
import InputField from '../../../components/Inputs/InputField';
import axios from 'axios';

/**
 * Modal para agregar días específicos de atención para un profesional
 * @param {Object} props 
 * @param {boolean} props.isOpen - Controla si el modal está visible
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función que se llama después de agregar el día específico
 */
const AgregarDiasExcepciones = ({ isOpen, onClose, onSuccess }) => {
  // Estados para campos del formulario
  const [profesional, setProfesional] = useState('');
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaTermino, setHoraTermino] = useState('');
  const [motivo, setMotivo] = useState('');
  const [formValido, setFormValido] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para datos del backend
  const [profesionalesOptions, setProfesionalesOptions] = useState([]);
  const [diasDelMes, setDiasDelMes] = useState([]);

  // Meses para el dropdown
  const mesesOptions = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  // Años para el dropdown (año actual + 5 años)
  const aniosOptions = Array.from({ length: 6 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { value: year.toString(), label: year.toString() };
  });

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

  // Cargar profesionales al montar el componente
  useEffect(() => {
    const fetchProfesionales = async () => {
      try {
        const response = await axios.get('/api/profesionales');
        const profesionales = response.data.map(p => ({
          value: p.profesional_id.toString(),
          label: `${p.apellido}, ${p.nombre}`.toUpperCase()
        }));
        setProfesionalesOptions(profesionales);
      } catch (err) {
        console.error("Error al cargar profesionales:", err);
        setError("Error al cargar la lista de profesionales.");
      }
    };

    if (isOpen) {
      fetchProfesionales();
      
      // Establecer mes y año actual como valores predeterminados
      const hoy = new Date();
      setMes((hoy.getMonth() + 1).toString());
      setAnio(hoy.getFullYear().toString());
    }
  }, [isOpen]);

  // Generar calendario cuando cambia mes o año
  useEffect(() => {
    if (mes && anio) {
      generarCalendario(parseInt(mes), parseInt(anio));
    }
  }, [mes, anio]);

  // Validar el formulario
  useEffect(() => {
    setFormValido(
      profesional && 
      diaSeleccionado && 
      horaInicio && 
      horaTermino &&
      horaInicio < horaTermino &&
      motivo.trim() !== ''
    );
  }, [profesional, diaSeleccionado, horaInicio, horaTermino, motivo]);

  // Función para generar el calendario
  const generarCalendario = (mes, anio) => {
    const primerDia = new Date(anio, mes - 1, 1);
    const ultimoDia = new Date(anio, mes, 0);
    
    const diasTotales = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay() === 0 ? 7 : primerDia.getDay(); // Ajustamos para que lunes sea 1 y domingo sea 7
    
    // Días del mes anterior para completar la primera semana
    const diasMesAnterior = [];
    if (primerDiaSemana > 1) {
      const ultimoDiaMesAnterior = new Date(anio, mes - 1, 0);
      const totalDiasMesAnterior = ultimoDiaMesAnterior.getDate();
      
      for (let i = totalDiasMesAnterior - primerDiaSemana + 2; i <= totalDiasMesAnterior; i++) {
        diasMesAnterior.push({
          dia: i,
          esMesActual: false,
          fecha: new Date(anio, mes - 2, i)
        });
      }
    }
    
    // Días del mes actual
    const diasMesActual = Array.from({ length: diasTotales }, (_, i) => ({
      dia: i + 1,
      esMesActual: true,
      fecha: new Date(anio, mes - 1, i + 1)
    }));
    
    // Días del mes siguiente para completar hasta 35 (5 semanas) o 42 (6 semanas) días
    const diasMesSiguiente = [];
    const totalDias = diasMesAnterior.length + diasMesActual.length;
    const semanasTotales = Math.ceil((primerDiaSemana - 1 + diasTotales) / 7); // 5 o 6 semanas
    const diasNecesarios = semanasTotales * 7;
    const diasFaltantes = diasNecesarios - totalDias;
    
    for (let i = 1; i <= diasFaltantes; i++) {
      diasMesSiguiente.push({
        dia: i,
        esMesActual: false,
        fecha: new Date(anio, mes, i)
      });
    }
    
    // Combinar todos los días
    const todosLosDias = [...diasMesAnterior, ...diasMesActual, ...diasMesSiguiente];
    
    // Asegurarnos de que tengamos semanas completas
    while (todosLosDias.length % 7 !== 0) {
      const ultimoDia = todosLosDias.length;
      todosLosDias.push({
        dia: ultimoDia + 1,
        esMesActual: false,
        fecha: new Date(anio, mes, ultimoDia + 1 - diasMesActual.length - diasMesAnterior.length)
      });
    }
    
    // Agrupar por semanas (7 días por semana)
    const semanas = [];
    for (let i = 0; i < todosLosDias.length; i += 7) {
      semanas.push(todosLosDias.slice(i, i + 7));
    }
    
    setDiasDelMes(semanas);
  };

  // Manejar click en un día del calendario
  const handleDiaClick = (dia) => {
    setDiaSeleccionado(dia);
  };

  // Formatear fecha para mostrarla en formato ISO (YYYY-MM-DD)
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    
    return fecha.toISOString().split('T')[0];
  };

  // Confirmar la adición del día
  const handleConfirmar = async () => {
    if (!formValido) return;

    try {
      setLoading(true);
      setError(null);
      
      // Crear objeto con datos del formulario
      const excepcionData = {
        profesional_id: profesional,
        fecha: formatearFecha(diaSeleccionado.fecha),
        hora_inicio: horaInicio,
        hora_termino: horaTermino,
        motivo,
        tipo: "agregado" // Tipo agregado para día específico de atención
      };
      
      // Enviar al backend
      await axios.post('/api/excepciones', excepcionData);
      
      // Notificar éxito y cerrar
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error al agregar día específico:', err);
      setError(err.response?.data?.error || 'Error al agregar día específico. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      heading="Agregar día en la atención de un profesional"
      bodyText="Usa este formulario para agregar un día específico que un profesional atenderá."
      contentClassName="agregar-dias-excepciones"
      size="medium"
    >
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

      <div className="pick-a-day">
        <div className="month-and-year">
          <div className="select-field2">
            <SelectField
              label="Mes"
              value={mes}
              onChange={setMes}
              options={mesesOptions}
              disabled={loading}
            />
          </div>
          <div className="select-field2">
            <SelectField
              label="Año"
              value={anio}
              onChange={setAnio}
              options={aniosOptions}
              disabled={loading}
            />
          </div>
        </div>

        <div className="date-picker">
          <div className="weekdays">
            <div className="weekday-cell"><div>L</div></div>
            <div className="weekday-cell"><div>M</div></div>
            <div className="weekday-cell"><div>M</div></div>
            <div className="weekday-cell"><div>J</div></div>
            <div className="weekday-cell"><div>V</div></div>
            <div className="weekday-cell"><div>S</div></div>
            <div className="weekday-cell"><div>D</div></div>
          </div>

          {diasDelMes.map((semana, semanaIndex) => (
            <div className={`week-${semanaIndex + 1}`} key={`semana-${semanaIndex}`}>
              {semana.map((dia, diaIndex) => (
                <div 
                  key={`dia-${semanaIndex}-${diaIndex}`}
                  className={`calendar-day ${dia.esMesActual ? '' : 'other-month'} ${diaSeleccionado?.fecha.getTime() === dia.fecha.getTime() ? 'selected' : ''}`}
                  onClick={() => handleDiaClick(dia)}
                >
                  <div className={dia.esMesActual ? 'day2' : 'day'}>
                    {dia.dia}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="frame-35">
        <div className="select-field2">
          <SelectField
            label="Hora de inicio"
            placeholder="--:-- --"
            value={horaInicio}
            onChange={setHoraInicio}
            options={horariosOptions}
            disabled={loading || !diaSeleccionado}
          />
        </div>
        <div className="select-field2">
          <SelectField
            label="Hora de término"
            placeholder="--:-- --"
            value={horaTermino}
            onChange={setHoraTermino}
            options={horariosOptions}
            disabled={loading || !diaSeleccionado}
          />
        </div>
      </div>

      <div className="campo-completo">
        <InputField
          label="Motivo"
          placeholder=""
          value={motivo}
          onChange={setMotivo}
          disabled={loading || !diaSeleccionado}
        />
      </div>

      {error && (
        <div className="mensaje-error">
          {error}
        </div>
      )}

      <div className="button-group">
        <Button 
          variant="neutral" 
          onClick={onClose}
        >
          Cerrar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleConfirmar}
          disabled={!formValido || loading}
        >
          {loading ? "Procesando..." : "Confirmar"}
        </Button>
      </div>
    </Modal>
  );
};

export default AgregarDiasExcepciones;
