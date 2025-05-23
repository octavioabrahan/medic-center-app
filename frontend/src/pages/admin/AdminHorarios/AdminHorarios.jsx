import React, { useState, useEffect } from 'react';
import { CalendarIcon, XMarkIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import AdminLayout from '../../../components/AdminDashboard/AdminLayout';
import Button from '../../../components/Button/Button';
import Tab from '../../../components/Tab/Tab';
import SearchField from '../../../components/Inputs/SearchField';
import Table from '../../../components/Tables/Table';
import Tag from '../../../components/Tag/Tag';
import AgregarHorario from './AgregarHorario';
import EditarHorario from './EditarHorario';
import AgregarDiasExcepciones from './AgregarDiasExcepciones';
import CancelarDiasExcepciones from './CancelarDiasExcepciones';
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
  const [sortOrder, setSortOrder] = useState('az');
  const [showAgregarHorarioModal, setShowAgregarHorarioModal] = useState(false);
  const [showEditarHorarioModal, setShowEditarHorarioModal] = useState(false);
  const [showAgregarDiaModal, setShowAgregarDiaModal] = useState(false);
  const [showCancelarDiaModal, setShowCancelarDiaModal] = useState(false);
  const [currentHorario, setCurrentHorario] = useState(null);

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
    setSearchValue('');
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const handleSearchClear = () => {
    setSearchValue('');
  };

  // Handlers para botones
  const handleAddSchedule = () => {
    setShowAgregarHorarioModal(true);
  };
  
  const handleEditHorario = (horario) => {
    setCurrentHorario(horario);
    setShowEditarHorarioModal(true);
  };

  const handleDeleteHorario = async (horarioId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      try {
        await axios.delete(`/api/horarios/${horarioId}`);
        fetchHorarios().then(data => {
          setHorarios(data);
        });
      } catch (err) {
        console.error('Error al eliminar horario:', err);
        alert('Hubo un error al eliminar el horario');
      }
    }
  };
  
  // Funciones para manejar excepciones
  const handleCancelDay = () => {
    setShowCancelarDiaModal(true);
  };
  
  const handleAddDay = () => {
    setShowAgregarDiaModal(true);
  };
  
  const handleEditExcepcion = (excepcion) => {
    console.log('Editar excepción (sin implementación)', excepcion);
  };
  
  const handleDeleteExcepcion = (excepcionId) => {
    console.log('Eliminar excepción (sin implementación)', excepcionId);
  };
  
  // Función para actualizar los datos después de agregar una nueva excepción
  const handleExcepcionSuccess = async () => {
    try {
      const excepcionesData = await fetchExcepciones();
      setExcepciones(excepcionesData);
    } catch (err) {
      console.error('Error al actualizar excepciones:', err);
    }
  };

  return (
    <AdminLayout activePage="/admin/horarios">
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
                      // Para otras columnas, usar el renderizado por defecto
                      return null;
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
                      'Tipo de excepción',
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
                        let variant = 'default';
                        let text = row.estado;
                        const estado = row.estado.toLowerCase();
                        
                        if (estado.includes('cancelado')) {
                          scheme = 'danger';
                          variant = 'secondary';
                          text = 'Cancelación';
                        } else if (estado === 'manual') {
                          scheme = 'positive';
                          variant = 'secondary';
                          text = 'Habilitación';
                        } else if (estado.includes('disponible') || estado.includes('agregado')) {
                          scheme = 'positive';
                        }
                        
                        return (
                          <div className="text">
                            <Tag 
                              text={text} 
                              scheme={scheme} 
                              variant={variant}
                              closeable={false}
                            />
                          </div>
                        );
                      }
                      
                      if (column === 'acciones') {
                        return (
                          <div className="admin-horarios__actions">
                            <button 
                              className="btn btn--icon btn--subtle btn--medium" 
                              onClick={() => handleEditExcepcion(row.excepcion)}
                              aria-label="Editar excepción"
                              title="Editar excepción"
                            >
                              <PencilIcon width={20} height={20} className="btn__icon" />
                            </button>
                            <button 
                              className="btn btn--icon btn--subtle btn--medium" 
                              onClick={() => handleDeleteExcepcion(row.excepcion.excepcion_id || row.excepcion.id)}
                              aria-label="Eliminar excepción"
                              title="Eliminar excepción"
                            >
                              <TrashIcon width={20} height={20} className="btn__icon" />
                            </button>
                          </div>
                        );
                      }
                      // Para otras columnas, usar el renderizado por defecto
                      return null;
                    }}
                  />
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Los modales han sido eliminados según requerimientos */}
      </div>
      
      {/* Modal para agregar horarios */}
      <AgregarHorario 
        isOpen={showAgregarHorarioModal} 
        onClose={() => setShowAgregarHorarioModal(false)} 
        onSuccess={() => {
          fetchHorarios().then(data => {
            setHorarios(data);
          });
        }} 
      />

      {/* Modal para editar horarios */}
      <EditarHorario 
        isOpen={showEditarHorarioModal}
        onClose={() => setShowEditarHorarioModal(false)}
        horario={currentHorario}
        onSuccess={() => {
          fetchHorarios().then(data => {
            setHorarios(data);
          });
        }}
      />
      
      {/* Modal para agregar días específicos (excepciones) */}
      <AgregarDiasExcepciones
        isOpen={showAgregarDiaModal}
        onClose={() => setShowAgregarDiaModal(false)}
        onSuccess={handleExcepcionSuccess}
      />

      {/* Modal para cancelar días específicos (excepciones) */}
      <CancelarDiasExcepciones
        isOpen={showCancelarDiaModal}
        onClose={() => setShowCancelarDiaModal(false)}
        onSuccess={handleExcepcionSuccess}
      />
    </AdminLayout>
  );
};

export default AdminHorarios;
