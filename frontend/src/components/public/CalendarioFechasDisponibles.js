import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CalendarioFechasDisponibles = ({ profesionalId, onFechaSeleccionada }) => {
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  const obtenerDiasDisponibles = (horarios) => {
    const fechas = [];

    horarios.forEach(horario => {
      const {
        dia_semana,
        valido_desde,
        valido_hasta
      } = horario;

      let fechaInicio = new Date(valido_desde);
      const fechaFin = new Date(valido_hasta);

      while (fechaInicio <= fechaFin) {
        if (fechaInicio.getDay() === dia_semana) {
          fechas.push(new Date(fechaInicio));
        }
        fechaInicio.setDate(fechaInicio.getDate() + 1);
      }
    });

    return fechas;
  };

  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const [resHorarios, resExcepciones] = await Promise.all([
          axios.get(`/api/horarios/fechas/${profesionalId}`),
          axios.get(`/api/excepciones/profesional/${profesionalId}`)
        ]);

        const fechasBase = obtenerDiasDisponibles(resHorarios.data);
        const excepciones = resExcepciones.data;

        const canceladas = new Set(
          excepciones
            .filter(e => e.estado === 'cancelado')
            .map(e => new Date(e.fecha).toDateString())
        );

        const agregadas = excepciones
          .filter(e => e.estado === 'manual')
          .map(e => {
            const fecha = new Date(e.fecha);
            return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
          });

        // Filtrar las fechas base eliminando las canceladas
        const fechasFiltradas = fechasBase.filter(
          f => !canceladas.has(f.toDateString())
        );

        const todas = [...fechasFiltradas, ...agregadas];

        // Quitar duplicados
        const unicas = Array.from(new Set(todas.map(d => d.toDateString())))
          .map(str => new Date(str));

        // Ordenar por fecha
        unicas.sort((a, b) => a - b);

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
