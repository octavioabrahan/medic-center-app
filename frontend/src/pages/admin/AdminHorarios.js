import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import HorarioForm from "../../components/admin/HorarioForm";
import ExcepcionesPage from "./ExcepcionesPage";
import { format } from "date-fns";

/**
 * Componente AdminHorarios
 * Este componente permite administrar los horarios de los profesionales médicos
 * Implementado según el diseño de Figma proporcionado en horarios-full.json
 */
function AdminHorarios() {
  const [activeTab, setActiveTab] = useState("profesionales");
  const [profesionales, setProfesionales] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddHorarioModal, setShowAddHorarioModal] = useState(false);
  const [selectedProfesional, setSelectedProfesional] = useState(null);

  // Cargar datos de profesionales al montar el componente
  useEffect(() => {
    fetchProfesionales();
    fetchHorarios();
  }, []);

  // Función para obtener los profesionales
  const fetchProfesionales = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/profesionales");
      setProfesionales(response.data);
    } catch (err) {
      console.error("Error al obtener profesionales:", err);
      setError("No se pudieron cargar los profesionales. Por favor, intenta de nuevo más tarde.");
      toast.error("Error al cargar profesionales");
    } finally {
      setLoading(false);
    }
  };
  
  // Función para obtener los horarios
  const fetchHorarios = async () => {
    try {
      const response = await axios.get("/api/horarios");
      setHorarios(response.data);
    } catch (err) {
      console.error("Error al obtener horarios:", err);
      toast.error("Error al cargar horarios");
    }
  };

  // Función para manejar el cambio en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Función para cambiar entre las pestañas
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Función para abrir el modal de agregar horario
  const handleAddHorario = (profesional = null) => {
    setSelectedProfesional(profesional);
    setShowAddHorarioModal(true);
  };

  // Función para manejar el guardado de horarios
  const handleHorarioSuccess = () => {
    fetchHorarios();
    setShowAddHorarioModal(false);
    toast.success("Horario guardado correctamente");
  };

  // Filtrar profesionales según el término de búsqueda
  const filteredProfesionales = searchTerm
    ? profesionales.filter(
        (prof) =>
          `${prof.nombre} ${prof.apellido}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (prof.especialidad &&
            prof.especialidad.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : profesionales;

  // Renderizar mensaje cuando no hay datos
  const renderEmptyState = () => {
    return (
      <div className="empty-state">
        <h3>Aún no hay horarios asignados</h3>
        <p>Agrega horarios a los profesionales para que puedan aparecer en el sitio de agendamiento.</p>
      </div>
    );
  };

  // Función para formatear los días de la semana
  const formatDiaSemana = (dia) => {
    const dias = {
      "lunes": "Lunes",
      "martes": "Martes", 
      "miercoles": "Miércoles",
      "jueves": "Jueves",
      "viernes": "Viernes",
      "sabado": "Sábado",
      "domingo": "Domingo"
    };
    
    return dias[dia] || dia;
  };
  
  // Función para formatear el tipo de atención
  const formatTipoAtencion = (tipo) => {
    if (typeof tipo === 'number') {
      // Si es un ID, podríamos buscar el nombre correspondiente en una lista de tipos
      return `Tipo ${tipo}`;
    }
    return tipo || "Presencial";
  };
  
  // Renderizar la lista de profesionales con sus horarios
  const renderProfesionalesList = () => {
    const filteredResults = filteredProfesionales;
    
    if (filteredResults.length === 0) {
      return (
        <div className="no-results">
          <p>No se encontraron profesionales con el término de búsqueda.</p>
        </div>
      );
    }

    return filteredResults.map((profesional) => {
      // Filtrar horarios para este profesional
      const profesionalHorarios = horarios.filter(
        (h) => h.profesional_id === profesional.id
      );

      return (
        <div key={profesional.id} className="profesional-card">
          <div className="profesional-header">
            <h3 className="profesional-name">
              {profesional.nombre} {profesional.apellido}
            </h3>
            <button
              className="button button-subtle-sm"
              onClick={() => handleAddHorario(profesional)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Agregar horario
            </button>
          </div>
          
          {profesional.especialidad && (
            <div className="profesional-especialidad">
              <span className="label">Especialidad:</span> {profesional.especialidad}
            </div>
          )}

          <div className="horario-info">
            {profesionalHorarios.length === 0 ? (
              <p className="no-horarios">No hay horarios configurados</p>
            ) : (
              profesionalHorarios.map((horario) => (
                <div key={horario.id} className="horario-card">
                  <div className="horario-header">
                    <span className="dia">{formatDiaSemana(horario.dia_semana)}</span>
                    <span className="tipo-atencion">{formatTipoAtencion(horario.tipo_atencion_id)}</span>
                  </div>
                  <div className="horario-tiempo">
                    <span className="hora">
                      {horario.hora_inicio} - {horario.hora_termino}
                    </span>
                    {horario.valido_desde && horario.valido_hasta && (
                      <div className="horario-validez">
                        Válido: {
                          (() => {
                            try {
                              return format(new Date(horario.valido_desde), 'dd/MM/yyyy');
                            } catch (error) {
                              return horario.valido_desde;
                            }
                          })()
                        } - {
                          (() => {
                            try {
                              return format(new Date(horario.valido_hasta), 'dd/MM/yyyy');
                            } catch (error) {
                              return horario.valido_hasta;
                            }
                          })()
                        }
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="admin-page">
      <h1>Horario de atención</h1>
      
      {/* Tabs de navegación */}
      <div className="tabs">
        <div 
          className={`tab ${activeTab === "profesionales" ? "active" : ""}`}
          onClick={() => handleTabChange("profesionales")}
        >
          Profesionales
        </div>
        <div 
          className={`tab ${activeTab === "excepciones" ? "active" : ""}`}
          onClick={() => handleTabChange("excepciones")}
        >
          Excepciones
        </div>
      </div>
      
      {/* Barra de búsqueda y botón de agregar */}
      <div className="admin-actions">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={searchTerm}
            onChange={handleSearchChange}
            className="form-field-input"
          />
          <span className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
        </div>
        
        <button 
          className="button button-primary"
          onClick={() => handleAddHorario()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar horario
        </button>
      </div>

      {/* Contenido principal */}
      <div className="main-content">
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : activeTab === "profesionales" ? (
          horarios.length === 0 && profesionales.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="profesionales-list">
              {renderProfesionalesList()}
            </div>
          )
        ) : (
          <ExcepcionesPage isTab={true} />
        )}
      </div>

      {/* Modal para agregar horario */}
      {showAddHorarioModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {selectedProfesional 
                  ? `Agregar horario para ${selectedProfesional.nombre} ${selectedProfesional.apellido}` 
                  : "Agregar horario"}
              </h2>
              <button 
                className="close-button" 
                onClick={() => setShowAddHorarioModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <HorarioForm 
              onSuccess={handleHorarioSuccess}
              horario={null}
              profesional={selectedProfesional}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHorarios;
