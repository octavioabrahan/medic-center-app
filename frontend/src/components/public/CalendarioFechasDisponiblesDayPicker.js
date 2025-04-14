import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';

const CalendarioFechasDisponiblesDayPicker = ({ fechaSeleccionada, setFechaSeleccionada, fechasDisponibles }) => {
  const disabledDays = (date) => {
    const fecha = date.toISOString().split('T')[0];
    return !fechasDisponibles.some(f => {
      const d = new Date(f);
      return d.toISOString().split('T')[0] === fecha;
    });
  };

  return (
    <div className="calendario-wrapper">
      <DayPicker
        mode="single"
        selected={fechaSeleccionada}
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
