import React, { useState, useEffect } from "react";
import axios from "axios";
import HorarioForm from "../../components/admin/HorarioForm";
import "./HorariosPage.css";

function HorariosPage() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [profesionales, setProfesionales] = useState([]);

  useEffect(() => {
    fetchHorarios();
    fetchProfesionales();
  }, []);

  const fetchHorarios = async () => {
    setLoading(true);
    try {
      // Como no hay endpoint para listar todos los horarios, simulamos con un array vacío por ahora
      // En producción, deberías crear un endpoint específico para listar todos los horarios
      setHorarios([]);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los horarios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfesionales = async () => {
    try {
      const response = await axios.get("/api/profesionales");
      setProfesionales(response.data);
    } catch (err) {
      console.error('Error cargando profesionales:', err);
    }
  };

  const formatHorarioSemanal = (horario) => {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return dias[horario.dia_semana - 1] || 'No especificado';
  };

  const renderHorariosTable = () => {
    if (loading) return <div className="loading">Cargando horarios...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (horarios.length === 0) return <div className="no-results">No se encontraron horarios configurados</div>;

    return (
      <div className="table-container">
        <table className="horarios-table">
          <thead>
            <tr>
              <th>Profesional</th>
              <th>Días</th>
              <th>Hora de inicio</th>
              <th>Hora de término</th>
              <th>Tipo de atención</th>
              <th>Consultorio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((horario, index) => (
              <tr key={index}>
                <td>{horario.profesional_nombre} {horario.profesional_apellido}</td>
                <td>{formatHorarioSemanal(horario)}</td>
                <td>{horario.hora_inicio}</td>
                <td>{horario.hora_termino}</td>
                <td>{horario.tipo_atencion}</td>
                <td>{horario.nro_consulta || 'No especificado'}</td>
                <td className="actions-cell">
                  <button className="btn-action btn-edit" title="Editar">
                    ✏️
                  </button>
                  <button className="btn-action btn-delete" title="Eliminar">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="horarios-container">
      <h1>Horarios de atención</h1>
      
      <div className="horarios-header">
        <div className="horarios-filters">
          {/* Aquí puedes agregar filtros si son necesarios */}
        </div>
        <button className="btn-agregar" onClick={() => setShowModal(true)}>
          + Agregar horario
        </button>
      </div>
      
      {renderHorariosTable()}
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Agregar horario de atención para un profesional</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <HorarioForm onSuccess={() => {
                setShowModal(false);
                fetchHorarios();
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HorariosPage;