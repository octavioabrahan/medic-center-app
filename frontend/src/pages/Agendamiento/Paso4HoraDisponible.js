import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Paso4HoraDisponible.css';

const API = process.env.REACT_APP_API_URL;

const Paso4HoraDisponible = ({ onNext, onPrev, seleccion, fechaSeleccionada, setFechaSeleccionada }) => {
  const [fechasDisponibles, setFechasDisponibles] = useState([]);

  useEffect(() => {
    if (seleccion.idMedico) {
      fetch(`${API}/horarios/disponibles/${seleccion.idMedico}`)
        .then(res => res.json())
        .then(setFechasDisponibles)
        .catch(console.error);
    }
  }, [seleccion.idMedico]);

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const fecha = date.toISOString().split('T')[0];
      return !fechasDisponibles.includes(fecha);
    }
    return false;
  };

  return (
    <div className="paso paso4">
      <h2>Selecciona una fecha disponible</h2>

      {seleccion.idMedico ? (
        <Calendar
          onChange={setFechaSeleccionada}
          value={fechaSeleccionada}
          tileDisabled={tileDisabled}
        />
      ) : (
        <p>Selecciona primero un médico para cargar la disponibilidad.</p>
      )}

      <div className="acciones">
        <button onClick={onPrev}>Volver</button>
        <button onClick={onNext} disabled={!fechaSeleccionada}>Continuar</button>
      </div>
    </div>
  );
};

export default Paso4HoraDisponible;
