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
  const handleSearchChange = (value) => {
    setSearchTerm(value);
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
      <div className="appointments-table-container">
        <table className="appointments-table with-horizontal-lines">
          <thead>
            <tr>
              <th>Profesional</th>
              <th>Tipo de atención</th>
              <th>Días</th>
              <th>Hora de inicio</th>
              <th>Hora de término</th>
              <th>Consultorio</th>
              <th>Precio USD</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfesionales.map((profesional) => (
              <tr key={`prof-${profesional.id}`} className="appointment-row">
                <td>{profesional.nombre} {profesional.apellido}</td>
                <td>{profesional.tipo_atencion}</td>
                <td>{profesional.dia}</td>
                <td>{profesional.hora_inicio}</td>
                <td>{profesional.hora_fin}</td>
                <td>{profesional.consultorio}</td>
                <td className="actions-cell">
                  <button className="action-button edit-button" title="Editar precio">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="18" height="18" x="3" y="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
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
      <h1>Horario de atención</h1>
      
      {/* Línea horizontal */}
      <hr className="separator" />
      
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
      
      {/* Línea horizontal para los tabs */}
      <hr className="tab-separator" />
      
      {/* Barra de búsqueda y botón de agregar */}
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
