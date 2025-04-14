import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';

const CalendarioFechasDisponiblesDayPicker = ({ profesionalId, fechaSeleccionada, setFechaSeleccionada }) => {
  const [fechasDisponibles, setFechasDisponibles] = useState([]);

  const parseFechaLocal = (fechaStr) => {
    const [y, m, d] = fechaStr.split('-').map(Number);
    return new Date(y, m - 1, d); // mes 0-indexed
  };

  const formatDate = (input) => {
    const date = new Date(input);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

        const validas = horarios
          .filter(h => !canceladas.has(formatDate(h.fecha)))
          .map(h => ({
            fecha: formatDate(h.fecha),
            hora_inicio: h.hora_inicio,
            hora_termino: h.hora_termino
          }));

        const combinadas = [...validas, ...agregadas];
        setFechasDisponibles(combinadas);
      } catch (error) {
        console.error("Error cargando fechas o excepciones:", error);
      }
    };

    if (profesionalId) fetchFechas();
  }, [profesionalId]);

  const isFechaDisponible = (date) => {
    const f = formatDate(date);
    return fechasDisponibles.some(d => d.fecha === f);
  };

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
        selected={
          fechaSeleccionada?.fecha
            ? parseFechaLocal(fechaSeleccionada.fecha)
            : undefined
        }
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
