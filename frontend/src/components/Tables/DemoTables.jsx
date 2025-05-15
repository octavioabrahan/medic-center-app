import React from 'react';
import Tables from './Tables';

const DemoTables = () => {
  const headers = ['Fecha cita', 'Paciente', 'Cédula', 'Categoría', 'Profesional', 'Estado'];
  const rows = [
    ['Lun 14 abril 08:00 AM', 'Mariana Suárez', '21345678', 'Consulta', 'Eva Páez', 'Confirmada'],
    ['Lun 14 abril 09:30 AM', 'Joaquín Lira', '19123456-1', 'Estudio', 'Juan Romero', 'Pendiente'],
    ['Mar 15 abril 10:00 AM', 'Ana Romero', '23456789', 'Estudio', 'Carolina Paz', 'Pendiente'],
    ['Mar 15 abril 08:00 AM', 'Laura Hernández', '20112233', 'Estudio', 'Eva Páez', 'Cancelada'],
    ['Mié 16 abril 08:00 AM', 'Luis Martínez', '19876543', 'Consulta', 'José Méndez', 'Confirmada'],
    ['Mié 16 abril 08:00 AM', 'Felipe Guzmán', '18999888', 'Consulta', 'Eva Páez', 'Confirmada'],
    ['Jue 17 abril 08:00 AM', 'Gabriela Torres', '21447874', 'Estudio', 'Carolina Paz', 'Pendiente'],
    ['Jue 17 abril 08:00 AM', 'José Ramírez', '19881234', 'Estudio', 'Juan Romero', 'Confirmada'],
    ['Vie 19 abril 10:30 AM', 'Karina León', '17444555-2', 'Consulta', 'José Méndez', 'Cancelada'],
  ];

  return (
    <div>
      <h1>Demo Tables</h1>
      <Tables headers={headers} rows={rows} />
    </div>
  );
};

export default DemoTables;
