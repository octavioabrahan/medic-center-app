import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import HorarioForm from "../../components/admin/HorarioForm";
import ExcepcionesPage from "./ExcepcionesPage";

/**
 * Componente AdminHorarios
 * Este componente permite administrar los horarios de los profesionales médicos
 * Implementado según el diseño de Figma proporcionado
 */
function AdminHorarios() {
  const [activeTab, setActiveTab] = useState("profesionales");
  const [profesionales, setProfesionales] = useState([]);
  const [tiposAtencion, setTiposAtencion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddHorarioModal, setShowAddHorarioModal] = useState(false);
  const [selectedProfesional, setSelectedProfesional] = useState(null);

  // Datos de ejemplo para mostrar en la interfaz en caso de que la API no esté disponible
  const profesionalesEjemplo = [
    { id: 1, nombre: "ENDHER", apellido: "CASTILLO", tipo_atencion: "Presencial", dia: "Martes", hora_inicio: "08:00 AM", hora_fin: "01:00 PM", consultorio: "9", precio_usd: "50" },
    { id: 2, nombre: "BERENICE", apellido: "FIGUEREDO", tipo_atencion: "Previa cita", dia: "Sábado", hora_inicio: "-", hora_fin: "-", consultorio: "-", precio_usd: "40" },
    { id: 3, nombre: "LUIS", apellido: "AMAYA", tipo_atencion: "Previa cita", dia: "Martes y miércoles", hora_inicio: "-", hora_fin: "-", consultorio: "-", precio_usd: "45" },
    { id: 4, nombre: "YOHANKARELYS", apellido: "FERNANDEZ", tipo_atencion: "Previa cita", dia: "Lunes, martes, miércoles, jueves y viernes", hora_inicio: "-", hora_fin: "-", consultorio: "-", precio_usd: "60" },
    { id: 5, nombre: "EVA", apellido: "PAEZ", tipo_atencion: "Presencial", dia: "Lunes", hora_inicio: "08:00 AM", hora_fin: "01:00 PM", consultorio: "3", precio_usd: "55" },
    { id: 6, nombre: "MARIANGEL", apellido: "MONTES", tipo_atencion: "Presencial", dia: "Miércoles y jueves", hora_inicio: "07:30 AM", hora_fin: "01:00 PM", consultorio: "1", precio_usd: "50" },
    { id: 7, nombre: "MARIANGEL", apellido: "MONTES", tipo_atencion: "Previa cita", dia: "Sábado", hora_inicio: "-", hora_fin: "-", consultorio: "-", precio_usd: "35" }
  ];

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchProfesionales();
    fetchTiposAtencion();
  }, []);

  // Función para obtener los profesionales
  const fetchProfesionales = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/profesionales");
      
      // Si la API devuelve datos, los usamos, de lo contrario, usamos los datos de ejemplo
      if (response.data && response.data.length > 0) {
        setProfesionales(response.data);
      } else {
        setProfesionales(profesionalesEjemplo);
      }
    } catch (err) {
      console.error("Error al obtener profesionales:", err);
      // En caso de error, usamos los datos de ejemplo
      setProfesionales(profesionalesEjemplo);
    } finally {
      setLoading(false);
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
    fetchProfesionales();
    setShowAddHorarioModal(false);
    toast.success("Horario guardado correctamente");
  };

  // Filtrar profesionales según el término de búsqueda
  const filteredProfesionales = searchTerm
    ? profesionales.filter(
        (prof) =>
          `${prof.nombre} ${prof.apellido}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : profesionales;

  // Renderizado de la tabla de profesionales
  const renderProfesionalesTable = () => {
    if (loading) {
      return <div className="loading-state">Cargando profesionales...</div>;
    }
    
    if (error) {
      return <div className="error-state">{error}</div>;
    }
    
    if (filteredProfesionales.length === 0) {
      return (
        <div className="empty-state">
          <p>No se encontraron profesionales que coincidan con la búsqueda</p>
        </div>
      );
    }

    return (
      <div className="horarios-table-container">
        <div className="horarios-table">
          <div className="table-column">
            <div className="table-header">
              <div>Profesional</div>
            </div>
            {filteredProfesionales.map((profesional) => (
              <div key={`prof-${profesional.id}`} className="table-cell">
                {profesional.nombre} {profesional.apellido}
              </div>
            ))}
          </div>
          
          <div className="table-column">
            <div className="table-header">
              <div>Tipo de atención</div>
            </div>
            {filteredProfesionales.map((profesional) => (
              <div key={`tipo-${profesional.id}`} className="table-cell">
                {profesional.tipo_atencion}
              </div>
            ))}
          </div>
          
          <div className="table-column flex-grow">
            <div className="table-header">
              <div>Días</div>
            </div>
            {filteredProfesionales.map((profesional) => (
              <div key={`dias-${profesional.id}`} className="table-cell">
                {profesional.dia}
              </div>
            ))}
          </div>
          
          <div className="table-column">
            <div className="table-header">
              <div>Hora de inicio</div>
            </div>
            {filteredProfesionales.map((profesional) => (
              <div key={`inicio-${profesional.id}`} className="table-cell">
                {profesional.hora_inicio}
              </div>
            ))}
          </div>
          
          <div className="table-column">
            <div className="table-header">
              <div>Hora de termino</div>
            </div>
            {filteredProfesionales.map((profesional) => (
              <div key={`fin-${profesional.id}`} className="table-cell">
                {profesional.hora_fin}
              </div>
            ))}
          </div>
          
          <div className="table-column">
            <div className="table-header">
              <div>Consultorio</div>
            </div>
            {filteredProfesionales.map((profesional) => (
              <div key={`consul-${profesional.id}`} className="table-cell">
                {profesional.consultorio}
              </div>
            ))}
          </div>
          
          <div className="table-column">
            <div className="table-header">
              <div>Precio USD</div>
            </div>
            {filteredProfesionales.map((profesional) => (
              <div key={`precio-${profesional.id}`} className="table-cell">
                <button className="edit-button">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <rect width="16.77" height="16.77" x="1.67" y="1.57" stroke="#1E1E1E" strokeWidth="2" fill="none" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Horario de atención</h1>
      </div>
      
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
            className="search-input"
          />
          <span className="search-icon">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" fill="none" />
              <path d="M12 12L10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        
        <button 
          className="add-button"
          onClick={() => handleAddHorario()}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 3.33V12.67" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M3.33 8H12.67" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Agregar horario
        </button>
      </div>

      {/* Contenido principal */}
      <div className="main-content">
        {activeTab === "profesionales" ? (
          renderProfesionalesTable()
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
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            
            <HorarioForm 
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
