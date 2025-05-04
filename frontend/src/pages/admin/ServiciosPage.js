import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ServiciosPage.css";

const ServiciosPage = () => {
  // Estados para almacenar los datos de servicios
  const [servicios, setServicios] = useState([]);
  const [filteredServicios, setFilteredServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarArchivados, setMostrarArchivados] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' o 'desc' para ordenar alfabéticamente

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [currentServicio, setCurrentServicio] = useState(null);
  const [showConfirmArchivarModal, setShowConfirmArchivarModal] = useState(false);
  
  // Estado para el nuevo servicio a crear/editar
  const [nuevoServicio, setNuevoServicio] = useState({
    nombre_servicio: "",
    price_usd: "",
    is_recommended: false
  });

  // Cargar servicios al montar el componente
  useEffect(() => {
    fetchServicios();
  }, []);

  // Filtrar y ordenar servicios cuando cambian los criterios
  useEffect(() => {
    if (servicios.length > 0) {
      let results = [...servicios];
      
      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(servicio => 
          servicio.nombre_servicio.toLowerCase().includes(term)
        );
      }
      
      // Filtrar por estado de archivado (is_active = false significa archivado)
      if (!mostrarArchivados) {
        results = results.filter(servicio => servicio.is_active);
      }
      
      // Ordenar alfabéticamente
      results.sort((a, b) => {
        const nameA = a.nombre_servicio.toLowerCase();
        const nameB = b.nombre_servicio.toLowerCase();
        
        if (sortOrder === "asc") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
      
      setFilteredServicios(results);
    }
  }, [searchTerm, mostrarArchivados, servicios, sortOrder]);

  // Obtener servicios desde la API
  const fetchServicios = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/servicios");
      setServicios(response.data);
      setFilteredServicios(response.data.filter(servicio => servicio.is_active));
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los servicios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario de servicio
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoServicio({
      ...nuevoServicio,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Abrir modal para crear nuevo servicio
  const handleAgregarServicio = () => {
    setCurrentServicio(null);
    setNuevoServicio({
      nombre_servicio: "",
      price_usd: "",
      is_recommended: false
    });
    setShowModal(true);
  };

  // Abrir modal para editar servicio existente
  const handleEditarServicio = (servicio) => {
    setCurrentServicio(servicio);
    setNuevoServicio({
      nombre_servicio: servicio.nombre_servicio,
      price_usd: servicio.price_usd,
      is_recommended: servicio.is_recommended || false
    });
    setShowModal(true);
  };

  // Confirmar archivado de servicio desde el modal de edición
  const handleConfirmarArchivar = () => {
    if (!currentServicio) return;
    setShowModal(false);  // Cerrar modal de edición
    setShowConfirmArchivarModal(true);  // Abrir modal de confirmación
  };

  // Guardar servicio (crear nuevo o actualizar existente)
  const handleGuardarServicio = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentServicio) {
        // Actualizar servicio existente
        await axios.put(`/api/servicios/${currentServicio.id_servicio}`, nuevoServicio);
        
        // Actualizar en la lista local
        setServicios(prev => 
          prev.map(serv => 
            serv.id_servicio === currentServicio.id_servicio 
              ? {...serv, ...nuevoServicio} 
              : serv
          )
        );
      } else {
        // Crear nuevo servicio
        const response = await axios.post("/api/servicios", nuevoServicio);
        
        // Añadir a la lista local
        setServicios(prev => [...prev, response.data]);
      }
      
      // Cerrar modal y limpiar estado
      setShowModal(false);
      setNuevoServicio({
        nombre_servicio: "",
        price_usd: "",
        is_recommended: false
      });
      
    } catch (err) {
      console.error('Error:', err);
      setError(`Error al ${currentServicio ? 'actualizar' : 'crear'} el servicio.`);
    } finally {
      setLoading(false);
    }
  };

  // Archivar servicio
  const archivarServicio = async () => {
    if (!currentServicio) return;
    
    setLoading(true);
    try {
      await axios.put(`/api/servicios/${currentServicio.id_servicio}/archivar`);
      
      // Actualizar en la lista local
      setServicios(prev => 
        prev.map(serv => 
          serv.id_servicio === currentServicio.id_servicio 
            ? {...serv, is_active: false} 
            : serv
        )
      );
      
      setShowConfirmArchivarModal(false);
      setCurrentServicio(null);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Error al archivar el servicio.');
    } finally {
      setLoading(false);
    }
  };

  // Activar servicio archivado
  const activarServicio = async (servicio) => {
    setLoading(true);
    try {
      await axios.put(`/api/servicios/${servicio.id_servicio}/desarchivar`);
      
      // Actualizar en la lista local
      setServicios(prev => 
        prev.map(serv => 
          serv.id_servicio === servicio.id_servicio 
            ? {...serv, is_active: true} 
            : serv
        )
      );
      
    } catch (err) {
      console.error('Error:', err);
      setError('Error al activar el servicio.');
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar el orden alfabético
  const toggleSortOrder = (order) => {
    setSortOrder(order);
  };

  // Renderizar tabla de servicios
  const renderServiciosTable = () => {
    if (loading && servicios.length === 0) return <div className="loading">Cargando servicios...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredServicios.length === 0) return <div className="no-results">No se encontraron servicios</div>;

    return (
      <div className="table-container">
        <table className="servicios-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Precio USD</th>
              <th>Recomendado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredServicios.map(servicio => (
              <tr key={servicio.id_servicio} className={!servicio.is_active ? 'archivado' : ''}>
                <td>{servicio.nombre_servicio}</td>
                <td>${parseFloat(servicio.price_usd).toFixed(2)}</td>
                <td>
                  {servicio.is_recommended ? (
                    <span className="badge recomendado">Sí</span>
                  ) : (
                    <span className="badge no-recomendado">No</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${servicio.is_active ? 'activo' : 'archivado'}`}>
                    {servicio.is_active ? 'Activo' : 'Archivado'}
                  </span>
                </td>
                <td className="actions-cell">
                  {servicio.is_active ? (
                    <button 
                      className="btn-action btn-edit" 
                      onClick={() => handleEditarServicio(servicio)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                  ) : (
                    <button 
                      className="btn-action btn-activate" 
                      onClick={() => activarServicio(servicio)}
                      title="Activar servicio"
                    >
                      ↩️
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderizar modal para agregar/editar servicio
  const renderModal = () => {
    if (!showModal) return null;

    const isEditing = currentServicio !== null;
    const isActive = isEditing && currentServicio.is_active;

    return (
      <div className="modal-overlay">
        <div className="modal-content servicio-modal">
          <div className="modal-header">
            <h2>{isEditing ? "Editar servicio" : "Agregar servicio"}</h2>
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleGuardarServicio}>
              <div className="form-group">
                <label htmlFor="nombre_servicio">Nombre del servicio</label>
                <input
                  type="text"
                  id="nombre_servicio"
                  name="nombre_servicio"
                  value={nuevoServicio.nombre_servicio}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="price_usd">Precio (USD)</label>
                <input
                  type="number"
                  id="price_usd"
                  name="price_usd"
                  value={nuevoServicio.price_usd}
                  onChange={handleChange}
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group checkbox-container">
                <div className="compact-checkbox">
                  <input
                    type="checkbox"
                    id="is_recommended"
                    name="is_recommended"
                    checked={nuevoServicio.is_recommended}
                    onChange={handleChange}
                  />
                  <label htmlFor="is_recommended">
                    Recomendado para la primera consulta
                  </label>
                </div>
              </div>
              
              <div className="action-buttons">
                {isEditing && isActive && (
                  <button
                    type="button"
                    className="btn-archive"
                    onClick={handleConfirmarArchivar}
                  >
                    Archivar
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar modal de confirmación para archivar servicio
  const renderConfirmArchivarModal = () => {
    if (!showConfirmArchivarModal || !currentServicio) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content confirm-modal">
          <div className="modal-header">
            <h2>¿Quieres archivar el servicio?</h2>
            <button className="close-btn" onClick={() => setShowConfirmArchivarModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <p>Al archivar este servicio:</p>
            <ul>
              <li>Ya no estará disponible en el sitio de agendamiento.</li>
              <li>Los profesionales que lo tienen asignado dejarán de mostrarse si no tienen otros servicios activos.</li>
              <li>Los agendamientos previamente generados no se eliminarán.</li>
            </ul>
            <div className="checkbox-container">
              <input 
                type="checkbox"
                id="entiendo"
                checked={true}
                readOnly
              />
              <label htmlFor="entiendo">
                Entiendo que este servicio y los profesionales que solo lo ofrecen dejarán de mostrarse en el portal.
              </label>
            </div>

            <div className="action-buttons">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowConfirmArchivarModal(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-archive"
                onClick={archivarServicio}
                disabled={loading}
              >
                {loading ? "Archivando..." : "Archivar servicio"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="servicios-container">
      <h1>Servicios</h1>
      
      <div className="servicios-filters">
        <div className="servicios-search">
          <input
            type="text"
            placeholder="Buscar por nombre de servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="sort-filters">
          <button 
            className={`sort-btn ${sortOrder === "asc" ? "active" : ""}`}
            onClick={() => toggleSortOrder("asc")}
            title="Ordenar de A a Z"
          >
            A → Z
          </button>
          <button 
            className={`sort-btn ${sortOrder === "desc" ? "active" : ""}`}
            onClick={() => toggleSortOrder("desc")}
            title="Ordenar de Z a A"
          >
            Z → A
          </button>
        </div>

        <div className="filter-checkbox">
          <input
            type="checkbox"
            id="mostrarArchivados"
            checked={mostrarArchivados}
            onChange={(e) => setMostrarArchivados(e.target.checked)}
          />
          <label htmlFor="mostrarArchivados">Mostrar archivados</label>
        </div>
        
        <button className="btn-agregar" onClick={handleAgregarServicio}>
          <span className="icon-plus">+</span> Crear servicio
        </button>
      </div>
      
      {renderServiciosTable()}
      {renderModal()}
      {renderConfirmArchivarModal()}
    </div>
  );
};

export default ServiciosPage;