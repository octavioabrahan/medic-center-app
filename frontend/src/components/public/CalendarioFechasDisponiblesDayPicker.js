import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';

const CalendarioFechasDisponiblesDayPicker = ({ profesionalId, fechaSeleccionada, setFechaSeleccionada }) => {
  const [fechasDisponibles, setFechasDisponibles] = useState([]);

  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const [resHorarios, resExcepciones] = await Promise.all([
          axios.get(`/api/horarios/fechas/${profesionalId}`),
          axios.get(`/api/excepciones/profesional/${profesionalId}`)
        ]);

        const fechasBase = resHorarios.data; // [{ fecha: '2025-04-07' }, ...]
        const excepciones = resExcepciones.data;

        const canceladas = new Set(
          excepciones
            .filter(e => e.estado === 'cancelado')
            .map(e => e.fecha)
        );

        const agregadas = excepciones
          .filter(e => e.estado === 'manual')
          .map(e => new Date(e.fecha));

        const filtradas = fechasBase
          .filter(f => !canceladas.has(f.fecha))
          .map(f => new Date(f.fecha));

        const finalDates = [...filtradas, ...agregadas];
        const unicas = Array.from(new Set(finalDates.map(d => d.toDateString())))
          .map(fechaStr => new Date(fechaStr));

        setFechasDisponibles(unicas);
      } catch (error) {
        console.error("Error cargando fechas o excepciones:", error);
      }
    };

    if (profesionalId) fetchFechas();
  }, [profesionalId]);

  const formatFecha = date => date.toISOString().split('T')[0];

  const disabledDays = date => {
    const fecha = formatFecha(date);
    return !fechasDisponibles.some(f => formatFecha(f) === fecha);
  };

  return (
    <div className="calendario-wrapper">
      <DayPicker
        mode="single"
        selected={fechaSeleccionada}
        onSelect={setFechaSeleccionada}
        disabled={disabledDays}
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
