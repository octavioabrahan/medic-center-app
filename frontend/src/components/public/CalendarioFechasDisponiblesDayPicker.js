import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';

registerLocale('es', es);

const CalendarioFechasDisponiblesDayPicker = ({ profesionalId, fechaSeleccionada, setFechaSeleccionada }) => {
  const [fechasDisponibles, setFechasDisponibles] = useState([]);

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
  }, [profesionalId]);

  return (
    <DatePicker
      selected={fechaSeleccionada}
      onChange={setFechaSeleccionada}
      includeDates={fechasDisponibles}
      inline
      locale="es"
      dateFormat="dd/MM/yyyy"
    />
  );
};

export default CalendarioFechasDisponiblesDayPicker;