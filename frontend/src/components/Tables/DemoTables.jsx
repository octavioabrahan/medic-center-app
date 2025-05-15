import React from 'react';
import Tables from './Tables';
import { HeaderCell, Cell } from './index';
import './Tables.css';

const DemoTables = () => {
  // Datos para la tabla de citas
  const headers = ['Fecha cita', 'Paciente', 'Cédula', 'Categoría', 'Profesional', 'Estado', 'Acciones'];
  const rows = [
    ['Lun 14 abril 08:00 AM', 'Mariana Suárez', '21345678', 'Consulta', 'Eva Páez', 'Confirmada', ''],
    ['Lun 14 abril 09:30 AM', 'Joaquín Lira', '19123456-1', 'Estudio', 'Juan Romero', 'Pendiente', ''],
    ['Mar 15 abril 10:00 AM', 'Ana Romero', '23456789', 'Estudio', 'Carolina Paz', 'Pendiente', ''],
    ['Mar 15 abril 08:00 AM', 'Laura Hernández', '20112233', 'Estudio', 'Eva Páez', 'Cancelada', ''],
    ['Mié 16 abril 08:00 AM', 'Luis Martínez', '19876543', 'Consulta', 'José Méndez', 'Confirmada', ''],
  ];

  // Renderizado personalizado de celdas
  const renderCustomCell = (cell, cellIndex, rowIndex) => {
    // Renderizado personalizado para la columna de estado
    if (cellIndex === 5) {
      let badgeClass = 'estado-badge ';
      switch (cell.toLowerCase()) {
        case 'confirmada':
          badgeClass += 'estado-confirmada';
          break;
        case 'pendiente':
          badgeClass += 'estado-pendiente';
          break;
        case 'cancelada':
          badgeClass += 'estado-cancelada';
          break;
        default:
          break;
      }

      return (
        <div className="text">
          <div className={badgeClass}>{cell}</div>
        </div>
      );
    }

    // Renderizado personalizado para la columna de acciones
    if (cellIndex === 6) {
      return (
        <div className="text acciones-container">
          <button className="accion-btn editar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
            </svg>
          </button>
          <button className="accion-btn eliminar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      );
    }

    // Por defecto, mostrar la celda normal
    return (
      <div className="text">
        <div className="text2">{cell}</div>
      </div>
    );
  };

  return (
    <div className="demo-page">
      <h1>Componentes de Tablas</h1>
      <p className="demo-descripcion">
        Esta página muestra ejemplos de uso de los componentes de tabla disponibles.
      </p>

      <section className="demo-section">
        <h2>Tabla de Citas con Estilos Personalizados</h2>
        <p>Ejemplo de tabla con estados visuales y botones de acción.</p>
        <div className="demo-component">
          <Tables 
            headers={headers} 
            rows={rows} 
            renderCustomCell={renderCustomCell}
          />
        </div>
      </section>

      <section className="demo-section">
        <h2>Componentes Individuales</h2>
        <p>Uso de componentes HeaderCell y Cell de forma individual:</p>
        <div className="demo-component">
          <div className="tabla-ejemplo-individual">
            <div className="table">
              <div className="table-header" style={{ display: 'flex', width: '100%' }}>
                <HeaderCell>Nombre del Paciente</HeaderCell>
                <HeaderCell>Fecha de Atención</HeaderCell>
              </div>
              <div className="table-body">
                <div className="table-row" style={{ display: 'flex', width: '100%' }}>
                  <Cell>Mariana Suárez</Cell>
                  <Cell>15/05/2025</Cell>
                </div>
                <div className="table-row" style={{ display: 'flex', width: '100%' }}>
                  <Cell>Luis Gómez</Cell>
                  <Cell>16/05/2025</Cell>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemoTables;
