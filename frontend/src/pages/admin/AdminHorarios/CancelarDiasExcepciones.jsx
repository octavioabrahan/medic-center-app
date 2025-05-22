import React, { useState, useEffect } from 'react';
import './CancelarDiasExcepciones.css';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import SelectField from '../../../components/Inputs/SelectField';
import InputField from '../../../components/Inputs/InputField';
import axios from 'axios';

/**
 * Modal para cancelar días específicos de atención para un profesional
 * @param {Object} props 
 * @param {boolean} props.isOpen - Controla si el modal está visible
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función que se llama después de cancelar el día específico
 */
const CancelarDiasExcepciones = ({ isOpen, onClose, onSuccess }) => {
  // Estados para campos del formulario
  const [profesional, setProfesional] = useState('');
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [formValido, setFormValido] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para datos del backend
  const [profesionalesOptions, setProfesionalesOptions] = useState([]);
  const [diasDelMes, setDiasDelMes] = useState([]);
  const [diasDisponibles, setDiasDisponibles] = useState([]);

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

  // Cargar profesionales al montar el componente
  useEffect(() => {
    const fetchProfesionales = async () => {
      try {
        console.log('Cargando profesionales...');
        const response = await axios.get('/api/profesionales');
        console.log('Profesionales recibidos:', response.data);
        const profesionales = response.data.map(p => ({
          value: p.profesional_id.toString(),
          label: `${p.nombre} ${p.apellido}`
        }));
        setProfesionalesOptions(profesionales);
      } catch (err) {
        console.error("Error al cargar profesionales:", err);
        setError("Error al cargar la lista de profesionales.");
      }
    };

    if (isOpen) {
      // Resetear estados primero
      setProfesional('');
      setDiaSeleccionado(null);
      setMotivo('');
      setDiasDisponibles([]);
      setError(null);
      setDiasDelMes([]);
      
      // Luego inicializar con valores predeterminados
      const hoy = new Date();
      setMes((hoy.getMonth() + 1).toString());
      setAnio(hoy.getFullYear().toString());
      
      // Finalmente cargar datos
      fetchProfesionales();
    }
  }, [isOpen]);

  // Cargar días disponibles cuando cambia el profesional, mes o año
  useEffect(() => {
    if (profesional && mes && anio) {
      cargarDiasDisponibles();
    } else {
      setDiasDisponibles([]);
    }
  }, [profesional, mes, anio]);
  
  // Generar calendario cuando cambia mes, año o diasDisponibles
  useEffect(() => {
    if (mes && anio) {
      generarCalendario(parseInt(mes), parseInt(anio));
    }
  }, [mes, anio, diasDisponibles]);

  // Validar el formulario
  useEffect(() => {
    setFormValido(
      profesional && 
      diaSeleccionado && 
      motivo.trim() !== ''
    );
  }, [profesional, diaSeleccionado, motivo]);

  // Función para cargar los días disponibles para cancelar
  const cargarDiasDisponibles = async () => {
    try {
      // Obtener horarios regulares y excepciones ya existentes para este profesional
      const [horariosResp, excepcionesResp] = await Promise.all([
        axios.get(`/api/horarios/profesional/${profesional}`),
        axios.get(`/api/excepciones/profesional/${profesional}`)
      ]);
      
      const horarios = horariosResp.data || [];
      const excepciones = excepcionesResp.data || [];
      
      // Mes y año seleccionados
      const mesNum = parseInt(mes);
      const anioNum = parseInt(anio);
      
      // Obtener días de la semana que atiende el profesional
      const diasAtencion = new Set();
      
      // Mapeamos los días de la semana que el profesional atiende según su horario regular
      horarios.forEach(horario => {
        console.log('Procesando horario:', horario);
        
        // Si dia_semana es un string JSON, parsearlo
        if (typeof horario.dia_semana === 'string' && horario.dia_semana.startsWith('[')) {
          try {
            const diasArray = JSON.parse(horario.dia_semana);
            diasArray.forEach(dia => {
              // Asegurarse de que es un número
              const diaNumerado = parseInt(dia, 10);
              if (!isNaN(diaNumerado)) {
                diasAtencion.add(diaNumerado);
              }
            });
          } catch (error) {
            console.error('Error al parsear dia_semana como JSON:', error);
          }
        }
        // Si dia_semana es un array
        else if (horario.dia_semana && Array.isArray(horario.dia_semana)) {
          horario.dia_semana.forEach(dia => {
            const diaNumerado = parseInt(dia, 10);
            if (!isNaN(diaNumerado)) {
              diasAtencion.add(diaNumerado);
            }
          });
        } 
        // Si dia_semana es un número o string numérico
        else if (horario.dia_semana !== undefined) {
          const diaNumerado = parseInt(horario.dia_semana, 10);
          if (!isNaN(diaNumerado)) {
            diasAtencion.add(diaNumerado);
          }
        }
      });
      
      // Crear un conjunto de fechas canceladas (para no mostrarlas como disponibles)
      const fechasCanceladas = new Set();
      
      // Agregamos las fechas que ya están canceladas
      excepciones.forEach(excepcion => {
        if (excepcion.tipo === 'cancelado') {
          fechasCanceladas.add(excepcion.fecha);
        }
      });
      
      // Agregamos las fechas de excepciones manuales (días especiales agregados)
      const fechasAgregadas = new Set();
      excepciones.forEach(excepcion => {
        if (excepcion.tipo === 'agregado') {
          fechasAgregadas.add(excepcion.fecha);
        }
      });
      
      // Debug: log horarios y dias de atención
      console.log('Horarios del profesional:', horarios);
      console.log('Días de atención:', [...diasAtencion]);
      
      // Obtener todos los días del mes que caen en días de atención
      const diasDisponiblesArr = [];
      const primerDia = new Date(anioNum, mesNum - 1, 1);
      const ultimoDia = new Date(anioNum, mesNum, 0);
      const totalDias = ultimoDia.getDate();
      
      for (let dia = 1; dia <= totalDias; dia++) {
        const fecha = new Date(anioNum, mesNum - 1, dia);
        const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay(); // Convertir domingo (0) a 7
        const fechaStr = fecha.toISOString().split('T')[0];
        
        // Verificar si es un día de atención regular o un día agregado manualmente, y no está cancelado
        if ((diasAtencion.has(diaSemana) || fechasAgregadas.has(fechaStr)) && !fechasCanceladas.has(fechaStr)) {
          diasDisponiblesArr.push(fechaStr);
        }
      }
      
      console.log('Días disponibles para cancelar:', diasDisponiblesArr);
      setDiasDisponibles(diasDisponiblesArr);
    } catch (err) {
      console.error("Error al cargar días disponibles:", err);
      setError("Error al cargar los días disponibles para cancelar.");
    }
  };

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
        const fecha = new Date(anio, mes - 2, i);
        diasMesAnterior.push({
          dia: i,
          esMesActual: false,
          fecha: fecha,
          cancelable: false
        });
      }
    }
    
    // Días del mes actual
    const diasMesActual = Array.from({ length: diasTotales }, (_, i) => {
      const fecha = new Date(anio, mes - 1, i + 1);
      
      // Formato ISO YYYY-MM-DD para comparar con diasDisponibles
      const fechaStr = fecha.toISOString().split('T')[0];
      
      return {
        dia: i + 1,
        esMesActual: true,
        fecha: fecha,
        cancelable: diasDisponibles.includes(fechaStr)
      };
    });
    
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
        fecha: new Date(anio, mes, i),
        cancelable: false
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
        fecha: new Date(anio, mes, ultimoDia + 1 - diasMesActual.length - diasMesAnterior.length),
        cancelable: false
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
    if (dia.cancelable) {
      setDiaSeleccionado(dia);
    }
  };

  // Formatear fecha para mostrarla en formato ISO (YYYY-MM-DD)
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    
    return fecha.toISOString().split('T')[0];
  };
  
  // Función para depuración
  useEffect(() => {
    if (diasDisponibles.length > 0) {
      console.log('Días disponibles actualizados:', diasDisponibles);
    }
  }, [diasDisponibles]);

  // Confirmar la cancelación del día
  const handleConfirmar = async () => {
    if (!formValido) return;

    try {
      setLoading(true);
      setError(null);
      
      // Crear objeto con datos del formulario
      const excepcionData = {
        profesional_id: profesional,
        fecha: formatearFecha(diaSeleccionado.fecha),
        motivo,
        tipo: "cancelado" // Tipo cancelado para día específico que no atenderá
      };
      
      // Enviar al backend
      await axios.post('/api/excepciones', excepcionData);
      
      // Notificar éxito y cerrar
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error al cancelar día específico:', err);
      setError(err.response?.data?.error || 'Error al cancelar día específico. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Restablecer el día seleccionado cuando cambia el profesional o el mes/año
  useEffect(() => {
    setDiaSeleccionado(null);
  }, [profesional, mes, anio]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      heading="Cancelar día en la atención de un profesional"
      bodyText="Usa este formulario para cancelar un día específico que un profesional no atenderá."
      contentClassName="cancelar-dias-excepciones"
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

        {profesional && (
          <div className="calendar-info">
            <p>Seleccione una fecha en la que el profesional atienda regularmente para cancelarla</p>
            <p><span className="dia-cancelable-example"></span> Días disponibles para cancelar</p>
          </div>
        )}

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

          {profesional && diasDisponibles.length === 0 ? (
            <div className="no-dias-disponibles">
              No hay días disponibles para cancelar en este mes.
            </div>
          ) : (
            diasDelMes.map((semana, semanaIndex) => (
              <div className={`week-${semanaIndex + 1}`} key={`semana-${semanaIndex}`}>
                {semana.map((dia, diaIndex) => (
                  <div 
                    key={`dia-${semanaIndex}-${diaIndex}`}
                    className={`calendar-day 
                      ${dia.esMesActual ? '' : 'other-month'} 
                      ${dia.cancelable ? 'cancelable' : 'not-cancelable'}
                      ${diaSeleccionado?.fecha.getTime() === dia.fecha.getTime() ? 'selected' : ''}`}
                    onClick={() => dia.cancelable && handleDiaClick(dia)}
                    title={dia.cancelable ? "Disponible para cancelar" : "No disponible para cancelar"}
                  >
                    <div className={
                      dia.esMesActual 
                        ? (dia.cancelable ? 'day-cancelable' : 'day-normal') 
                        : 'day-other-month'
                    }>
                      {dia.dia}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="campo-completo motivo-field">
        <InputField
          label="Motivo"
          placeholder="Ingrese el motivo de la cancelación"
          value={motivo}
          onChange={setMotivo}
          disabled={loading || !diaSeleccionado}
          style={{ width: "100%" }}
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

export default CancelarDiasExcepciones;