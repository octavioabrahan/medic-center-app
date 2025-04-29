import React from 'react';

const ModalHistorial = ({ historial, historialDe, cerrarHistorial }) => {
  return (
    <div className="historial-modal">
      <div className="historial-content">
        <h3>Historial de Agendamiento #{historialDe}</h3>
        <table className="historial-table">
          <thead>
            <tr>
              <th>Anterior</th>
              <th>Nuevo</th>
              <th>Quién</th>
              <th>Cuándo</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((h) => (
              <tr key={h.historial_id}>
                <td>{h.estado_anterior}</td>
                <td>{h.estado_nuevo}</td>
                <td>{h.cambiado_por}</td>
                <td>{new Date(h.fecha).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="historial-actions">
          <button onClick={cerrarHistorial} className="close-btn">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalHistorial;