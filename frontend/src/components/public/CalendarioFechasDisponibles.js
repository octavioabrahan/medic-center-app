import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CalendarioFechasDisponibles = ({ profesionalId, onFechaSeleccionada }) => {
  const [fechas, setFechas] = useState([]);

  useEffect(() => {
    const cargarFechas = async () => {
      try {
        const res = await axios.get(`/api/horarios/fechas/${profesionalId}`);
        const fechasFiltradas = res.data
          .map(f => new Date(f))
          .filter(date => date >= new Date()); // Solo futuras
        setFechas(fechasFiltradas);
      } catch (error) {
        console.error('Error al cargar fechas disponibles:', error);
      }
    };
    if (profesionalId) {
      cargarFechas();
    }
  }, [profesionalId]);

  return (
    <div>
      <label>Seleccione fecha y hora disponible:</label>
      <DatePicker
        selected={null}
        onChange={(fecha) => onFechaSeleccionada(fecha)}
        includeDates={fechas}
        placeholderText="Seleccione fecha y hora"
        dateFormat="dd/MM/yyyy"
      />
    </div>
  );
};

export default CalendarioFechasDisponibles;
