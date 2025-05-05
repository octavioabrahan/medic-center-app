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
      setExchangeRate(response.data.rate);
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
  }, []);

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

  // Renderizar tabla de exámenes
  const renderExamenesTable = () => {
    if (loading) return <div className="loading">Cargando exámenes...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredExamenes.length === 0) return <div className="no-results">No se encontraron exámenes</div>;

    return (
      <div className="table-container">
        <table className="examenes-table">
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
                    <span className="inactivo">Inactivo</span>
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
    );
  };

  // Renderizar modal para agregar un nuevo examen
  const renderAddModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Agrega un nuevo item para cotizar</h2>
            <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
          </div>
          <form onSubmit={handleAddExamen}>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="codigo">Código</label>
                <input
                  type="text"
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="nombre_examen">Nombre</label>
                <input
                  type="text"
                  id="nombre_examen"
                  name="nombre_examen"
                  value={formData.nombre_examen}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="preciousd">Precio en USD</label>
                <input
                  type="number"
                  id="preciousd"
                  name="preciousd"
                  min="0"
                  step="0.01"
                  value={formData.preciousd}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="preciobs">Precio en Bs. F.</label>
                <input
                  type="text"
                  id="preciobs"
                  className="precio-bs"
                  value={calcularPrecioBs(formData.preciousd)}
                  readOnly
                />
                <p className="helper-text">Este precio se calcula en base al precio ingresado en USD. No se mostrará en el cotizador</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="tiempo_entrega">Tiempo de entrega</label>
                <input
                  type="text"
                  id="tiempo_entrega"
                  name="tiempo_entrega"
                  value={formData.tiempo_entrega}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="informacion">Indicaciones</label>
                <textarea
                  id="informacion"
                  name="informacion"
                  value={formData.informacion}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="tipo">Tipo</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleFormChange}
                >
                  <option value="examen">Examen</option>
                  <option value="servicio">Servicio</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Agregar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Renderizar modal para editar un examen existente
  const renderEditModal = () => {
    if (!showEditModal || !currentExamen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Editar examen</h2>
            <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
          </div>
          <form onSubmit={handleUpdateExamen}>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-codigo">Código</label>
                <input
                  type="text"
                  id="edit-codigo"
                  name="codigo"
                  value={formData.codigo}
                  readOnly
                />
                <p className="helper-text">El código no se puede editar</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-nombre_examen">Nombre</label>
                <input
                  type="text"
                  id="edit-nombre_examen"
                  name="nombre_examen"
                  value={formData.nombre_examen}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-preciousd">Precio en USD</label>
                <input
                  type="number"
                  id="edit-preciousd"
                  name="preciousd"
                  min="0"
                  step="0.01"
                  value={formData.preciousd}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-preciobs">Precio en Bs. F.</label>
                <input
                  type="text"
                  id="edit-preciobs"
                  className="precio-bs"
                  value={calcularPrecioBs(formData.preciousd)}
                  readOnly
                />
                <p className="helper-text">Este precio se calcula en base al precio ingresado en USD. No se mostrará en el cotizador</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-tiempo_entrega">Tiempo de entrega</label>
                <input
                  type="text"
                  id="edit-tiempo_entrega"
                  name="tiempo_entrega"
                  value={formData.tiempo_entrega}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-informacion">Indicaciones</label>
                <textarea
                  id="edit-informacion"
                  name="informacion"
                  value={formData.informacion}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-tipo">Tipo</label>
                <select
                  id="edit-tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleFormChange}
                >
                  <option value="examen">Examen</option>
                  <option value="servicio">Servicio</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-archive"
                onClick={() => {
                  // Crear una copia del examen con is_active = false
                  const updatedExamen = {
                    ...currentExamen,
                    is_active: false
                  };
                  toggleActivo(updatedExamen);
                }}
              >
                Archivar
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Renderizar modal de historial de un examen
  const renderHistorialModal = () => {
    if (!showHistorialModal || !currentExamen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content historial-modal">
          <div className="modal-header">
            <h2>Historial de cambios</h2>
            <button className="close-btn" onClick={() => setShowHistorialModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="examen-info">
              <div className="examen-header">
                <div className="examen-title">
                  <div className="examen-codigo">Código: {currentExamen.codigo}</div>
                  <div className="examen-nombre">Nombre: {currentExamen.nombre_examen}</div>
                </div>
                <div className={`examen-estado ${currentExamen.is_active ? "status-activo" : "status-inactivo"}`}>
                  {currentExamen.is_active ? "Activo" : "Inactivo"}
                </div>
              </div>
            </div>
            
            <div className="registro-cambios">
              <h3>Registro de cambios</h3>
              {loadingHistorial ? (
                <div className="loading">Cargando historial...</div>
              ) : historialExamen.length === 0 ? (
                <div className="no-results">No hay registros de cambios para este examen</div>
              ) : (
                <div className="timeline">
                  {historialExamen.map((cambio, index) => (
                    <div className="timeline-item" key={index}>
                      <div className="timeline-date">
                        {formatDate(cambio.fecha_cambio)}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-status-change">
                          <span className={`status-badge ${cambio.is_active_nuevo ? 'status-activo' : 'status-inactivo'}`}>
                            {cambio.is_active_anterior ? 'Activo' : 'Inactivo'} → {cambio.is_active_nuevo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="timeline-footer">
                          <span>Modificado por: {cambio.cambiado_por}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
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
    <div className="admin-examenes-container">
      <h1>Exámenes y servicios</h1>
      
      <div className="admin-examenes-filters">
        <div className="admin-examenes-search">
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="checkbox-filter">
          <input
            type="checkbox"
            id="mostrarInactivos"
            checked={mostrarInactivos}
            onChange={() => setMostrarInactivos(!mostrarInactivos)}
          />
          <label htmlFor="mostrarInactivos">Mostrar inactivos</label>
        </div>
        
        <div className="admin-examenes-actions">
          <button className="btn-add" onClick={openAddModal}>
            + Agregar uno nuevo
          </button>
        </div>
      </div>
      
      {renderExamenesTable()}
      {renderAddModal()}
      {renderEditModal()}
      {renderHistorialModal()}
    </div>
  );
};

export default AdminExamenes;