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

        const fechasBase = resHorarios.data.map(f => formatDate(f.fecha));
        const excepciones = resExcepciones.data;

        const canceladas = new Set(
          excepciones
            .filter(e => e.estado === 'cancelado')
            .map(e => formatDate(e.fecha))
        );

        const agregadas = excepciones
          .filter(e => e.estado === 'manual')
          .map(e => formatDate(e.fecha));

        const validas = fechasBase.filter(fecha => !canceladas.has(fecha));
        const unicas = Array.from(new Set([...validas, ...agregadas]));

        const fechasComoDate = unicas.map(f => new Date(f));
        setFechasDisponibles(fechasComoDate);
      } catch (error) {
        console.error("Error cargando fechas o excepciones:", error);
      }
    };

    if (profesionalId) fetchFechas();
  }, [profesionalId]);

  const disabledDays = (date) => {
    const fecha = date.toISOString().split('T')[0];
    return !fechasDisponibles.some(f => f.toISOString().split('T')[0] === fecha);
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
