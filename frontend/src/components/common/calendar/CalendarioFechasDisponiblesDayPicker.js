import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';

const CalendarioFechasDisponiblesDayPicker = ({ profesionalId, fechaSeleccionada, setFechaSeleccionada }) => {
  const [fechasDisponibles, setFechasDisponibles] = useState([]);

  const parseFechaLocal = useCallback((fechaStr) => {
    const [y, m, d] = fechaStr.split('-').map(Number);
    return new Date(y, m - 1, d); // mes 0-indexed
  }, []);

  const formatDate = useCallback((input) => {
    const date = typeof input === 'string' ? parseFechaLocal(input) : input;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [parseFechaLocal]);  

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
            hora_termino: e.hora_termino,
            nro_consulta: e.nro_consulta
          }));

        const validas = horarios
          .filter(h => !canceladas.has(formatDate(h.fecha)))
          .map(h => ({
            fecha: formatDate(h.fecha),
            hora_inicio: h.hora_inicio,
            hora_termino: h.hora_termino,
            nro_consulta: h.nro_consulta
          }));

        const combinadas = [...validas, ...agregadas];

        const fechasConDateObj = combinadas.map(f => ({
          ...f,
          dateObj: parseFechaLocal(f.fecha)
        }));

        setFechasDisponibles(fechasConDateObj);
      } catch (error) {
        console.error("Error cargando fechas o excepciones:", error);
      }
    };

    if (profesionalId) fetchFechas();
  }, [profesionalId, formatDate, parseFechaLocal]);

  const isFechaDisponible = useCallback((date) => {
    return fechasDisponibles.some(d =>
      d.dateObj.getFullYear() === date.getFullYear() &&
      d.dateObj.getMonth() === date.getMonth() &&
      d.dateObj.getDate() === date.getDate()
    );
  }, [fechasDisponibles]);

  const handleSelect = useCallback((date) => {
    if (!date) return;
    const match = fechasDisponibles.find(d =>
      d.dateObj.getFullYear() === date.getFullYear() &&
      d.dateObj.getMonth() === date.getMonth() &&
      d.dateObj.getDate() === date.getDate()
    );
    if (match) {
      setFechaSeleccionada(match);
    }
  }, [fechasDisponibles, setFechaSeleccionada]);

  return (
    <div className="calendario-wrapper">
      <DayPicker
        mode="single"
        selected={fechaSeleccionada?.dateObj}
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