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
  const [activeTab, setActiveTab] = useState("profesionales");
  const [currentHorario, setCurrentHorario] = useState(null);

  useEffect(() => {
    fetchHorarios();
    fetchProfesionales();
  }, []);

  const fetchHorarios = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/horarios");
      setHorarios(response.data);
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

  const handleEditHorario = (horario) => {
    setCurrentHorario(horario);
    setShowModal(true);
  };

  const handleDeleteHorario = async (horarioId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      try {
        await axios.delete(`/api/horarios/${horarioId}`);
        fetchHorarios();
      } catch (err) {
        console.error('Error eliminando horario:', err);
        alert('Hubo un error al eliminar el horario');
      }
    }
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
              <th>Tipo de atención</th>
              <th>Días</th>
              <th>Hora de inicio</th>
              <th>Hora de término</th>
              <th>Consultorio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((horario) => (
              <tr key={horario.id_horario}>
                <td>{horario.profesional_nombre} {horario.profesional_apellido}</td>
                <td>{horario.tipo_atencion}</td>
                <td>{formatHorarioSemanal(horario)}</td>
                <td>{horario.hora_inicio?.slice(0, 5) || ""}</td>
                <td>{horario.hora_termino?.slice(0, 5) || ""}</td>
                <td>{horario.nro_consulta || '-'}</td>
                <td className="actions-cell">
                  <button 
                    className="btn-action btn-edit" 
                    title="Editar"
                    onClick={() => handleEditHorario(horario)}
                  >
                    <span className="icon-edit">✏️</span>
                  </button>
                  <button 
                    className="btn-action btn-delete" 
                    title="Eliminar"
                    onClick={() => handleDeleteHorario(horario.id_horario)}
                  >
                    <span className="icon-delete">🗑️</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderExcepcionesContent = () => {
    return (
      <div className="excepciones-container">
        <p className="empty-state">La administración de excepciones aún no está disponible.</p>
      </div>
    );
  };

  return (
    <div className="horarios-container">
      <h1>Horarios de atención</h1>
      
      <div className="tabs-container">
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === "profesionales" ? "active" : ""}`} 
            onClick={() => setActiveTab("profesionales")}
          >
            Profesionales
          </button>
          <button 
            className={`tab-button ${activeTab === "excepciones" ? "active" : ""}`} 
            onClick={() => setActiveTab("excepciones")}
          >
            Excepciones
          </button>
        </div>
      </div>
      
      <div className="horarios-header">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Buscar por nombre"
            className="search-input"
          />
          <button className="search-button">
            <span>🔍</span>
          </button>
        </div>
        <button className="btn-agregar" onClick={() => {
          setCurrentHorario(null);
          setShowModal(true);
        }}>
          <span className="icon-plus">+</span> Agregar horario
        </button>
      </div>
      
      {activeTab === "profesionales" ? renderHorariosTable() : renderExcepcionesContent()}
      
      {showModal && (
        <div className="horarios-modal-overlay">
          <div className="horarios-modal-content narrow-modal">
            <div className="horarios-modal-header">
              <h2>{currentHorario ? "Editar horario" : "Agregar horario de atención"}</h2>
              <button className="horarios-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="horarios-modal-body">
              <HorarioForm 
                horario={currentHorario} 
                onSuccess={() => {
                  setShowModal(false);
                  fetchHorarios();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HorariosPage;