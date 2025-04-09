import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CalendarioFechasDisponibles = ({ profesionalId, onFechaSeleccionada }) => {
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

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
          .map(e => {
            const [y, m, d] = e.fecha.split('-').map(Number);
            return new Date(y, m - 1, d);
          });

        const fechasFiltradas = fechasBase
          .filter(f => !canceladas.has(f.fecha))
          .map(f => {
            const [y, m, d] = f.fecha.split('-').map(Number);
            return new Date(y, m - 1, d);
          });

        const finalDates = [...fechasFiltradas, ...agregadas];

        const unicas = Array.from(new Set(finalDates.map(d => d.toDateString())))
          .map(fechaStr => new Date(fechaStr));

        setFechasDisponibles(unicas);
      } catch (error) {
        console.error("Error cargando fechas o excepciones:", error);
      }
    };

    if (profesionalId) fetchFechas();
  }, [profesionalId]);

  return (
    <div>
      <label>Seleccione fecha y hora disponible:</label>
      <DatePicker
        selected={fechaSeleccionada}
        onChange={date => {
          setFechaSeleccionada(date);
          onFechaSeleccionada(date);
        }}
        includeDates={fechasDisponibles}
        placeholderText="Seleccione fecha"
        dateFormat="dd/MM/yyyy"
      />
    </div>
  );
};

export default CalendarioFechasDisponibles;
