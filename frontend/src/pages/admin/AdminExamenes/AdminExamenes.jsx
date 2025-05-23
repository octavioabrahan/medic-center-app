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
import { PencilSquareIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import api from '../../../api'; // Importar el cliente API configurado correctamente

// Custom Plus icon for the Add button
const CustomPlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.59995 3.8002C8.59995 3.46882 8.33132 3.2002 7.99995 3.2002C7.66858 3.2002 7.39995 3.46882 7.39995 3.8002V7.4002H3.79995C3.46858 7.4002 3.19995 7.66882 3.19995 8.0002C3.19995 8.33157 3.46858 8.6002 3.79995 8.6002L7.39995 8.6002V12.2002C7.39995 12.5316 7.66858 12.8002 7.99995 12.8002C8.33132 12.8002 8.59995 12.5316 8.59995 12.2002V8.6002L12.2 8.6002C12.5313 8.6002 12.8 8.33157 12.8 8.0002C12.8 7.66883 12.5313 7.4002 12.2 7.4002H8.59995V3.8002Z" fill="var(--sds-color-icon-brand-on-brand, #F0F3FF)" />
  </svg>
);

const API_ENDPOINT = '/exams'; // Endpoint relativo (sin /api/ porque el cliente api ya lo incluye)

const AdminExamenes = () => {
  // State for exams data
  const [examenes, setExamenes] = useState([]);
  const [filteredExamenes, setFilteredExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortAZ, setSortAZ] = useState(true);

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentExamen, setCurrentExamen] = useState(null);
  
  // Form validation state
  const [isFormValid, setIsFormValid] = useState(false);
  const [codigoExists, setCodigoExists] = useState(false);

  // Estado para prevenir clicks múltiples en el mismo examen
  const [processingExams, setProcessingExams] = useState(new Set());

  // Form data state
  const [formData, setFormData] = useState({
    codigo: "",
    nombre_examen: "",
    preciousd: "",
    tiempo_entrega: "",
    informacion: "",
    tipo: null,
    is_active: true
  });

  // Load exams on component mount
  useEffect(() => {
    cargarExamenes();
  }, []);

  // Apply filters when data or filter settings change
  useEffect(() => {
    applyFilters();
    
    // Verificar si hay exámenes con estado inconsistente
    const examenesInconsistentes = examenes.filter(examen => 
      examen.is_active === null || examen.is_active === undefined
    );
    
    if (examenesInconsistentes.length > 0) {
      console.warn('[AdminExamenes] Se detectaron exámenes con estado inconsistente:', 
        examenesInconsistentes.map(e => ({
          codigo: e.codigo,
          nombre: e.nombre_examen,
          estado: e.is_active
        }))
      );
    }
  }, [examenes, searchTerm, showArchived, sortAZ]);

  // Fetch exams from API
  const cargarExamenes = async () => {
    setLoading(true);
    console.log(`[AdminExamenes] Cargando exámenes desde: ${API_ENDPOINT}`);
    try {
      // Forzar skip de cache agregando timestamp como query param
      const timestamp = new Date().getTime();
      const res = await api.get(`${API_ENDPOINT}?_=${timestamp}`);
      
      console.log(`[AdminExamenes] Exámenes cargados: ${res.data.length}`);
      
      // Verificar si hay algún examen con estado inconsistente
      const examenesSospechosos = res.data.filter(e => e.is_active === null || e.is_active === undefined);
      if (examenesSospechosos.length > 0) {
        console.warn(`[AdminExamenes] Se encontraron ${examenesSospechosos.length} exámenes con estado inconsistente:`, 
          examenesSospechosos.map(e => ({ codigo: e.codigo, nombre: e.nombre_examen, is_active: e.is_active }))
        );
      }
      
      // Verificar valores del campo "tipo"
      const tiposInusuales = res.data.filter(e => e.tipo === "");
      if (tiposInusuales.length > 0) {
        console.warn(`[AdminExamenes] Se encontraron ${tiposInusuales.length} exámenes con tipo = "" (cadena vacía):`, 
          tiposInusuales.map(e => ({ codigo: e.codigo, nombre: e.nombre_examen, tipo: JSON.stringify(e.tipo) }))
        );
      }
      
      setExamenes(res.data);
      setError(null);
    } catch (err) {
      console.error("[AdminExamenes] Error al cargar exámenes:", err);
      console.error("[AdminExamenes] Detalles del error:", {
        mensaje: err.message,
        respuesta: err.response?.data,
        codigo_estado: err.response?.status
      });
      setError('No se pudieron cargar los exámenes y servicios.');
    } finally {
      setLoading(false);
    }
  };

  // Se eliminan las funciones de fetchLastChangeDates y fetchExamenHistorial
  // ya que no son necesarias en la versión simplificada

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
  // Se elimina la función formatDate ya que no se usará con el historial

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    
    setFormData(newFormData);
    
    // Check if codigo exists when it changes
    if (name === 'codigo' && value.trim() !== '') {
      const exists = examenes.some(exam => exam.codigo === value);
      setCodigoExists(exists);
      if (exists) {
        setError("El código ya existe. Por favor use otro código.");
      } else {
        setError(null);
      }
    }
    
    // Validate the entire form
    validateForm(newFormData);
  };
  
  // Validate the form
  const validateForm = (data) => {
    // Check if required fields are filled and codigo doesn't exist
    const isValid = 
      data.codigo?.trim() !== '' && 
      data.nombre_examen?.trim() !== '' && 
      data.preciousd?.trim() !== '' && 
      !codigoExists;
      
    setIsFormValid(isValid);
  };

  // Open modal to add new exam
  const handleAgregarClick = () => {
    const initialFormData = {
      codigo: "",
      nombre_examen: "",
      preciousd: "",
      tiempo_entrega: "",
      informacion: "",
      tipo: null, // Mantenemos explícitamente como null
      is_active: true
    };
    
    setFormData(initialFormData);
    setIsFormValid(false);
    setCodigoExists(false);
    setError(null);
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
      tipo: examen.tipo, // Ya no asignamos valor por defecto, permitiendo null
      is_active: examen.is_active
    });
    setShowEditModal(true);
  };

  // Save a new exam
  const handleAddExamen = async (e) => {
    if (e) e.preventDefault();
    try {
      // Check if code already exists
      const existingExam = examenes.find(exam => exam.codigo === formData.codigo);
      if (existingExam) {
        setError("El código ya existe. Por favor use otro código.");
        return;
      }
      
      // Usar api.post en lugar de axios.post
      const response = await api.post(API_ENDPOINT, formData);
      await cargarExamenes(); // Refresh data
      setShowAddModal(false);
      setError(null); // Clear any previous error
    } catch (err) {
      console.error('Error:', err);
      console.error("[AdminExamenes] Detalles del error:", {
        mensaje: err.message,
        respuesta: err.response?.data,
        codigo_estado: err.response?.status
      });
      setError("Error al agregar el examen");
    }
  };

  // Update an existing exam
  const handleUpdateExamen = async (e) => {
    if (e) e.preventDefault();
    try {      
      // Usar api.put en lugar de axios.put
      await api.put(`${API_ENDPOINT}/${formData.codigo}`, formData);
      await cargarExamenes(); // Refresh data
      setShowEditModal(false);
    } catch (err) {
      console.error('Error:', err);
      console.error("[AdminExamenes] Detalles del error:", {
        mensaje: err.message,
        respuesta: err.response?.data,
        codigo_estado: err.response?.status
      });
      setError("Error al actualizar el examen");
    }
  };

  // Toggle active status
  const toggleActivo = async (examen) => {
    // Prevenir múltiples clicks rápidos en el mismo examen
    if (loading || processingExams.has(examen.codigo)) {
      console.log(`[AdminExamenes] Operación en curso para examen ${examen.codigo}, ignorando click`);
      return false;
    }

    // Verificar que el examen tenga el estado esperado antes de proceder
    const estadoActual = examen.is_active;
    console.log(`[AdminExamenes] Intentando ${!estadoActual ? 'activar' : 'archivar'} examen:`, {
      codigo: examen.codigo,
      nombre: examen.nombre_examen,
      estado_actual: estadoActual ? 'activo' : 'archivado',
      tipo: examen.tipo,
      timestamp: new Date().toISOString()
    });
    
    try {
      if (!examen.codigo) {
        console.error("[AdminExamenes] Error: Código de examen no definido");
        setError("Error: Código de examen no definido");
        return false;
      }
      
      // Marcar este examen como en procesamiento
      setProcessingExams(prev => new Set([...prev, examen.codigo]));
      setLoading(true);
      
      // Usar endpoint específico de archivar/desarchivar en lugar de actualización general
      const endpoint = !estadoActual 
        ? `${API_ENDPOINT}/${examen.codigo}/desarchivar` 
        : `${API_ENDPOINT}/${examen.codigo}/archivar`;
      
      console.log(`[AdminExamenes] Llamando a endpoint: ${endpoint}`);
      
      // Hacer solo la llamada al servidor, sin modificaciones locales
      const response = await api.put(endpoint);
      console.log(`[AdminExamenes] Respuesta del servidor:`, response.data);
      
      // Verificar que la respuesta sea válida
      if (!response.data || typeof response.data.is_active !== 'boolean') {
        console.error(`[AdminExamenes] Respuesta inválida del servidor:`, response.data);
        setError("Respuesta inválida del servidor");
        return false;
      }
      
      const expectedState = !estadoActual;
      if (response.data.is_active === expectedState) {
        console.log(`[AdminExamenes] Estado cambiado correctamente a: ${response.data.is_active ? 'activo' : 'archivado'}`);
      } else {
        console.warn(`[AdminExamenes] Inconsistencia: Estado esperado (${expectedState}) vs Estado recibido (${response.data.is_active})`);
        
        // Si el examen ya estaba en el estado objetivo, no es un error
        if (response.data.mensaje && response.data.mensaje.includes('ya estaba')) {
          console.log(`[AdminExamenes] El examen ya estaba en el estado correcto: ${response.data.mensaje}`);
        }
      }
      
      // Recargar SOLO los datos del servidor, sin modificaciones locales previas
      await cargarExamenes();
      
      if (showEditModal) {
        setShowEditModal(false);
      }
      
      return true;
    } catch (err) {
      console.error('[AdminExamenes] Error al cambiar estado del examen:', err);
      console.error('[AdminExamenes] Detalles del error:', {
        mensaje: err.message,
        respuesta: err.response?.data,
        codigo_estado: err.response?.status,
        timestamp: new Date().toISOString()
      });
      setError(`Error al ${!estadoActual ? 'activar' : 'archivar'} el examen. Detalles: ${err.message}`);
      return false;
    } finally {
      // Remover el examen del conjunto de procesamiento
      setProcessingExams(prev => {
        const newSet = new Set(prev);
        newSet.delete(examen.codigo);
        return newSet;
      });
      setLoading(false);
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
              {loading && (
                <div className={styles.adminExamenesLoadingOverlay}>
                  <div className={styles.adminExamenesLoadingText}>Actualizando...</div>
                </div>
              )}
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
                    const isProcessing = processingExams.has(examen.codigo);
                    
                    return (
                      <div className={styles.adminExamenesActions}>
                        {isActive ? (
                          <>
                            <button
                              className={styles.iconButton}
                              title="Editar"
                              onClick={() => handleEditExamen(examen)}
                              disabled={loading || isProcessing}
                            >
                              <PencilSquareIcon width={20} height={20} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className={styles.iconButton}
                              title="Activar"
                              onClick={() => toggleActivo(examen)}
                              disabled={loading || isProcessing}
                            >
                              {isProcessing ? (
                                <div className={styles.loadingSpinner}></div>
                              ) : (
                                <ArrowPathIcon width={20} height={20} />
                              )}
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
        onClose={() => {
          setShowAddModal(false);
          setError(null);
        }}
        heading="Agrega un nuevo item para cotizar"
        size="medium"
      >
        <form onSubmit={handleAddExamen} className={styles.adminExamenesForm}>
          {error && <div className={styles.adminExamenesError}>{error}</div>}
          <div className={styles.adminExamenesFormGroup}>
            <label>Código</label>
            <input 
              type="text" 
              name="codigo" 
              value={formData.codigo} 
              onChange={handleFormChange} 
              required 
              className={`${styles.adminExamenesInput} ${codigoExists ? styles.inputError : ''}`}
            />
            {codigoExists && formData.codigo && (
              <div className={styles.fieldError}>El código ya está en uso</div>
            )}
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
            <label>Precio en USD</label>
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
            <label>Indicaciones</label>
            <textarea 
              name="informacion" 
              value={formData.informacion} 
              onChange={handleFormChange} 
              placeholder="Instrucciones o información adicional"
              className={styles.adminExamenesTextarea}
            />
          </div>
          
          <div className={styles.adminExamenesModalFooter}>
            <Button variant="neutral" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={!isFormValid}
            >
              Agregar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Exam Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        heading="Editar Examen"
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
            
            <div className={styles.buttonGroup}>
              <Button
                variant="subtle"
                size="medium"
                onClick={() => toggleActivo(currentExamen)}
                className={styles.archivarButton}
                disabled={loading || (currentExamen && processingExams.has(currentExamen.codigo))}
              >
                <span className={styles.archiveIconWrapper}>
                  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5998 2.8999C1.15798 2.8999 0.799805 3.25807 0.799805 3.6999V4.4999C0.799805 4.94173 1.15798 5.2999 1.5998 5.2999H14.3998C14.8416 5.2999 15.1998 4.94173 15.1998 4.4999V3.6999C15.1998 3.25807 14.8416 2.8999 14.3998 2.8999H1.5998Z" fill="#900B09"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M1.5998 6.4999H14.3998L13.7506 12.6674C13.6649 13.4817 12.9782 14.0999 12.1594 14.0999H3.84022C3.02141 14.0999 2.33473 13.4817 2.24901 12.6674L1.5998 6.4999ZM5.5998 9.2999C5.5998 8.85807 5.95798 8.4999 6.3998 8.4999H9.5998C10.0416 8.4999 10.3998 8.85807 10.3998 9.2999C10.3998 9.74173 10.0416 10.0999 9.5998 10.0999H6.3998C5.95798 10.0999 5.5998 9.74173 5.5998 9.2999Z" fill="#900B09"/>
                  </svg>
                </span>
                <span className={styles.archivarButtonText}>
                  {(loading || (currentExamen && processingExams.has(currentExamen.codigo))) ? "Procesando..." : "Archivar"}
                </span>
              </Button>
              
              <div className={styles.frame77}>
                <Button variant="neutral" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Guardar
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Eliminado el modal de historial para simplificar */}
    </AdminLayout>
  );
};

export default AdminExamenes;
