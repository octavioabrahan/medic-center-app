import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminExamenes.css";

const AdminExamenes = () => {
  // Estados para almacenar los datos
  const [examenes, setExamenes] = useState([]);
  const [filteredExamenes, setFilteredExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [lastChangeDate, setLastChangeDate] = useState({});

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [currentExamen, setCurrentExamen] = useState(null);
  const [historialExamen, setHistorialExamen] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    codigo: "",
    nombre_examen: "",
    preciousd: "",
    tiempo_entrega: "",
    informacion: "",
    tipo: "examen",
    is_active: true
  });

  // Obtener tasa de cambio
  const fetchExchangeRate = async () => {
    try {
      const response = await axios.get("/api/exchange-rate");
      setExchangeRate(response.data.tasa); // Cambiado de rate a tasa para coincidir con el backend
    } catch (err) {
      console.error('Error obteniendo tasa de cambio:', err);
      setExchangeRate(18.5); // Valor predeterminado si hay error
    }
  };

  // Calcular precio en Bs. F.
  const calcularPrecioBs = (preciousd) => {
    if (!exchangeRate || !preciousd) return 0;
    return (parseFloat(preciousd) * exchangeRate).toFixed(3);
  };

  // Obtener exámenes desde la API
  const fetchExamenes = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/exams");
      setExamenes(response.data);
      applyFilters(response.data);
      
      // Obtener el último cambio para cada examen
      const examenesIds = response.data.map(examen => examen.codigo);
      await fetchLastChangeDates(examenesIds);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los exámenes. Por favor, intenta de nuevo.');
      setExamenes([]);
      setFilteredExamenes([]);
    } finally {
      setLoading(false);
    }
  };

  // Obtener la última fecha de cambio de cada examen
  const fetchLastChangeDates = async (codigos) => {
    try {
      const changeDates = {};
      
      // Para cada examen, obtener su último cambio
      for (const codigo of codigos) {
        const response = await axios.get(`/api/exams/${codigo}/historial`);
        if (response.data && response.data.length > 0) {
          changeDates[codigo] = response.data[0].fecha_cambio;
        }
      }
      
      setLastChangeDate(changeDates);
    } catch (err) {
      console.error('Error al obtener fechas de modificación:', err);
    }
  };

  // Obtener historial de un examen
  const fetchExamenHistorial = async (codigo) => {
    setLoadingHistorial(true);
    try {
      const response = await axios.get(`/api/exams/${codigo}/historial`);
      setHistorialExamen(response.data);
    } catch (err) {
      console.error('Error al obtener historial:', err);
      setHistorialExamen([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Abrir el modal de historial de un examen
  const openHistorialModal = (examen) => {
    setCurrentExamen(examen);
    fetchExamenHistorial(examen.codigo);
    setShowHistorialModal(true);
  };

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    fetchExamenes();
    fetchExchangeRate();
  }, []); // Quitamos fetchExamenes del array de dependencias para evitar ciclo infinito

  // Aplicar filtros cuando cambian los criterios
  const applyFilters = (data = examenes) => {
    if (!data || data.length === 0) {
      setFilteredExamenes([]);
      return;
    }

    let results = [...data];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(examen => 
        examen.nombre_examen.toLowerCase().includes(term) ||
        examen.codigo.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado activo/inactivo
    if (!mostrarInactivos) {
      results = results.filter(examen => examen.is_active);
    }

    // Ordenar por nombre
    results.sort((a, b) => a.nombre_examen.localeCompare(b.nombre_examen));

    setFilteredExamenes(results);
  };

  // Reaccionar a cambios en los filtros
  useEffect(() => {
    applyFilters();
  }, [searchTerm, mostrarInactivos]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return 'Error de formato';
    }
  };

  // Abrir modal para agregar un nuevo examen
  const openAddModal = () => {
    // Resetear el formulario
    setFormData({
      codigo: "",
      nombre_examen: "",
      preciousd: "",
      tiempo_entrega: "",
      informacion: "",
      tipo: "examen",
      is_active: true
    });
    setShowAddModal(true);
  };

  // Abrir modal para editar un examen existente
  const openEditModal = (examen) => {
    setCurrentExamen(examen);
    setFormData({
      codigo: examen.codigo,
      nombre_examen: examen.nombre_examen,
      preciousd: examen.preciousd,
      tiempo_entrega: examen.tiempo_entrega || "",
      informacion: examen.informacion || "",
      tipo: examen.tipo || "examen",
      is_active: examen.is_active
    });
    setShowEditModal(true);
  };

  // Guardar un nuevo examen
  const handleAddExamen = async (e) => {
    e.preventDefault();
    try {
      // Agregar usuario al header para auditoría
      const headers = {
        'X-Usuario': localStorage.getItem('username') || 'admin' // En un sistema real, obtener del sistema de autenticación
      };
      
      const response = await axios.post("/api/exams", formData, { headers });
      setExamenes([...examenes, response.data]);
      applyFilters([...examenes, response.data]);
      setShowAddModal(false);
      alert("Examen agregado correctamente");
      fetchExamenes(); // Refrescar los datos para obtener las fechas actualizadas
    } catch (err) {
      console.error('Error:', err);
      alert("Error al agregar el examen");
    }
  };

  // Actualizar un examen existente
  const handleUpdateExamen = async (e) => {
    e.preventDefault();
    try {
      // Agregar usuario al header para auditoría
      const headers = {
        'X-Usuario': localStorage.getItem('username') || 'admin' // En un sistema real, obtener del sistema de autenticación
      };
      
      const response = await axios.put(`/api/exams/${formData.codigo}`, formData, { headers });
      const updatedExamenes = examenes.map(examen => 
        examen.codigo === formData.codigo ? response.data : examen
      );
      setExamenes(updatedExamenes);
      applyFilters(updatedExamenes);
      setShowEditModal(false);
      alert("Examen actualizado correctamente");
      fetchExamenes(); // Refrescar los datos para obtener las fechas actualizadas
    } catch (err) {
      console.error('Error:', err);
      alert("Error al actualizar el examen");
    }
  };

  // Cambiar el estado activo de un examen
  const toggleActivo = async (examen) => {
    const newStatus = !examen.is_active;
    try {
      // Agregar usuario al header para auditoría
      const headers = {
        'X-Usuario': localStorage.getItem('username') || 'admin' // En un sistema real, obtener del sistema de autenticación
      };
      
      const response = await axios.put(`/api/exams/${examen.codigo}`, {
        ...examen,
        is_active: newStatus
      }, { headers });
      
      const updatedExamenes = examenes.map(item => 
        item.codigo === examen.codigo ? response.data : item
      );
      setExamenes(updatedExamenes);
      applyFilters(updatedExamenes);
      fetchExamenes(); // Refrescar los datos para obtener las fechas actualizadas
      if (showEditModal) {
        setShowEditModal(false);
      }
    } catch (err) {
      console.error('Error:', err);
      alert(`Error al ${newStatus ? 'activar' : 'desactivar'} el examen`);
    }
  };

  // Renderizar modal para añadir examen
  const renderAddModal = () => {
    if (!showAddModal) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Agregar Nuevo Examen</h2>
            <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleAddExamen}>
              <div className="form-group">
                <label>Código</label>
                <input 
                  type="text" 
                  name="codigo" 
                  value={formData.codigo} 
                  onChange={handleFormChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input 
                  type="text" 
                  name="nombre_examen" 
                  value={formData.nombre_examen} 
                  onChange={handleFormChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Precio USD</label>
                <input 
                  type="number" 
                  name="preciousd" 
                  value={formData.preciousd} 
                  onChange={handleFormChange} 
                  step="0.01"
                  min="0" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Tiempo de Entrega</label>
                <input 
                  type="text" 
                  name="tiempo_entrega" 
                  value={formData.tiempo_entrega} 
                  onChange={handleFormChange} 
                  placeholder="Ej: 24 horas" 
                />
              </div>
              <div className="form-group">
                <label>Información</label>
                <textarea 
                  name="informacion" 
                  value={formData.informacion} 
                  onChange={handleFormChange} 
                  placeholder="Instrucciones o información adicional"
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select 
                  name="tipo" 
                  value={formData.tipo} 
                  onChange={handleFormChange}
                >
                  <option value="examen">Examen</option>
                  <option value="servicio">Servicio</option>
                  <option value="paquete">Paquete</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="is_active" 
                  name="is_active" 
                  checked={formData.is_active} 
                  onChange={handleFormChange} 
                />
                <label htmlFor="is_active">Activo</label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar modal para editar examen
  const renderEditModal = () => {
    if (!showEditModal || !currentExamen) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Editar Examen</h2>
            <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleUpdateExamen}>
              <div className="form-group">
                <label>Código</label>
                <input 
                  type="text" 
                  name="codigo" 
                  value={formData.codigo} 
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input 
                  type="text" 
                  name="nombre_examen" 
                  value={formData.nombre_examen} 
                  onChange={handleFormChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Precio USD</label>
                <input 
                  type="number" 
                  name="preciousd" 
                  value={formData.preciousd} 
                  onChange={handleFormChange} 
                  step="0.01"
                  min="0" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Tiempo de Entrega</label>
                <input 
                  type="text" 
                  name="tiempo_entrega" 
                  value={formData.tiempo_entrega} 
                  onChange={handleFormChange} 
                  placeholder="Ej: 24 horas" 
                />
              </div>
              <div className="form-group">
                <label>Información</label>
                <textarea 
                  name="informacion" 
                  value={formData.informacion} 
                  onChange={handleFormChange} 
                  placeholder="Instrucciones o información adicional"
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select 
                  name="tipo" 
                  value={formData.tipo} 
                  onChange={handleFormChange}
                >
                  <option value="examen">Examen</option>
                  <option value="servicio">Servicio</option>
                  <option value="paquete">Paquete</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="is_active_edit" 
                  name="is_active" 
                  checked={formData.is_active} 
                  onChange={handleFormChange} 
                />
                <label htmlFor="is_active_edit">Activo</label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                {!formData.is_active && (
                  <button 
                    type="button" 
                    className="btn-warning" 
                    onClick={() => toggleActivo(currentExamen)}
                  >
                    Activar
                  </button>
                )}
                {formData.is_active && (
                  <button 
                    type="button" 
                    className="btn-danger" 
                    onClick={() => toggleActivo(currentExamen)}
                  >
                    Desactivar
                  </button>
                )}
                <button type="submit" className="btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar modal para ver historial de un examen
  const renderHistorialModal = () => {
    if (!showHistorialModal || !currentExamen) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Historial de Cambios</h2>
            <button className="close-btn" onClick={() => setShowHistorialModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="examen-info">
              <p><strong>Código:</strong> {currentExamen.codigo}</p>
              <p><strong>Nombre:</strong> {currentExamen.nombre_examen}</p>
            </div>

            {loadingHistorial ? (
              <div className="loading">Cargando historial...</div>
            ) : !Array.isArray(historialExamen) || historialExamen.length === 0 ? (
              <p className="no-results">No hay registros de cambios previos</p>
            ) : (
              <div className="historial-table-container">
                <table className="admin-table historial-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Precio USD</th>
                      <th>Estado</th>
                      <th>Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialExamen.map((item, index) => (
                      <tr key={index}>
                        <td>{formatDate(item.fecha_cambio)}</td>
                        <td>{item.usuario || 'Sistema'}</td>
                        <td>${parseFloat(item.preciousd).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${item.is_active ? 'status-activo' : 'status-inactivo'}`}>
                            {item.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>{item.descripcion_cambio || 'Actualización general'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowHistorialModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page-container">
      <h1 className="admin-page-title">Exámenes y servicios</h1>
      
      <div className="admin-filters-bar">
        <div className="admin-search">
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="admin-checkbox">
          <input
            type="checkbox"
            id="mostrarInactivos"
            checked={mostrarInactivos}
            onChange={() => setMostrarInactivos(!mostrarInactivos)}
          />
          <label htmlFor="mostrarInactivos">Mostrar inactivos</label>
        </div>
        
        <button className="btn-add" onClick={openAddModal}>
          Agregar uno nuevo
        </button>
      </div>
      
      {loading ? (
        <div className="loading-container">Cargando exámenes...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredExamenes.length === 0 ? (
        <div className="no-results">No se encontraron exámenes</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Precio USD</th>
                <th>Precio Bs. F.</th>
                <th>Última modificación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredExamenes.map(examen => (
                <tr key={examen.codigo}>
                  <td>{examen.codigo}</td>
                  <td>
                    {examen.nombre_examen}
                    {!examen.is_active && (
                      <span className="status-badge status-inactivo">Inactivo</span>
                    )}
                  </td>
                  <td>$ {parseFloat(examen.preciousd).toFixed(2)}</td>
                  <td>Bs. F. {calcularPrecioBs(examen.preciousd)}</td>
                  <td>
                    {lastChangeDate[examen.codigo] ? formatDate(lastChangeDate[examen.codigo]) : 'N/A'}
                  </td>
                  <td className="actions-cell">
                    {/* Para exámenes activos: mostrar Editar y Ver historial */}
                    {examen.is_active && (
                      <>
                        <button 
                          className="btn-action btn-edit" 
                          onClick={() => openEditModal(examen)}
                          title="Editar"
                        >
                          ✎
                        </button>
                        <button
                          className="btn-action btn-history"
                          onClick={() => openHistorialModal(examen)}
                          title="Ver historial"
                        >
                          🕒
                        </button>
                      </>
                    )}
                    
                    {/* Para exámenes inactivos: mostrar solo Activar y Ver historial */}
                    {!examen.is_active && (
                      <>
                        <button
                          className="btn-action btn-activate"
                          onClick={() => toggleActivo(examen)}
                          title="Activar"
                        >
                          🔄
                        </button>
                        <button
                          className="btn-action btn-history"
                          onClick={() => openHistorialModal(examen)}
                          title="Ver historial"
                        >
                          🕒
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Renderizado de modales - mantenemos el código original */}
      {renderAddModal()}
      {renderEditModal()}
      {renderHistorialModal()}
    </div>
  );
};

export default AdminExamenes;