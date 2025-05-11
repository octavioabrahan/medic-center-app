import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import HorarioForm from "../../components/admin/HorarioForm";
import ExcepcionesPage from "./ExcepcionesPage";
import SearchField from "../../components/common/SearchField";

/**
 * Componente AdminHorarios
 * Este componente permite administrar los horarios de los profesionales médicos
 * Implementado según el diseño de Figma proporcionado
 */
function AdminHorarios() {
  const [activeTab, setActiveTab] = useState("profesionales");
  const [horarios, setHorarios] = useState([]);
  const [filteredHorarios, setFilteredHorarios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [tiposAtencion, setTiposAtencion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("az");
  const [showAddHorarioModal, setShowAddHorarioModal] = useState(false);
  const [selectedProfesional, setSelectedProfesional] = useState(null);
  const [currentHorario, setCurrentHorario] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchHorarios();
    fetchProfesionales();
    fetchTiposAtencion();
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
          horario.tipo_atencion?.toLowerCase().includes(term)
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
  
  // Función para obtener los horarios
  const fetchHorarios = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/horarios");
      const horarios = response.data;
      
      setHorarios(horarios);
      setFilteredHorarios(horarios);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los horarios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener los profesionales
  const fetchProfesionales = async () => {
    try {
      const response = await axios.get("/api/profesionales");
      setProfesionales(response.data);
    } catch (err) {
      console.error("Error cargando profesionales:", err);
    }
  };
  
  // Función para obtener los tipos de atención
  const fetchTiposAtencion = async () => {
    try {
      const response = await axios.get("/api/tipo-atencion");
      setTiposAtencion(response.data);
    } catch (err) {
      console.error("Error al obtener tipos de atención:", err);
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

  // Función para manejar el cambio en la búsqueda
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Función para cambiar entre las pestañas
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Función para abrir el modal de agregar horario
  const handleAddHorario = (profesional = null) => {
    setCurrentHorario(null);
    setSelectedProfesional(profesional);
    setShowAddHorarioModal(true);
  };
  
  // Función para editar un horario
  const handleEditHorario = (horario) => {
    setCurrentHorario(horario);
    setShowAddHorarioModal(true);
  };

  // Función para manejar el guardado de horarios
  const handleHorarioSuccess = () => {
    fetchHorarios();
    setShowAddHorarioModal(false);
    toast.success("Horario guardado correctamente");
  };

  // Renderizado de la tabla de profesionales
  const renderProfesionalesTable = () => {
    if (loading) {
      return <div className="loading-state">Cargando horarios...</div>;
    }
    
    if (error) {
      return <div className="error-state">{error}</div>;
    }
    
    if (filteredHorarios.length === 0) {
      return (
        <div className="empty-state">
          <p>No se encontraron horarios que coincidan con la búsqueda</p>
        </div>
      );
    }

    return (
      <div className="appointments-table-container">
        <table className="appointments-table with-horizontal-lines">
          <thead>
            <tr>
              <th>Profesional</th>
              <th>Tipo de atención</th>
              <th>Días</th>
              <th>Hora de inicio</th>
              <th>Hora de término</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredHorarios.map((horario) => (
              <tr key={horario.horario_id} className="appointment-row with-horizontal-divider">
                <td>{horario.profesional_nombre} {horario.profesional_apellido}</td>
                <td>{horario.tipo_atencion}</td>
                <td>{formatHorarioSemanal(horario)}</td>
                <td>{horario.hora_inicio?.slice(0, 5) || "-"}</td>
                <td>{horario.hora_termino?.slice(0, 5) || "-"}</td>
                <td className="actions-cell">
                  <button 
                    className="action-button edit-button" 
                    title="Editar horario"
                    onClick={() => handleEditHorario(horario)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.586 3.586a2 2 0 012.828 0l2 2a2 2 0 010 2.828l-11 11A2 2 0 018 20H4a1 1 0 01-1-1v-4a2 2 0 01.586-1.414l11-11zM19 8.414L20.414 7 17 3.586 15.586 5 19 8.414z"
                        fill="currentColor"
                      />
                    </svg>
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
    <div className="admin-page">
      <h1 className="admin-page-title">Horario de atención</h1>
      
      {/* Tabs de navegación */}
      <div className="admin-tabs">
        <div 
          className={`admin-tab ${activeTab === "profesionales" ? "active" : ""}`}
          onClick={() => handleTabChange("profesionales")}
        >
          Profesionales
        </div>
        <div 
          className={`admin-tab ${activeTab === "excepciones" ? "active" : ""}`}
          onClick={() => handleTabChange("excepciones")}
        >
          Excepciones
        </div>
      </div>
      
      {/* Barra de búsqueda y botón de agregar - solo mostrar cuando estamos en la pestaña de profesionales */}
      {activeTab === "profesionales" && (
        <div className="admin-filter-bar">
          <div className="filter-section">
            <div className="admin-search">
              <SearchField
                placeholder="Buscar por nombre"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="action-section">
            <button 
              className="button variant-primary"
              onClick={() => handleAddHorario()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="button-text">Agregar horario</span>
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="main-content" style={{ padding: 0, marginTop: 0 }}>
        {activeTab === "profesionales" ? (
          renderProfesionalesTable()
        ) : (
          <ExcepcionesPage isTab={true} />
        )}
      </div>

      {/* Modal para agregar o editar horario */}
      {showAddHorarioModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {currentHorario 
                  ? "Editar horario" 
                  : selectedProfesional 
                    ? `Agregar horario para ${selectedProfesional.nombre} ${selectedProfesional.apellido}` 
                    : "Agregar horario de atención"}
              </h2>
              <button 
                className="close-button" 
                onClick={() => setShowAddHorarioModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            
            <HorarioForm 
              horario={currentHorario}
              onSuccess={handleHorarioSuccess}
              profesional={selectedProfesional}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHorarios;
