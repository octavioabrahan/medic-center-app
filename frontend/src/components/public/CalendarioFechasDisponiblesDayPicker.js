import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';

const CalendarioFechasDisponiblesDayPicker = ({ profesionalId, fechaSeleccionada, setFechaSeleccionada }) => {
  const [fechasDisponibles, setFechasDisponibles] = useState([]);

  const formatDate = (input) => {
    const date = new Date(input);
    return date.toISOString().split('T')[0]; // yyyy-mm-dd
  };

  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const [resHorarios, resExcepciones] = await Promise.all([
          axios.get(`/api/horarios/fechas/${profesionalId}`),
          axios.get(`/api/excepciones/profesional/${profesionalId}`)
        ]);
  
        const horarios = resHorarios.data;
        const excepciones = resExcepciones.data;
  
        const canceladas = new Set(
          excepciones
            .filter(e => e.estado === 'cancelado')
            .map(e => formatDate(e.fecha))
        );
  
        const agregadas = excepciones
          .filter(e => e.estado === 'manual')
          .map(e => ({
            fecha: formatDate(e.fecha),
            hora_inicio: e.hora_inicio,
            hora_termino: e.hora_termino
          }));
  
        // Solo las fechas válidas que no estén canceladas
        const validas = horarios
          .filter(h => !canceladas.has(formatDate(h.fecha)))
          .map(h => ({
            fecha: formatDate(h.fecha),
            hora_inicio: h.hora_inicio,
            hora_termino: h.hora_termino
          }));
  
        const combinadas = [...validas, ...agregadas];
  
        // Guardar para validación y selección
        setFechasDisponibles(combinadas);
      } catch (error) {
        console.error("Error cargando fechas o excepciones:", error);
      }
    };
  
    if (profesionalId) fetchFechas();
  }, [profesionalId]);
  
  // Función para validar días habilitados
  const isFechaDisponible = (date) => {
    const f = formatDate(date);
    return fechasDisponibles.some(d => d.fecha === f);
  };
  
  // Función para seleccionar con hora
  const handleSelect = (date) => {
    if (!date) return;
    const f = formatDate(date);
    const match = fechasDisponibles.find(d => d.fecha === f);
    if (match) {
      setFechaSeleccionada(match);
    }
  };
  

  return (
    <div className="calendario-wrapper">
      <DayPicker
        mode="single"
        selected={fechaSeleccionada?.fecha ? new Date(fechaSeleccionada.fecha) : undefined}
        onSelect={handleSelect}
        disabled={(date) => !isFechaDisponible(date)}
        locale={es}
        modifiersClassNames={{
          selected: 'rdp-selected',
          disabled: 'rdp-disabled',
          today: 'rdp-today'
        }}
        className="rdp"
      />
    </div>
  );
};

export default CalendarioFechasDisponiblesDayPicker;
