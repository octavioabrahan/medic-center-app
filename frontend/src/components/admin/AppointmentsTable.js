import React from 'react';

const AppointmentsTable = ({
  agendamientos,
  actualizarEstado,
  setMostrarHistorial,
  setHistorial,
  setHistorialDe
}) => {
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
  };

  return (
    <div className="citas-table-container">
      <table className="citas-table">
        <thead>
          <tr>
            <th>Fecha cita</th>
            <th>Paciente</th>
            <th>Cédula</th>
            <th>Categoría</th>
            <th>Profesional</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {agendamientos.map((a) => (
            <tr key={a.agendamiento_id} className={`cita-row ${a.status}`}>
              <td>{formatearFecha(a.fecha_agendada)}</td>
              <td>{a.paciente_nombre} {a.paciente_apellido}</td>
              <td>{a.cedula}</td>
              <td>{a.tipo_atencion}</td>
              <td>{a.profesional_nombre} {a.profesional_apellido}</td>
              <td>
                <span className={`estado-badge ${a.status}`}>
                  {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                </span>
              </td>
              <td className="actions-cell">
                <button
                  onClick={() => actualizarEstado(a.agendamiento_id, 'confirmada')}
                  className="action-btn confirm-btn"
                  title="Confirmar"
                >
                  ✓
                </button>
                <button
                  onClick={() => actualizarEstado(a.agendamiento_id, 'cancelada')}
                  className="action-btn cancel-btn"
                  title="Cancelar"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentsTable;