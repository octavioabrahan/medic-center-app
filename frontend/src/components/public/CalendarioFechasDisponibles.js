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
          .map(e => new Date(e.fecha));

        const fechasFiltradas = fechasBase
          .filter(f => !canceladas.includes(f.fecha))
          .map(f => new Date(f.fecha));

        const finalDates = [...fechasFiltradas, ...agregadas];

        const unicas = Array.from(new Set(finalDates.map(d => d.toISOString().split('T')[0])))
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
