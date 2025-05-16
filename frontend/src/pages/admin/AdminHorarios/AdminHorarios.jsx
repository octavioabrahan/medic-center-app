import React, { useState, useEffect } from 'react';
import { CalendarIcon, XMarkIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import AdminLayout from '../../../components/AdminDashboard/AdminLayout';
import Button from '../../../components/Button/Button';
import Tab from '../../../components/Tab/Tab';
import SearchField from '../../../components/Inputs/SearchField';
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
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentHorario, setCurrentHorario] = useState(null);
  const [sortOrder, setSortOrder] = useState('az'); // Ordenamiento alfabético

  // Cargar horarios y profesionales al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const horariosData = await fetchHorarios();
        const profesionalesData = await fetchProfesionales();
        
        setHorarios(horariosData);
        setProfesionales(profesionalesData);
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
  
  const handleCancelDay = () => {
    // Lógica para cancelar día en la pestaña de excepciones
    console.log('Cancelar día');
  };
  
  const handleAddDay = () => {
    // Lógica para agregar día en la pestaña de excepciones
    console.log('Agregar día');
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
                  <table>
                    <thead>
                      <tr>
                        <th>Profesional</th>
                        <th>Tipo de atención</th>
                        <th>Días</th>
                        <th>Hora de inicio</th>
                        <th>Hora de término</th>
                        <th>Fecha inicio</th>
                        <th>Fecha término</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHorarios.map((horario) => (
                        <tr key={horario.horario_id}>
                          <td>{horario.profesional_nombre} {horario.profesional_apellido}</td>
                          <td>{horario.tipo_atencion}</td>
                          <td>{formatHorarioSemanal(horario)}</td>
                          <td>{horario.hora_inicio?.slice(0, 5) || ""}</td>
                          <td>{horario.hora_termino?.slice(0, 5) || ""}</td>
                          <td>{horario.valido_desde ? new Date(horario.valido_desde).toLocaleDateString() : "N/A"}</td>
                          <td>{horario.valido_hasta ? new Date(horario.valido_hasta).toLocaleDateString() : "N/A"}</td>
                          <td className="admin-horarios__actions">
                            <button 
                              className="admin-horarios__action-btn edit" 
                              onClick={() => handleEditHorario(horario)}
                              aria-label="Editar horario"
                            >
                              ✏️
                            </button>
                            <button 
                              className="admin-horarios__action-btn delete" 
                              onClick={() => handleDeleteHorario(horario.horario_id)}
                              aria-label="Eliminar horario"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <div className="admin-horarios__empty-state">
                <div className="admin-horarios__empty-title">
                  No hay excepciones registradas
                </div>
                <div className="admin-horarios__empty-description">
                  Las excepciones te permiten ajustar la disponibilidad de un profesional para fechas específicas, sin alterar su horario regular.
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Modal para agregar/editar horario */}
        {showModal && (
          <div className="admin-horarios__modal-overlay">
            <div className="admin-horarios__modal">
              <div className="admin-horarios__modal-header">
                <h2>{currentHorario ? "Editar horario" : "Agregar horario de atención"}</h2>
                <button 
                  className="admin-horarios__modal-close" 
                  onClick={() => setShowModal(false)}
                  aria-label="Cerrar"
                >
                  <XMarkIcon width={20} height={20} />
                </button>
              </div>
              <div className="admin-horarios__modal-body">
                {/* Aquí iría el formulario para editar/agregar horario */}
                <p>Formulario de horario - Implementación pendiente</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminHorarios;
