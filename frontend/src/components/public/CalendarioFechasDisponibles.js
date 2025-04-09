import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CalendarioFechasDisponibles = ({ profesionalId, onFechaSeleccionada }) => {
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  const generarFechasDesdeHorarios = (horarios) => {
    const fechas = [];

    horarios.forEach(horario => {
      const diaSemana = horario.dia_semana; // 0 domingo ... 6 sábado
      const desde = new Date(horario.valido_desde);
      const hasta = new Date(horario.valido_hasta);

      // Normaliza horas
      desde.setHours(0, 0, 0, 0);
      hasta.setHours(0, 0, 0, 0);

      let fechaActual = new Date(desde);

      while (fechaActual <= hasta) {
        if (fechaActual.getDay() === diaSemana) {
          fechas.push(new Date(fechaActual)); // clona fecha válida
        }
        fechaActual.setDate(fechaActual.getDate() + 1);
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

        const fechasBase = generarFechasDesdeHorarios(resHorarios.data);
        const excepciones = resExcepciones.data;

        const canceladasSet = new Set(
          excepciones
            .filter(e => e.estado === 'cancelado')
            .map(e => new Date(e.fecha).toDateString())
        );

        const agregadas = excepciones
          .filter(e => e.estado === 'manual')
          .map(e => {
            const f = new Date(e.fecha);
            return new Date(f.getFullYear(), f.getMonth(), f.getDate());
          });

        const filtradas = fechasBase.filter(
          f => !canceladasSet.has(f.toDateString())
        );

        const todas = [...filtradas, ...agregadas];

        const unicas = Array.from(new Set(todas.map(f => f.toDateString())))
          .map(str => new Date(str));

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
