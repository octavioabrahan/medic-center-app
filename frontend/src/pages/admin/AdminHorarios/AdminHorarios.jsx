import React, { useState, useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/20/solid';
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
 * AdminHorarios - Componente para la gestión de horarios de profesionales
 * Muestra pestañas para horarios y excepciones, y permite buscar y agregar horarios.
 * Inicialmente muestra un mensaje cuando no hay horarios asignados.
 */
const AdminHorarios = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar horarios al montar el componente
  useEffect(() => {
    const loadHorarios = async () => {
      setLoading(true);
      try {
        const data = await fetchHorarios();
        setHorarios(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los horarios');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadHorarios();
  }, []);

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
    // Lógica para agregar nuevo horario
    console.log('Agregar nuevo horario');
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
          <div className="admin-horarios__empty-state">
            <div className="admin-horarios__empty-title">
              Aún no hay horarios asignados
            </div>
            <div className="admin-horarios__empty-description">
              Agrega horarios a los profesionales para que puedan aparecer en el sitio de agendamiento.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminHorarios;
