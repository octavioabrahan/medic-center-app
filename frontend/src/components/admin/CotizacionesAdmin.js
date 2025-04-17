import React, { useState, useEffect } from 'react';
import './CotizacionesAdmin.css';

function CotizacionesAdmin() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [filteredCotizaciones, setFilteredCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [currentCotizacion, setCurrentCotizacion] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
  const [seguimientos, setSeguimientos] = useState([]);
  const [nuevoSeguimiento, setNuevoSeguimiento] = useState({
    tipo_contacto: 'llamada',
    resultado: 'exitoso',
    comentarios: '',
    usuario: 'admin', // En un sistema real, esto vendría del sistema de autenticación
    proxima_accion: '',
    fecha_proxima_accion: new Date().toISOString().split('T')[0]
  });

  // Obtener cotizaciones al cargar el componente
  useEffect(() => {
    fetchCotizaciones();
  }, []);

  // Filtrar cotizaciones cuando cambian los criterios
  useEffect(() => {
    if (cotizaciones.length > 0) {
      let results = [...cotizaciones];
      
      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(cot => 
          cot.folio.toLowerCase().includes(term) ||
          cot.nombre?.toLowerCase().includes(term) ||
          cot.apellido?.toLowerCase().includes(term) ||
          cot.cedula_cliente?.toLowerCase().includes(term)
        );
      }
      
      // Filtrar por estado
      if (filterStatus !== 'todos') {
        results = results.filter(cot => cot.estado === filterStatus);
      }
      
      setFilteredCotizaciones(results);
    }
  }, [searchTerm, filterStatus, cotizaciones]);

  // Obtener cotizaciones desde la API
  const fetchCotizaciones = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cotizaciones`);
      if (!response.ok) throw new Error('Error al obtener cotizaciones');
      
      const data = await response.json();
      setCotizaciones(data);
      setFilteredCotizaciones(data);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar las cotizaciones. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Obtener detalles de una cotización
  const fetchCotizacionDetails = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cotizaciones/${id}`);
      if (!response.ok) throw new Error('Error al obtener detalles de la cotización');
      
      const data = await response.json();
      setCurrentCotizacion(data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los detalles de la cotización.');
    }
  };

  // Obtener seguimientos de una cotización
  const fetchSeguimientos = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/seguimiento/cotizacion/${id}`);
      if (!response.ok) throw new Error('Error al obtener seguimientos');
      
      const data = await response.json();
      setSeguimientos(data);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los seguimientos.');
    }
  };

  // Cambiar estado de cotización
  const updateCotizacionStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cotizaciones/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: newStatus }),
      });
      
      if (!response.ok) throw new Error('Error al actualizar estado');
      
      // Actualizar estado en la lista local
      setCotizaciones(prev => prev.map(cot => 
        cot.id_unico === id ? { ...cot, estado: newStatus } : cot
      ));
    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar el estado de la cotización.');
    }
  };

  // Agregar nuevo seguimiento
  const addSeguimiento = async () => {
    if (!currentCotizacion || !nuevoSeguimiento.comentarios) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/seguimiento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...nuevoSeguimiento,
          cotizacion_id: currentCotizacion.id_unico
        }),
      });
      
      if (!response.ok) throw new Error('Error al agregar seguimiento');
      
      // Actualizar seguimientos locales
      const data = await response.json();
      setSeguimientos(prev => [data, ...prev]);
      
      // Limpiar formulario
      setNuevoSeguimiento({
        tipo_contacto: 'llamada',
        resultado: 'exitoso',
        comentarios: '',
        usuario: 'admin',
        proxima_accion: '',
        fecha_proxima_accion: new Date().toISOString().split('T')[0]
      });
      
      // Actualizar estado de la cotización en la lista local si el resultado cambia el estado
      if (nuevoSeguimiento.resultado === 'exitoso' || nuevoSeguimiento.resultado === 'rechazado') {
        const newStatus = nuevoSeguimiento.resultado === 'exitoso' ? 'confirmado' : 'cancelado';
        setCotizaciones(prev => prev.map(cot => 
          cot.id_unico === currentCotizacion.id_unico ? { ...cot, estado: newStatus } : cot
        ));
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al agregar seguimiento.');
    }
  };

  // Ver PDF de cotización
  const viewPdf = (folio) => {
    window.open(`${process.env.REACT_APP_API_URL}/pdfs/cotizacion_${folio}_${currentCotizacion?.nombre?.toLowerCase().replace(/\s+/g, '_')}_*.pdf`, '_blank');
  };

  // Abrir modal de seguimiento
  const openSeguimientoModal = (cotizacion) => {
    setCurrentCotizacion(cotizacion);
    fetchSeguimientos(cotizacion.id_unico);
    setShowSeguimientoModal(true);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().substring(0, 5);
  };

  // Estados para los diferentes status de cotización
  const statusClasses = {
    pendiente: 'status-pending',
    confirmado: 'status-confirmed',
    cancelado: 'status-cancelled',
    completado: 'status-completed'
  };

  // Renderizar tabla de cotizaciones
  const renderCotizacionesTable = () => {
    if (loading) return <div className="loading">Cargando cotizaciones...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredCotizaciones.length === 0) return <div className="no-results">No se encontraron cotizaciones</div>;

    return (
      <div className="table-container">
        <table className="cotizaciones-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Cliente</th>
              <th>Cédula</th>
              <th>Fecha</th>
              <th>Exámenes</th>
              <th>Total USD</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCotizaciones.map(cot => (
              <tr key={cot.id_unico}>
                <td>{cot.folio}</td>
                <td>{cot.nombre} {cot.apellido}</td>
                <td>{cot.cedula_cliente}</td>
                <td>{formatDate(cot.fecha_creacion)}</td>
                <td>{cot.cantidad_examenes}</td>
                <td>${typeof cot.total_usd === 'number' ? cot.total_usd.toFixed(2) : '0.00'}</td>
                <td>
                  <span className={`status-badge ${statusClasses[cot.estado] || ''}`}>
                    {cot.estado}
                  </span>
                </td>
                <td className="actions-cell">
                  <button 
                    className="btn-action btn-view" 
                    onClick={() => fetchCotizacionDetails(cot.id_unico)}
                    title="Ver detalles"
                  >
                    👁️
                  </button>
                  <button 
                    className="btn-action btn-follow" 
                    onClick={() => openSeguimientoModal(cot)}
                    title="Seguimiento"
                  >
                    📞
                  </button>
                  <div className="status-dropdown">
                    <button className="btn-action btn-status">📋</button>
                    <div className="dropdown-content">
                      <button onClick={() => updateCotizacionStatus(cot.id_unico, 'pendiente')}>Pendiente</button>
                      <button onClick={() => updateCotizacionStatus(cot.id_unico, 'confirmado')}>Confirmado</button>
                      <button onClick={() => updateCotizacionStatus(cot.id_unico, 'cancelado')}>Cancelado</button>
                      <button onClick={() => updateCotizacionStatus(cot.id_unico, 'completado')}>Completado</button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Modal de detalles de cotización
  const renderDetailModal = () => {
    if (!showDetailModal || !currentCotizacion) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content detail-modal">
          <div className="modal-header">
            <h2>Detalles de Cotización</h2>
            <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="detail-section">
              <h3>Información General</h3>
              <div className="detail-grid">
                <div>
                  <strong>Folio:</strong> {currentCotizacion.folio}
                </div>
                <div>
                  <strong>Fecha:</strong> {formatDate(currentCotizacion.fecha_creacion)}
                </div>
                <div>
                  <strong>Estado:</strong> 
                  <span className={`status-badge ${statusClasses[currentCotizacion.estado] || ''}`}>
                    {currentCotizacion.estado}
                  </span>
                </div>
                <div>
                  <strong>Total USD:</strong> ${currentCotizacion.total_usd?.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Información del Cliente</h3>
              <div className="detail-grid">
                <div>
                  <strong>Nombre:</strong> {currentCotizacion.nombre} {currentCotizacion.apellido}
                </div>
                <div>
                  <strong>Cédula:</strong> {currentCotizacion.cedula_cliente}
                </div>
                <div>
                  <strong>Email:</strong> {currentCotizacion.email || 'No disponible'}
                </div>
                <div>
                  <strong>Teléfono:</strong> {currentCotizacion.telefono || 'No disponible'}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Exámenes</h3>
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Tiempo de Entrega</th>
                    <th>Precio USD</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCotizacion.examenes?.map((exam, index) => (
                    <tr key={index}>
                      <td>{exam.examen_codigo}</td>
                      <td>{exam.nombre_examen}</td>
                      <td>{exam.tiempo_entrega || 'Estándar'}</td>
                      <td>${exam.precio_unitario?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="action-buttons">
              <button className="btn-primary" onClick={() => openSeguimientoModal(currentCotizacion)}>
                Gestionar Seguimiento
              </button>
              <button className="btn-secondary" onClick={() => viewPdf(currentCotizacion.folio)}>
                Ver PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal de seguimiento
  const renderSeguimientoModal = () => {
    if (!showSeguimientoModal || !currentCotizacion) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content seguimiento-modal">
          <div className="modal-header">
            <h2>Seguimiento de Cotización</h2>
            <button className="close-btn" onClick={() => setShowSeguimientoModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="cotizacion-info">
              <p><strong>Folio:</strong> {currentCotizacion.folio}</p>
              <p><strong>Cliente:</strong> {currentCotizacion.nombre} {currentCotizacion.apellido}</p>
              <p><strong>Estado:</strong> 
                <span className={`status-badge ${statusClasses[currentCotizacion.estado] || ''}`}>
                  {currentCotizacion.estado}
                </span>
              </p>
            </div>

            <div className="nuevo-seguimiento">
              <h3>Nuevo Seguimiento</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Contacto</label>
                  <select 
                    value={nuevoSeguimiento.tipo_contacto}
                    onChange={(e) => setNuevoSeguimiento({...nuevoSeguimiento, tipo_contacto: e.target.value})}
                  >
                    <option value="llamada">Llamada</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="presencial">Presencial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Resultado</label>
                  <select 
                    value={nuevoSeguimiento.resultado}
                    onChange={(e) => setNuevoSeguimiento({...nuevoSeguimiento, resultado: e.target.value})}
                  >
                    <option value="exitoso">Exitoso</option>
                    <option value="sin_respuesta">Sin Respuesta</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="pendiente_decision">Pendiente de Decisión</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Comentarios</label>
                <textarea 
                  value={nuevoSeguimiento.comentarios}
                  onChange={(e) => setNuevoSeguimiento({...nuevoSeguimiento, comentarios: e.target.value})}
                  placeholder="Detalles de la comunicación..."
                  rows={3}
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Próxima Acción</label>
                  <input 
                    type="text"
                    value={nuevoSeguimiento.proxima_accion}
                    onChange={(e) => setNuevoSeguimiento({...nuevoSeguimiento, proxima_accion: e.target.value})}
                    placeholder="Ej: Volver a llamar, enviar recordatorio..."
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Próxima Acción</label>
                  <input 
                    type="date"
                    value={nuevoSeguimiento.fecha_proxima_accion}
                    onChange={(e) => setNuevoSeguimiento({...nuevoSeguimiento, fecha_proxima_accion: e.target.value})}
                  />
                </div>
              </div>
              <button className="btn-primary" onClick={addSeguimiento}>
                Guardar Seguimiento
              </button>
            </div>

            <div className="historial-seguimiento">
              <h3>Historial de Seguimiento</h3>
              {seguimientos.length === 0 ? (
                <p className="no-results">No hay registros de seguimiento previos</p>
              ) : (
                <div className="timeline">
                  {seguimientos.map(seg => (
                    <div className="timeline-item" key={seg.id}>
                      <div className="timeline-date">
                        {formatDate(seg.fecha_seguimiento)}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className={`tipo-badge ${seg.tipo_contacto}`}>
                            {seg.tipo_contacto}
                          </span>
                          <span className={`resultado-badge ${seg.resultado}`}>
                            {seg.resultado}
                          </span>
                        </div>
                        <p>{seg.comentarios}</p>
                        {seg.proxima_accion && (
                          <div className="proxima-accion">
                            <strong>Próxima acción:</strong> {seg.proxima_accion}
                            {seg.fecha_proxima_accion && (
                              <span> ({new Date(seg.fecha_proxima_accion).toLocaleDateString()})</span>
                            )}
                          </div>
                        )}
                        <div className="timeline-footer">
                          <span>Usuario: {seg.usuario}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="cotizaciones-admin">
      <h1>Administración de Cotizaciones</h1>
      
      <div className="filters-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por folio, cliente o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-container">
          <label>Estado:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
            <option value="completado">Completado</option>
          </select>
        </div>
        
        <button className="refresh-btn" onClick={fetchCotizaciones}>
          Actualizar
        </button>
      </div>
      
      {renderCotizacionesTable()}
      {renderDetailModal()}
      {renderSeguimientoModal()}
    </div>
  );
}

export default CotizacionesAdmin;