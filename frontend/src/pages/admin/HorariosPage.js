import React, { useState, useEffect } from "react";
import axios from "axios";
import HorarioForm from "../../components/admin/HorarioForm";
import "./HorariosPage.css";

function HorariosPage() {
  const [horarios, setHorarios] = useState([]);
  const [filteredHorarios, setFilteredHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [profesionales, setProfesionales] = useState([]);
  const [activeTab, setActiveTab] = useState("profesionales");
  const [currentHorario, setCurrentHorario] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHorarios();
    fetchProfesionales();
  }, []);
  
  // Filtrar horarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (horarios.length > 0) {
      if (searchTerm.trim() === "") {
        setFilteredHorarios(horarios);
      } else {
        const term = searchTerm.toLowerCase();
        const filtered = horarios.filter(horario => 
          `${horario.profesional_nombre} ${horario.profesional_apellido}`.toLowerCase().includes(term) ||
          horario.tipo_atencion.toLowerCase().includes(term)
        );
        setFilteredHorarios(filtered);
      }
    }
  }, [searchTerm, horarios]);

  // Modificamos fetchHorarios para trabajar con el nuevo formato de días como array
  const fetchHorarios = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/horarios");
      const horarios = response.data;
      
      // Los horarios ya vienen con dia_semana como array desde la base de datos
      // No necesitamos agrupar manualmente
      
      setHorarios(horarios);
      setFilteredHorarios(horarios);
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
    const diasNombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    // Si tenemos un array de días, lo formateamos
    if (horario.dia_semana && Array.isArray(horario.dia_semana)) {
      // Ordenamos los días de la semana (1=Lunes, 7=Domingo)
      const diasOrdenados = [...horario.dia_semana].sort((a, b) => a - b);
      
      // Convertimos los números a nombres de días
      const nombresOrdenados = diasOrdenados.map(dia => diasNombres[dia - 1]);
      
      // Unimos los nombres con comas
      return nombresOrdenados.join(', ');
    } 
    
    // Para compatibilidad con registros antiguos (valores únicos)
    if (horario.dia_semana !== undefined && !Array.isArray(horario.dia_semana)) {
      return diasNombres[horario.dia_semana - 1] || 'No especificado';
    }
    
    return 'No especificado';
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
    if (filteredHorarios.length === 0) return <div className="no-results">No se encontraron horarios configurados</div>;

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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredHorarios.map((horario) => (
              <tr key={horario.horario_id}>
                <td>{horario.profesional_nombre} {horario.profesional_apellido}</td>
                <td>{horario.tipo_atencion}</td>
                <td>{formatHorarioSemanal(horario)}</td>
                <td>{horario.hora_inicio?.slice(0, 5) || ""}</td>
                <td>{horario.hora_termino?.slice(0, 5) || ""}</td>
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
                    onClick={() => handleDeleteHorario(horario.horario_id)}
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
        <div className="admin-citas-search">
          <input
            type="text"
            placeholder="Buscar por nombre de profesional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
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