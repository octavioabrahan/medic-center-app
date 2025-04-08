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
        const fechas = res.data.map(f => {
          const fechaHora = new Date(`${f.fecha}T${f.hora_inicio}`);
          // Usamos solo la fecha sin hora para el calendario
          return new Date(fechaHora.getFullYear(), fechaHora.getMonth(), fechaHora.getDate());
        });
        setFechasDisponibles(fechas);
      } catch (error) {
        console.error("Error cargando fechas:", error);
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
