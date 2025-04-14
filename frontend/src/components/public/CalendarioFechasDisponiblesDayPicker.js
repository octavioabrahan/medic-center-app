import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';

const CalendarioFechasDisponiblesDayPicker = ({ fechasDisponibles = [], fechaSeleccionada, setFechaSeleccionada }) => {
  // Convertimos las fechas en string a Date
  const fechasHabilitadas = fechasDisponibles.map(fecha => new Date(fecha));

  // Deshabilitamos todos los días que no estén en la lista de fechas disponibles
  const disabledDays = [
    {
      before: new Date(), // opcional, por si no se quiere agendar en días pasados
    },
    date => !fechasHabilitadas.some(f => f.toDateString() === date.toDateString()),
  ];

  return (
    <div className="calendario-wrapper">
      <DayPicker
        mode="single"
        selected={fechaSeleccionada ? new Date(fechaSeleccionada) : undefined}
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
