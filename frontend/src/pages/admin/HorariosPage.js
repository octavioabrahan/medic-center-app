import React, { useState, useEffect } from "react";
import axios from "axios";
import "./components/HorarioForm"; // Actualizada la ubicación del componente
import ExcepcionesPage from "./ExcepcionesPage";
import "./components/AdminFilterBar"; // Actualizada la ubicación del componente
import "./HorariosPage.css";
import "./components/AdminCommon.css"; // Actualizada la ubicación de los estilos

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
  // También vamos a añadir estado para ordenamiento alfabético
  const [sortOrder, setSortOrder] = useState("az");

  useEffect(() => {
    fetchHorarios();
    fetchProfesionales();
  }, []);
  
  // Filtrar y ordenar horarios
  useEffect(() => {
    if (horarios.length > 0) {
      let results = [...horarios];
      
      // Filtrar por término de búsqueda
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        results = results.filter(horario => 
          `${horario.profesional_nombre} ${horario.profesional_apellido}`.toLowerCase().includes(term) ||
          horario.tipo_atencion.toLowerCase().includes(term)
        );
      }
      
      // Aplicar ordenamiento alfabético
      if (sortOrder === 'az') {
        results.sort((a, b) => 
          `${a.profesional_nombre} ${a.profesional_apellido}`.localeCompare(`${b.profesional_nombre} ${b.profesional_apellido}`)
        );
      } else if (sortOrder === 'za') {
        results.sort((a, b) => 
          `${b.profesional_nombre} ${b.profesional_apellido}`.localeCompare(`${a.profesional_nombre} ${a.profesional_apellido}`)
        );
      }
      
      setFilteredHorarios(results);
    }
  }, [searchTerm, horarios, sortOrder]);

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
    if (loading) return <div className="loading-container">Cargando horarios...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredHorarios.length === 0) return <div className="no-results">No se encontraron horarios configurados</div>;

    return (
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Profesional</th>
              <th>Tipo de atención</th>
              <th>Días</th>
              <th>Hora de inicio</th>
              <th>Hora de término</th>
              <th>Fecha inicio</th>
              <th>Fecha término</th>
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
                <td>{horario.valido_desde ? new Date(horario.valido_desde).toLocaleDateString() : "N/A"}</td>
                <td>{horario.valido_hasta ? new Date(horario.valido_hasta).toLocaleDateString() : "N/A"}</td>
                <td className="actions-cell">
                  <button 
                    className="btn-action btn-edit" 
                    title="Editar"
                    onClick={() => handleEditHorario(horario)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-action btn-delete" 
                    title="Eliminar"
                    onClick={() => handleDeleteHorario(horario.horario_id)}
                  >
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

  const renderProfesionalesContent = () => {
    return (
      <>
        <AdminFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Buscar por nombre de profesional..."
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        >
          <div className="admin-actions">
            <button className="btn-add" onClick={() => {
              setCurrentHorario(null);
              setShowModal(true);
            }}>
              Agregar horario
            </button>
          </div>
        </AdminFilterBar>
        
        {renderHorariosTable()}
      </>
    );
  };

  return (
    <div className="admin-page-container">
      <h1 className="admin-page-title">Horarios de atención</h1>
      
      <div className="admin-tabs">
        <div 
          className={`admin-tab ${activeTab === "profesionales" ? "active" : ""}`} 
          onClick={() => setActiveTab("profesionales")}
        >
          Profesionales
        </div>
        <div 
          className={`admin-tab ${activeTab === "excepciones" ? "active" : ""}`} 
          onClick={() => setActiveTab("excepciones")}
        >
          Excepciones
        </div>
      </div>
      
      {activeTab === "profesionales" ? renderProfesionalesContent() : <ExcepcionesPage />}
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentHorario ? "Editar horario" : "Agregar horario de atención"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
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