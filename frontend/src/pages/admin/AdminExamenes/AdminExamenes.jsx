import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminDashboard/AdminLayout';
import Button from '../../../components/Button/Button';
import SearchField from '../../../components/Inputs/SearchField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import TagToggleGroup from '../../../components/Tag/TagToggleGroup';
import TagToggle from '../../../components/Tag/TagToggle';
import Table from '../../../components/Tables/Table';
import Tag from '../../../components/Tag/Tag';
import Modal from '../../../components/Modal/Modal';
import styles from './AdminExamenes.module.css';
import axios from 'axios';
import { PencilSquareIcon, ArrowPathRoundedSquareIcon, ArrowPathIcon } from '@heroicons/react/20/solid';

// Custom Plus icon for the Add button
const CustomPlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.59995 3.8002C8.59995 3.46882 8.33132 3.2002 7.99995 3.2002C7.66858 3.2002 7.39995 3.46882 7.39995 3.8002V7.4002H3.79995C3.46858 7.4002 3.19995 7.66882 3.19995 8.0002C3.19995 8.33157 3.46858 8.6002 3.79995 8.6002L7.39995 8.6002V12.2002C7.39995 12.5316 7.66858 12.8002 7.99995 12.8002C8.33132 12.8002 8.59995 12.5316 8.59995 12.2002V8.6002L12.2 8.6002C12.5313 8.6002 12.8 8.33157 12.8 8.0002C12.8 7.66883 12.5313 7.4002 12.2 7.4002H8.59995V3.8002Z" fill="var(--sds-color-icon-brand-on-brand, #F0F3FF)" />
  </svg>
);

const API_URL = `${process.env.REACT_APP_API_URL || ''}/api/exams`;

const AdminExamenes = () => {
  // State for exams data
  const [examenes, setExamenes] = useState([]);
  const [filteredExamenes, setFilteredExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(18.5); // Default exchange rate
  const [lastChangeDate, setLastChangeDate] = useState({});
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortAZ, setSortAZ] = useState(true);

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [currentExamen, setCurrentExamen] = useState(null);
  const [historialExamen, setHistorialExamen] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    codigo: "",
    nombre_examen: "",
    preciousd: "",
    tiempo_entrega: "",
    informacion: "",
    tipo: "examen",
    is_active: true
  });

  // Load exams on component mount
  useEffect(() => {
    fetchExchangeRate();
    cargarExamenes();
  }, []);

  // Apply filters when data or filter settings change
  useEffect(() => {
    applyFilters();
  }, [examenes, searchTerm, showArchived, sortAZ]);

  // Fetch exchange rate from API
  const fetchExchangeRate = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/exchange-rate`);
      setExchangeRate(response.data.tasa || 18.5);
    } catch (err) {
      console.error("Error al cargar tasa de cambio:", err);
      // Keep default value if error
    }
  };

  // Calculate price in local currency
  const calcularPrecioBs = (preciousd) => {
    if (!exchangeRate || !preciousd) return 0;
    return (parseFloat(preciousd) * exchangeRate).toFixed(2);
  };

  // Fetch exams from API
  const cargarExamenes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setExamenes(res.data);
      
      // Get last change date for each exam
      const examenesIds = res.data.map(examen => examen.codigo);
      await fetchLastChangeDates(examenesIds);
      
      setError(null);
    } catch (err) {
      console.error("Error al cargar exámenes:", err);
      setError('No se pudieron cargar los exámenes y servicios.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch the last change date for each exam
  const fetchLastChangeDates = async (codigos) => {
    try {
      const changeDates = {};
      
      for (const codigo of codigos) {
        try {
          const response = await axios.get(`${API_URL}/${codigo}/historial`);
          if (response.data && response.data.length > 0) {
            changeDates[codigo] = response.data[0].fecha_cambio;
          }
        } catch (err) {
          console.error(`Error al obtener historial para examen ${codigo}:`, err);
        }
      }
      
      setLastChangeDate(changeDates);
    } catch (err) {
      console.error('Error al obtener fechas de modificación:', err);
    }
  };

  // Fetch history for a specific exam
  const fetchExamenHistorial = async (codigo) => {
    setLoadingHistorial(true);
    try {
      const response = await axios.get(`${API_URL}/${codigo}/historial`);
      setHistorialExamen(response.data);
    } catch (err) {
      console.error('Error al obtener historial:', err);
      setHistorialExamen([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Apply filters to the exam list
  const applyFilters = () => {
    let results = [...examenes];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(e => 
        (e.nombre_examen?.toLowerCase().includes(term) || 
         e.codigo?.toLowerCase().includes(term))
      );
    }
    
    // Filter by archived status
    if (!showArchived) {
      results = results.filter(e => e.is_active !== false);
    }
    
    // Sort by name
    results = results.sort((a, b) => sortAZ
      ? (a.nombre_examen || '').localeCompare(b.nombre_examen || '')
      : (b.nombre_examen || '').localeCompare(a.nombre_examen || '')
    );
    
    setFilteredExamenes(results);
  };

  // Format date
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

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Open modal to add new exam
  const handleAgregarClick = () => {
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

  // Open modal to edit existing exam
  const handleEditExamen = (examen) => {
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

  // Open modal to view exam history
  const handleViewHistorial = (examen) => {
    setCurrentExamen(examen);
    fetchExamenHistorial(examen.codigo);
    setShowHistorialModal(true);
  };

  // Save a new exam
  const handleAddExamen = async (e) => {
    if (e) e.preventDefault();
    try {
      // Add user header for audit
      const headers = {
        'X-Usuario': localStorage.getItem('username') || 'admin'
      };
      
      const response = await axios.post(API_URL, formData, { headers });
      await cargarExamenes(); // Refresh data
      setShowAddModal(false);
    } catch (err) {
      console.error('Error:', err);
      setError("Error al agregar el examen");
    }
  };

  // Update an existing exam
  const handleUpdateExamen = async (e) => {
    if (e) e.preventDefault();
    try {
      // Add user header for audit
      const headers = {
        'X-Usuario': localStorage.getItem('username') || 'admin'
      };
      
      await axios.put(`${API_URL}/${formData.codigo}`, formData, { headers });
      await cargarExamenes(); // Refresh data
      setShowEditModal(false);
    } catch (err) {
      console.error('Error:', err);
      setError("Error al actualizar el examen");
    }
  };

  // Toggle active status
  const toggleActivo = async (examen) => {
    try {
      const newStatus = !examen.is_active;
      const headers = {
        'X-Usuario': localStorage.getItem('username') || 'admin'
      };
      
      await axios.put(`${API_URL}/${examen.codigo}`, {
        ...examen,
        is_active: newStatus
      }, { headers });
      
      await cargarExamenes(); // Refresh data
      
      if (showEditModal) {
        setShowEditModal(false);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(`Error al ${!examen.is_active ? 'activar' : 'desactivar'} el examen`);
    }
  };

  return (
    <AdminLayout activePage="/admin/examenes">
      <div className={styles.adminExamenesContent}>
        {/* Page header with title and add button */}
        <div className={styles.adminExamenesPageHeader}>
          <div className={styles.adminExamenesMenuHeader}>
            <div className={styles.adminExamenesTitle}>Exámenes y servicios</div>
          </div>
          <Button variant="primary" onClick={handleAgregarClick}>
            <CustomPlusIcon />
            <span>Agregar</span>
          </Button>
        </div>
        
        {/* Filter bar with search, checkbox, and sorting options */}
        <div className={styles.adminExamenesFilterBar}>
          <div className={styles.adminExamenesSearchFilter}>
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Buscar por nombre"
              className={styles.adminExamenesSearchField}
            />
          </div>
          <div className={styles.adminExamenesFilterControls}>
            <div className={styles.adminExamenesCheckboxField}>
              <CheckboxField
                label="Mostrar archivados"
                checked={showArchived}
                onChange={setShowArchived}
              />
            </div>
            <TagToggleGroup className={styles.adminExamenesTagToggleGroup}>
              <TagToggle
                label="A → Z"
                active={sortAZ}
                onChange={() => setSortAZ(true)}
                icon={sortAZ ? "check" : null}
                scheme="brand"
              />
              <TagToggle
                label="Z → A"
                active={!sortAZ}
                onChange={() => setSortAZ(false)}
                scheme="brand"
              />
            </TagToggleGroup>
          </div>
        </div>
        
        {/* Main content area - empty state or list of exams */}
        <div className={styles.adminExamenesBody}>
          {loading ? (
            <div className={styles.adminExamenesEmptyState}>
              <div className={styles.adminExamenesEmptyStateTitleStrong}>Cargando exámenes y servicios...</div>
            </div>
          ) : error ? (
            <div className={styles.adminExamenesEmptyState}>
              <div className={styles.adminExamenesEmptyStateTitleStrong}>{error}</div>
            </div>
          ) : filteredExamenes.length === 0 ? (
            <div className={styles.adminExamenesEmptyState}>
              <div className={styles.adminExamenesEmptyStateTitleStrong}>Aún no has agregado exámenes y/o servicios</div>
              <div className={styles.adminExamenesEmptyStateSubtitle}>Los items que agregues se mostrarán en el cotizador.</div>
            </div>
          ) : (
            <div className={styles.adminExamenesTableContainer}>
              <Table
                headers={[
                  'Código',
                  'Nombre',
                  'Precio (USD)',
                  'Estado',
                  'Acciones'
                ]}
                data={filteredExamenes.map(examen => ({
                  codigo: examen.codigo || '',
                  nombre: examen.nombre_examen || '',
                  precioUSD: examen.preciousd || 0,
                  estado: examen.is_active,
                  acciones: examen.codigo,
                  examen_completo: examen // Para acceder al objeto completo
                }))}
                columns={['codigo', 'nombre', 'precioUSD', 'estado', 'acciones']}
                renderCustomCell={(row, column) => {
                  if (column === 'estado') {
                    const isActive = row.estado;
                    let scheme = isActive ? 'positive' : 'neutral';
                    let variant = 'secondary';
                    let text = isActive ? 'Activo' : 'Archivado';
                    
                    return (
                      <div className={styles.adminExamenesStatus}>
                        <Tag 
                          text={text}
                          scheme={scheme}
                          variant={variant}
                          closeable={false}
                        />
                      </div>
                    );
                  }
                  
                  if (column === 'precioUSD') {
                    return (
                      <div className={styles.adminExamenesPrecio}>
                        ${parseFloat(row.precioUSD).toFixed(2)}
                      </div>
                    );
                  }
                  
                  /* Removed precioBs and tipo columns */
                  
                  if (column === 'acciones') {
                    const isActive = row.estado;
                    const examen = row.examen_completo;
                    return (
                      <div className={styles.adminExamenesActions}>
                        {isActive ? (
                          <>
                            <button
                              className={styles.iconButton}
                              title="Editar"
                              onClick={() => handleEditExamen(examen)}
                            >
                              <PencilSquareIcon width={20} height={20} />
                            </button>
                            <button
                              className={styles.iconButton}
                              title="Historial"
                              onClick={() => handleViewHistorial(examen)}
                            >
                              <ArrowPathRoundedSquareIcon width={20} height={20} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className={styles.iconButton}
                              title="Activar"
                              onClick={() => toggleActivo(examen)}
                            >
                              <ArrowPathIcon width={20} height={20} />
                            </button>
                            <button
                              className={styles.iconButton}
                              title="Historial"
                              onClick={() => handleViewHistorial(examen)}
                            >
                              <ArrowPathRoundedSquareIcon width={20} height={20} />
                            </button>
                          </>
                        )}
                      </div>
                    );
                  }
                  
                  return null;
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Exam Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Agregar Examen"
        size="medium"
      >
        <form onSubmit={handleAddExamen} className={styles.adminExamenesForm}>
          <div className={styles.adminExamenesFormGroup}>
            <label>Código</label>
            <input 
              type="text" 
              name="codigo" 
              value={formData.codigo} 
              onChange={handleFormChange} 
              required 
              className={styles.adminExamenesInput}
            />
          </div>
          <div className={styles.adminExamenesFormGroup}>
            <label>Nombre</label>
            <input 
              type="text" 
              name="nombre_examen" 
              value={formData.nombre_examen} 
              onChange={handleFormChange} 
              required 
              className={styles.adminExamenesInput}
            />
          </div>
          <div className={styles.adminExamenesFormGroup}>
            <label>Precio USD</label>
            <input 
              type="number" 
              name="preciousd" 
              value={formData.preciousd} 
              onChange={handleFormChange} 
              step="0.01"
              min="0" 
              required 
              className={styles.adminExamenesInput}
            />
          </div>
          <div className={styles.adminExamenesFormGroup}>
            <label>Tiempo de Entrega</label>
            <input 
              type="text" 
              name="tiempo_entrega" 
              value={formData.tiempo_entrega} 
              onChange={handleFormChange} 
              placeholder="Ej: 24 horas" 
              className={styles.adminExamenesInput}
            />
          </div>
          <div className={styles.adminExamenesFormGroup}>
            <label>Información</label>
            <textarea 
              name="informacion" 
              value={formData.informacion} 
              onChange={handleFormChange} 
              placeholder="Instrucciones o información adicional"
              className={styles.adminExamenesTextarea}
            />
          </div>
          <div className={styles.adminExamenesFormGroup}>
            <label>Tipo</label>
            <select 
              name="tipo" 
              value={formData.tipo} 
              onChange={handleFormChange}
              className={styles.adminExamenesSelect}
            >
              <option value="examen">Examen</option>
              <option value="servicio">Servicio</option>
              <option value="paquete">Paquete</option>
            </select>
          </div>
          <div className={styles.adminExamenesFormGroup}>
            <CheckboxField
              label="Activo"
              checked={formData.is_active}
              onChange={(checked) => setFormData({...formData, is_active: checked})}
            />
          </div>
          
          <div className={styles.adminExamenesModalFooter}>
            <Button variant="subtle" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Exam Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Examen"
        size="medium"
      >
        {currentExamen && (
          <form onSubmit={handleUpdateExamen} className={styles.adminExamenesForm}>
            <div className={styles.adminExamenesFormGroup}>
              <label>Código</label>
              <input 
                type="text" 
                name="codigo" 
                value={formData.codigo} 
                disabled
                className={styles.adminExamenesInput}
              />
            </div>
            <div className={styles.adminExamenesFormGroup}>
              <label>Nombre</label>
              <input 
                type="text" 
                name="nombre_examen" 
                value={formData.nombre_examen} 
                onChange={handleFormChange} 
                required 
                className={styles.adminExamenesInput}
              />
            </div>
            <div className={styles.adminExamenesFormGroup}>
              <label>Precio USD</label>
              <input 
                type="number" 
                name="preciousd" 
                value={formData.preciousd} 
                onChange={handleFormChange} 
                step="0.01"
                min="0" 
                required 
                className={styles.adminExamenesInput}
              />
            </div>
            <div className={styles.adminExamenesFormGroup}>
              <label>Tiempo de Entrega</label>
              <input 
                type="text" 
                name="tiempo_entrega" 
                value={formData.tiempo_entrega} 
                onChange={handleFormChange} 
                placeholder="Ej: 24 horas" 
                className={styles.adminExamenesInput}
              />
            </div>
            <div className={styles.adminExamenesFormGroup}>
              <label>Información</label>
              <textarea 
                name="informacion" 
                value={formData.informacion} 
                onChange={handleFormChange} 
                placeholder="Instrucciones o información adicional"
                className={styles.adminExamenesTextarea}
              />
            </div>
            <div className={styles.adminExamenesFormGroup}>
              <label>Tipo</label>
              <select 
                name="tipo" 
                value={formData.tipo} 
                onChange={handleFormChange}
                className={styles.adminExamenesSelect}
              >
                <option value="examen">Examen</option>
                <option value="servicio">Servicio</option>
                <option value="paquete">Paquete</option>
              </select>
            </div>
            <div className={styles.adminExamenesFormGroup}>
              <CheckboxField
                label="Activo"
                checked={formData.is_active}
                onChange={(checked) => setFormData({...formData, is_active: checked})}
              />
            </div>
            
            <div className={styles.adminExamenesModalFooter}>
              <Button variant="subtle" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              {!formData.is_active && (
                <Button 
                  variant="primary" 
                  onClick={() => toggleActivo(currentExamen)}
                >
                  Activar
                </Button>
              )}
              {formData.is_active && (
                <Button 
                  variant="danger" 
                  onClick={() => toggleActivo(currentExamen)}
                >
                  Desactivar
                </Button>
              )}
              <Button variant="primary" type="submit">
                Guardar
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* View History Modal */}
      <Modal
        isOpen={showHistorialModal}
        onClose={() => setShowHistorialModal(false)}
        title="Historial de Cambios"
        size="large"
      >
        {currentExamen && (
          <div className={styles.adminExamenesHistorialContent}>
            <div className={styles.adminExamenesExamenInfo}>
              <p><strong>Código:</strong> {currentExamen.codigo}</p>
              <p><strong>Nombre:</strong> {currentExamen.nombre_examen}</p>
            </div>

            {loadingHistorial ? (
              <div className={styles.adminExamenesLoading}>Cargando historial...</div>
            ) : !historialExamen || historialExamen.length === 0 ? (
              <p className={styles.adminExamenesNoResults}>No hay registros de cambios previos</p>
            ) : (
              <div className={styles.adminExamenesHistorialTable}>
                <Table
                  headers={['Fecha', 'Usuario', 'Precio USD', 'Estado', 'Detalles']}
                  data={historialExamen.map((item, index) => ({
                    fecha: formatDate(item.fecha_cambio),
                    usuario: item.usuario || 'Sistema',
                    precio: parseFloat(item.preciousd).toFixed(2),
                    estado: item.is_active,
                    detalles: item.descripcion_cambio || 'Actualización general'
                  }))}
                  columns={['fecha', 'usuario', 'precio', 'estado', 'detalles']}
                  renderCustomCell={(row, column) => {
                    if (column === 'precio') {
                      return `$${row.precio}`;
                    }
                    if (column === 'estado') {
                      const isActive = row.estado;
                      let scheme = isActive ? 'positive' : 'neutral';
                      let text = isActive ? 'Activo' : 'Inactivo';
                      
                      return (
                        <Tag 
                          text={text}
                          scheme={scheme}
                          variant="secondary"
                          closeable={false}
                        />
                      );
                    }
                    return null;
                  }}
                />
              </div>
            )}
            
            <div className={styles.adminExamenesModalFooter}>
              <Button variant="subtle" onClick={() => setShowHistorialModal(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminExamenes;
