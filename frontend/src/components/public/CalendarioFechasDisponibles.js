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
        const res = await axios.get(`/api/horarios/fechas/${profesionalId}`);
        const fechasBase = res.data;

        const exRes = await axios.get(`/api/excepciones/profesional/${profesionalId}`);
        const excepciones = exRes.data;

        const canceladas = excepciones
          .filter(e => e.estado === 'cancelado')
          .map(e => e.fecha);

        const agregadas = excepciones
          .filter(e => e.estado === 'manual')
          .map(e => {
            const [year, month, day] = e.fecha.split('-').map(Number);
            return new Date(year, month - 1, day);
          });

        const fechasFiltradas = fechasBase
          .filter(f => !canceladas.includes(f.fecha))
          .map(f => {
            const [year, month, day] = f.fecha.split('-').map(Number);
            return new Date(year, month - 1, day);
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
