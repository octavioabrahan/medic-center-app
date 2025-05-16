import React, { useState, useEffect } from 'react';
import { CalendarIcon, XMarkIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import AdminLayout from '../../../components/AdminDashboard/AdminLayout';
import Button from '../../../components/Button/Button';
import Tab from '../../../components/Tab/Tab';
import SearchField from '../../../components/Inputs/SearchField';
import Table from '../../../components/Tables/Table';
import Tag from '../../../components/Tag/Tag';
import './AdminHorarios.css';

/**
 * Función para obtener los horarios desde el backend
 * @returns {Promise<Array>} - Lista de horarios
 */
const fetchHorarios = async () => {
  try {
    const response = await fetch('/api/horarios');
    if (!response.ok) {
      throw new Error('Error al obtener horarios');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

/**
 * Función para obtener los profesionales desde el backend
 * @returns {Promise<Array>} - Lista de profesionales
 */
const fetchProfesionales = async () => {
  try {
    const response = await fetch('/api/profesionales');
    if (!response.ok) {
      throw new Error('Error al obtener profesionales');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

/**
 * Función para obtener las excepciones desde el backend
 * @returns {Promise<Array>} - Lista de excepciones
 */
const fetchExcepciones = async () => {
  try {
    const response = await fetch('/api/excepciones');
    if (!response.ok) {
      throw new Error('Error al obtener excepciones');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

/**
 * Formatea el horario semanal para mostrar los días como texto
 * @param {Object} horario - Objeto horario
 * @returns {String} - Texto formateado con los días de la semana
 */
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

/**
 * AdminHorarios - Componente para la gestión de horarios de profesionales
 * Muestra pestañas para horarios y excepciones, y permite buscar y agregar horarios.
 * Inicialmente muestra un mensaje cuando no hay horarios asignados.
 */
const AdminHorarios = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [filteredHorarios, setFilteredHorarios] = useState([]);
  const [excepciones, setExcepciones] = useState([]);
  const [filteredExcepciones, setFilteredExcepciones] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentHorario, setCurrentHorario] = useState(null);
  const [currentExcepcion, setCurrentExcepcion] = useState(null);
  const [sortOrder, setSortOrder] = useState('az'); // Ordenamiento alfabético

  // Cargar horarios, excepciones y profesionales al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [horariosData, profesionalesData, excepcionesData] = await Promise.all([
          fetchHorarios(),
          fetchProfesionales(),
          fetchExcepciones()
        ]);
        
        setHorarios(horariosData);
        setProfesionales(profesionalesData);
        setExcepciones(excepcionesData);
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filtrar y ordenar horarios cuando cambia la búsqueda o el ordenamiento
  useEffect(() => {
    if (horarios.length > 0) {
      let results = [...horarios];
      
      // Filtrar por término de búsqueda
      if (searchValue.trim() !== "") {
        const term = searchValue.toLowerCase();
        results = results.filter(horario => 
          `${horario.profesional_nombre || ''} ${horario.profesional_apellido || ''}`.toLowerCase().includes(term) ||
          (horario.tipo_atencion || '').toLowerCase().includes(term)
        );
      }
      
      // Aplicar ordenamiento alfabético
      if (sortOrder === 'az') {
        results.sort((a, b) => 
          `${a.profesional_nombre || ''} ${a.profesional_apellido || ''}`.localeCompare(`${b.profesional_nombre || ''} ${b.profesional_apellido || ''}`)
        );
      } else if (sortOrder === 'za') {
        results.sort((a, b) => 
          `${b.profesional_nombre || ''} ${b.profesional_apellido || ''}`.localeCompare(`${a.profesional_nombre || ''} ${a.profesional_apellido || ''}`)
        );
      }
      
      setFilteredHorarios(results);
    } else {
      setFilteredHorarios([]);
    }
  }, [searchValue, horarios, sortOrder]);
  
  // Filtrar y ordenar excepciones cuando cambia la búsqueda o el ordenamiento
  useEffect(() => {
    if (excepciones.length > 0) {
      let results = [...excepciones];
      
      // Filtrar por término de búsqueda
      if (searchValue.trim() !== "") {
        const term = searchValue.toLowerCase();
        results = results.filter(excepcion => 
          `${excepcion.profesional_nombre || ''} ${excepcion.profesional_apellido || ''}`.toLowerCase().includes(term) ||
          (excepcion.motivo || '').toLowerCase().includes(term)
        );
      }
      
      // Aplicar ordenamiento alfabético
      if (sortOrder === 'az') {
        results.sort((a, b) => 
          `${a.profesional_nombre || ''} ${a.profesional_apellido || ''}`.localeCompare(`${b.profesional_nombre || ''} ${b.profesional_apellido || ''}`)
        );
      } else if (sortOrder === 'za') {
        results.sort((a, b) => 
          `${b.profesional_nombre || ''} ${b.profesional_apellido || ''}`.localeCompare(`${a.profesional_nombre || ''} ${a.profesional_apellido || ''}`)
        );
      }
      
      setFilteredExcepciones(results);
    } else {
      setFilteredExcepciones([]);
    }
  }, [searchValue, excepciones, sortOrder]);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const handleSearchClear = () => {
    setSearchValue('');
  };

  const handleAddSchedule = () => {
    // Abrir modal para agregar horario
    setCurrentHorario(null);
    setShowModal(true);
  };
  
  const handleEditHorario = (horario) => {
    setCurrentHorario(horario);
    setCurrentExcepcion(null); // Aseguramos que no hay excepción seleccionada
    setShowModal(true);
  };

  const handleDeleteHorario = async (horarioId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      try {
        const response = await fetch(`/api/horarios/${horarioId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Error al eliminar horario');
        }
        
        // Actualizar la lista de horarios
        const updatedHorarios = horarios.filter(h => h.horario_id !== horarioId);
        setHorarios(updatedHorarios);
      } catch (err) {
        console.error('Error eliminando horario:', err);
        alert('Hubo un error al eliminar el horario');
      }
    }
  };
  
  // Funciones para manejar excepciones
  const handleCancelDay = () => {
    // Abrir modal para cancelar día (crear excepción con estado "Cancelado")
    setCurrentExcepcion({
      estado: 'Cancelado'
    });
    setCurrentHorario(null); // Aseguramos que no hay horario seleccionado
    setShowModal(true);
  };
  
  const handleAddDay = () => {
    // Abrir modal para agregar día especial (crear excepción con estado personalizado)
    setCurrentExcepcion({
      estado: 'Disponible'
    });
    setCurrentHorario(null); // Aseguramos que no hay horario seleccionado
    setShowModal(true);
  };
  
  const handleEditExcepcion = (excepcion) => {
    setCurrentExcepcion(excepcion);
    setCurrentHorario(null); // Aseguramos que no hay horario seleccionado
    setShowModal(true);
  };
  
  const handleDeleteExcepcion = async (excepcionId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta excepción?')) {
      try {
        const response = await fetch(`/api/excepciones/${excepcionId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Error al eliminar excepción');
        }
        
        // Actualizar la lista de excepciones
        const updatedExcepciones = excepciones.filter(e => e.excepcion_id !== excepcionId);
        setExcepciones(updatedExcepciones);
      } catch (err) {
        console.error('Error eliminando excepción:', err);
        alert('Hubo un error al eliminar la excepción');
      }
    }
  };

  return (
    <AdminLayout activePage="horarios">
      <div className="admin-horarios">
        <div className="admin-horarios__page-header">
          <div className="admin-horarios__menu-header">
            <div className="admin-horarios__text-strong">
              <div className="admin-horarios__title">Horario de atención</div>
            </div>
          </div>
        </div>
        
        <div className="admin-horarios__tabs">
          <Tab 
            label="Horario de los profesionales" 
            active={activeTab === 0} 
            onClick={() => handleTabClick(0)}
          />
          <Tab 
            label="Excepciones" 
            active={activeTab === 1} 
            onClick={() => handleTabClick(1)}
          />
        </div>
        
        {activeTab === 0 ? (
          <>
            <div className="admin-horarios__filter-bar">
              <div className="admin-horarios__search-container">
                <SearchField
                  value={searchValue}
                  onChange={handleSearchChange}
                  onClear={handleSearchClear}
                  placeholder="Buscar por profesional"
                  className="admin-horarios__search"
                />
              </div>
              <Button 
                variant="primary" 
                onClick={handleAddSchedule}
              >
                <CalendarIcon className="btn__icon" />
                <span style={{ marginLeft: '.5rem' }}>Agregar horario</span>
              </Button>
            </div>
            
            <div className="admin-horarios__body">
              {loading ? (
                <div className="admin-horarios__loading">Cargando horarios...</div>
              ) : error ? (
                <div className="admin-horarios__error">{error}</div>
              ) : filteredHorarios.length === 0 ? (
                <div className="admin-horarios__empty-state">
                  <div className="admin-horarios__empty-title">
                    Aún no hay horarios asignados
                  </div>
                  <div className="admin-horarios__empty-description">
                    Agrega horarios a los profesionales para que puedan aparecer en el sitio de agendamiento.
                  </div>
                </div>
              ) : (
                <div className="admin-horarios__table">
                  <Table
                    headers={[
                      'Profesional',
                      'Tipo de atención',
                      'Días',
                      'Hora de inicio',
                      'Hora de término',
                      'Fecha inicio',
                      'Fecha término',
                      'Acciones'
                    ]}
                    data={filteredHorarios.map(horario => ({
                      profesional: `${horario.profesional_nombre || ''} ${horario.profesional_apellido || ''}`.trim(),
                      tipo_atencion: horario.tipo_atencion || '',
                      dias: formatHorarioSemanal(horario),
                      hora_inicio: horario.hora_inicio?.slice(0, 5) || "N/A",
                      hora_termino: horario.hora_termino?.slice(0, 5) || "N/A",
                      fecha_inicio: horario.valido_desde ? new Date(horario.valido_desde).toLocaleDateString() : "N/A",
                      fecha_termino: horario.valido_hasta ? new Date(horario.valido_hasta).toLocaleDateString() : "N/A",
                      acciones: horario.horario_id,
                      horario: horario // Para poder acceder al objeto completo
                    }))}
                    columns={['profesional', 'tipo_atencion', 'dias', 'hora_inicio', 'hora_termino', 'fecha_inicio', 'fecha_termino', 'acciones']}
                    renderCustomCell={(row, column) => {
                      if (column === 'acciones') {
                        return (
                          <div className="admin-horarios__actions">
                            <button 
                              className="admin-horarios__action-btn edit" 
                              onClick={() => handleEditHorario(row.horario)}
                              aria-label="Editar horario"
                            >
                              <PencilIcon width={16} height={16} />
                            </button>
                            <button 
                              className="admin-horarios__action-btn delete" 
                              onClick={() => handleDeleteHorario(row.horario.horario_id)}
                              aria-label="Eliminar horario"
                            >
                              <TrashIcon width={16} height={16} />
                            </button>
                          </div>
                        );
                      }
                      return null; // Para otras columnas, usar el renderizado por defecto
                    }}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="admin-horarios__filter-bar">
              <div className="admin-horarios__search-container">
                <SearchField
                  value={searchValue}
                  onChange={handleSearchChange}
                  onClear={handleSearchClear}
                  placeholder="Buscar por profesional"
                  className="admin-horarios__search"
                />
              </div>
              <div className="admin-horarios__button-group">
                <Button 
                  variant="neutral" 
                  onClick={handleCancelDay}
                >
                  <XMarkIcon className="btn__icon" />
                  <span style={{ marginLeft: '.5rem' }}>Cancelar día</span>
                </Button>
                <Button 
                  variant="neutral" 
                  onClick={handleAddDay}
                >
                  <PlusIcon className="btn__icon" />
                  <span style={{ marginLeft: '.5rem' }}>Agregar día</span>
                </Button>
              </div>
            </div>
            
            <div className="admin-horarios__body">
              {loading ? (
                <div className="admin-horarios__loading">Cargando excepciones...</div>
              ) : error ? (
                <div className="admin-horarios__error">{error}</div>
              ) : filteredExcepciones.length === 0 ? (
                <div className="admin-horarios__empty-state">
                  <div className="admin-horarios__empty-title">
                    No hay excepciones registradas
                  </div>
                  <div className="admin-horarios__empty-description">
                    Las excepciones te permiten ajustar la disponibilidad de un profesional para fechas específicas, sin alterar su horario regular.
                  </div>
                </div>
              ) : (
                <div className="admin-horarios__table">
                  <Table
                    headers={[
                      'Profesional',
                      'Fecha',
                      'Estado',
                      'Hora inicio',
                      'Hora término',
                      'Motivo',
                      'Acciones'
                    ]}
                    data={filteredExcepciones.map(excepcion => ({
                      profesional: `${excepcion.profesional_nombre || ''} ${excepcion.profesional_apellido || ''}`.trim(),
                      fecha: excepcion.fecha ? new Date(excepcion.fecha).toLocaleDateString() : "No disponible",
                      estado: excepcion.estado || "No especificado",
                      hora_inicio: excepcion.hora_inicio?.slice(0, 5) || "N/A",
                      hora_termino: excepcion.hora_termino?.slice(0, 5) || "N/A",
                      motivo: excepcion.motivo || "No especificado",
                      acciones: excepcion.excepcion_id || excepcion.id,
                      excepcion: excepcion // Para poder acceder al objeto completo
                    }))}
                    columns={['profesional', 'fecha', 'estado', 'hora_inicio', 'hora_termino', 'motivo', 'acciones']}
                    renderCustomCell={(row, column) => {
                      if (column === 'estado') {
                        let scheme = 'neutral';
                        const estado = row.estado.toLowerCase();
                        
                        if (estado.includes('cancelado')) {
                          scheme = 'danger';
                        } else if (estado.includes('disponible') || estado.includes('agregado')) {
                          scheme = 'positive';
                        }
                        
                        return (
                          <div className="text">
                            <Tag 
                              text={row.estado} 
                              scheme={scheme} 
                              closeable={false}
                            />
                          </div>
                        );
                      }
                      
                      if (column === 'acciones') {
                        return (
                          <div className="admin-horarios__actions">
                            <button 
                              className="admin-horarios__action-btn edit" 
                              onClick={() => handleEditExcepcion(row.excepcion)}
                              aria-label="Editar excepción"
                            >
                              <PencilIcon width={16} height={16} />
                            </button>
                            <button 
                              className="admin-horarios__action-btn delete" 
                              onClick={() => handleDeleteExcepcion(row.excepcion.excepcion_id || row.excepcion.id)}
                              aria-label="Eliminar excepción"
                            >
                              <TrashIcon width={16} height={16} />
                            </button>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Modal para agregar/editar horarios o excepciones */}
        {showModal && (
          <div className="admin-horarios__modal-overlay">
            <div className="admin-horarios__modal">
              <div className="admin-horarios__modal-header">
                <h2>
                  {currentHorario && (currentHorario.horario_id ? "Editar horario" : "Agregar horario de atención")}
                  {currentExcepcion && (currentExcepcion.excepcion_id ? "Editar excepción" : 
                    currentExcepcion.estado === 'Cancelado' ? "Cancelar día" : "Agregar día especial")}
                </h2>
                <button 
                  className="admin-horarios__modal-close" 
                  onClick={() => setShowModal(false)}
                  aria-label="Cerrar"
                >
                  <XMarkIcon width={20} height={20} />
                </button>
              </div>
              <div className="admin-horarios__modal-body">
                {currentHorario && (
                  <div className="admin-horarios__form">
                    <div className="admin-horarios__form-group">
                      <label htmlFor="profesional_id" className="admin-horarios__label">
                        Profesional
                      </label>
                      <select
                        id="profesional_id"
                        name="profesional_id"
                        className="admin-horarios__input"
                        value={currentHorario.profesional_id || ""}
                        onChange={e => setCurrentHorario({...currentHorario, profesional_id: e.target.value})}
                        required
                      >
                        <option value="">Selecciona un profesional</option>
                        {profesionales.map((profesional) => (
                          <option key={profesional.profesional_id} value={profesional.profesional_id}>
                            {profesional.nombre} {profesional.apellido}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="admin-horarios__form-group">
                      <label className="admin-horarios__label">Días de semana</label>
                      <div className="admin-horarios__checkbox-group">
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => {
                          const diasSemana = Array.isArray(currentHorario.dia_semana) 
                            ? currentHorario.dia_semana 
                            : currentHorario.dia_semana ? [currentHorario.dia_semana] : [];
                          
                          return (
                            <div key={index} className="admin-horarios__checkbox-item">
                              <input
                                type="checkbox"
                                id={`day-${index + 1}`}
                                name={`day-${index + 1}`}
                                value={index + 1}
                                checked={diasSemana.includes(index + 1)}
                                onChange={e => {
                                  const day = parseInt(e.target.value);
                                  const isChecked = e.target.checked;
                                  let updatedDays = [...diasSemana];
                                  
                                  if (isChecked && !updatedDays.includes(day)) {
                                    updatedDays.push(day);
                                  } else if (!isChecked) {
                                    updatedDays = updatedDays.filter(d => d !== day);
                                  }
                                  
                                  setCurrentHorario({
                                    ...currentHorario,
                                    dia_semana: updatedDays
                                  });
                                }}
                              />
                              <label htmlFor={`day-${index + 1}`}>{day}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="admin-horarios__form-row">
                      <div className="admin-horarios__form-group">
                        <label htmlFor="hora_inicio" className="admin-horarios__label">
                          Hora de inicio
                        </label>
                        <input
                          type="time"
                          id="hora_inicio"
                          name="hora_inicio"
                          className="admin-horarios__input"
                          value={currentHorario.hora_inicio?.slice(0, 5) || ""}
                          onChange={e => setCurrentHorario({...currentHorario, hora_inicio: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="admin-horarios__form-group">
                        <label htmlFor="hora_termino" className="admin-horarios__label">
                          Hora de término
                        </label>
                        <input
                          type="time"
                          id="hora_termino"
                          name="hora_termino"
                          className="admin-horarios__input"
                          value={currentHorario.hora_termino?.slice(0, 5) || ""}
                          onChange={e => setCurrentHorario({...currentHorario, hora_termino: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="admin-horarios__form-row">
                      <div className="admin-horarios__form-group">
                        <label htmlFor="valido_desde" className="admin-horarios__label">
                          Fecha inicio
                        </label>
                        <input
                          type="date"
                          id="valido_desde"
                          name="valido_desde"
                          className="admin-horarios__input"
                          value={currentHorario.valido_desde || ""}
                          onChange={e => setCurrentHorario({...currentHorario, valido_desde: e.target.value})}
                        />
                      </div>
                      
                      <div className="admin-horarios__form-group">
                        <label htmlFor="valido_hasta" className="admin-horarios__label">
                          Fecha término
                        </label>
                        <input
                          type="date"
                          id="valido_hasta"
                          name="valido_hasta"
                          className="admin-horarios__input"
                          value={currentHorario.valido_hasta || ""}
                          onChange={e => setCurrentHorario({...currentHorario, valido_hasta: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="admin-horarios__form-row">
                      <div className="admin-horarios__form-group">
                        <label htmlFor="duracion_turno" className="admin-horarios__label">
                          Duración de cada turno (minutos)
                        </label>
                        <input
                          type="number"
                          id="duracion_turno"
                          name="duracion_turno"
                          className="admin-horarios__input"
                          value={currentHorario.duracion_turno || 30}
                          onChange={e => setCurrentHorario({...currentHorario, duracion_turno: parseInt(e.target.value)})}
                          min="10"
                          max="120"
                          step="5"
                          required
                        />
                      </div>
                    </div>

                    <div className="admin-horarios__form-buttons">
                      <Button type="button" variant="neutral" onClick={() => setShowModal(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        type="button" 
                        variant="primary"
                        onClick={async () => {
                          try {
                            // Determinar si es agregar o editar según la presencia de horario_id
                            const method = currentHorario.horario_id ? 'PUT' : 'POST';
                            const url = currentHorario.horario_id ? `/api/horarios/${currentHorario.horario_id}` : '/api/horarios';
                            
                            const response = await fetch(url, {
                              method,
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify(currentHorario),
                            });
                            
                            if (!response.ok) {
                              throw new Error(`Error al ${currentHorario.horario_id ? 'actualizar' : 'crear'} el horario`);
                            }
                            
                            // Recargar horarios
                            const updatedHorarios = await fetchHorarios();
                            setHorarios(updatedHorarios);
                            
                            // Cerrar modal
                            setShowModal(false);
                          } catch (err) {
                            console.error('Error:', err);
                            alert(`Error: ${err.message}`);
                          }
                        }}
                      >
                        {currentHorario.horario_id ? 'Actualizar' : 'Guardar'}
                      </Button>
                    </div>
                  </div>
                )}
                
                {currentExcepcion && (
                  <div className="admin-horarios__form">
                    <div className="admin-horarios__form-group">
                      <label htmlFor="excepcion_profesional_id" className="admin-horarios__label">
                        Profesional
                      </label>
                      <select
                        id="excepcion_profesional_id"
                        name="excepcion_profesional_id"
                        className="admin-horarios__input"
                        value={currentExcepcion.profesional_id || ""}
                        onChange={e => setCurrentExcepcion({...currentExcepcion, profesional_id: e.target.value})}
                        required
                      >
                        <option value="">Selecciona un profesional</option>
                        {profesionales.map((profesional) => (
                          <option key={profesional.profesional_id} value={profesional.profesional_id}>
                            {profesional.nombre} {profesional.apellido}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-horarios__form-group">
                      <label htmlFor="excepcion_fecha" className="admin-horarios__label">
                        Fecha
                      </label>
                      <input
                        type="date"
                        id="excepcion_fecha"
                        name="excepcion_fecha"
                        className="admin-horarios__input"
                        value={currentExcepcion.fecha || ""}
                        onChange={e => setCurrentExcepcion({...currentExcepcion, fecha: e.target.value})}
                        required
                      />
                    </div>

                    <div className="admin-horarios__form-group">
                      <label htmlFor="excepcion_estado" className="admin-horarios__label">
                        Estado
                      </label>
                      <select
                        id="excepcion_estado"
                        name="excepcion_estado"
                        className="admin-horarios__input"
                        value={currentExcepcion.estado || "Cancelado"}
                        onChange={e => setCurrentExcepcion({...currentExcepcion, estado: e.target.value})}
                        required
                      >
                        <option value="Cancelado">Cancelado</option>
                        <option value="Disponible">Día disponible</option>
                        <option value="Especial">Horario especial</option>
                      </select>
                    </div>

                    {currentExcepcion.estado !== 'Cancelado' && (
                      <div className="admin-horarios__form-row">
                        <div className="admin-horarios__form-group">
                          <label htmlFor="excepcion_hora_inicio" className="admin-horarios__label">
                            Hora de inicio
                          </label>
                          <input
                            type="time"
                            id="excepcion_hora_inicio"
                            name="excepcion_hora_inicio"
                            className="admin-horarios__input"
                            value={currentExcepcion.hora_inicio?.slice(0, 5) || ""}
                            onChange={e => setCurrentExcepcion({...currentExcepcion, hora_inicio: e.target.value})}
                            required={currentExcepcion.estado !== 'Cancelado'}
                          />
                        </div>
                        
                        <div className="admin-horarios__form-group">
                          <label htmlFor="excepcion_hora_termino" className="admin-horarios__label">
                            Hora de término
                          </label>
                          <input
                            type="time"
                            id="excepcion_hora_termino"
                            name="excepcion_hora_termino"
                            className="admin-horarios__input"
                            value={currentExcepcion.hora_termino?.slice(0, 5) || ""}
                            onChange={e => setCurrentExcepcion({...currentExcepcion, hora_termino: e.target.value})}
                            required={currentExcepcion.estado !== 'Cancelado'}
                          />
                        </div>
                      </div>
                    )}

                    <div className="admin-horarios__form-group">
                      <label htmlFor="excepcion_motivo" className="admin-horarios__label">
                        Motivo
                      </label>
                      <textarea
                        id="excepcion_motivo"
                        name="excepcion_motivo"
                        className="admin-horarios__textarea"
                        value={currentExcepcion.motivo || ""}
                        onChange={e => setCurrentExcepcion({...currentExcepcion, motivo: e.target.value})}
                        rows={4}
                        placeholder="Especifica el motivo de esta excepción"
                      />
                    </div>

                    <div className="admin-horarios__form-buttons">
                      <Button type="button" variant="neutral" onClick={() => setShowModal(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        type="button" 
                        variant="primary"
                        onClick={async () => {
                          try {
                            // Determinar si es agregar o editar según la presencia de excepcion_id
                            const method = currentExcepcion.excepcion_id ? 'PUT' : 'POST';
                            const url = currentExcepcion.excepcion_id ? `/api/excepciones/${currentExcepcion.excepcion_id}` : '/api/excepciones';
                            
                            const response = await fetch(url, {
                              method,
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify(currentExcepcion),
                            });
                            
                            if (!response.ok) {
                              throw new Error(`Error al ${currentExcepcion.excepcion_id ? 'actualizar' : 'crear'} la excepción`);
                            }
                            
                            // Recargar excepciones
                            const updatedExcepciones = await fetchExcepciones();
                            setExcepciones(updatedExcepciones);
                            
                            // Cerrar modal
                            setShowModal(false);
                          } catch (err) {
                            console.error('Error:', err);
                            alert(`Error: ${err.message}`);
                          }
                        }}
                      >
                        {currentExcepcion.excepcion_id ? 'Actualizar' : 'Guardar'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminHorarios;
