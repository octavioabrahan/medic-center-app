// src/pages/admin/AdminCitasAgendadas.js
import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminDashboard';
import SearchField from '../../components/Inputs/SearchField';
import SelectField from '../../components/Inputs/SelectField';
import { useLocation } from 'react-router-dom';
import './AdminCitasAgendadas.css';

/**
 * Componente para la gestión de citas agendadas en el panel de administración
 */
const AdminCitasAgendadas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('14-04-2025 20-04-2025');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Opciones para el dropdown de estados
  const statusOptions = [
    { label: 'Todos los estados', value: '' },
    { label: 'Confirmada', value: 'confirmed' },
    { label: 'Pendiente', value: 'pending' },
    { label: 'Cancelada', value: 'cancelled' }
  ];
  
  // Opciones para el dropdown de profesionales
  const professionalOptions = [
    { label: 'Todos los profesionales', value: '' },
    { label: 'Dr. Juan Pérez', value: '1' },
    { label: 'Dra. María González', value: '2' },
    { label: 'Dr. Carlos Rodríguez', value: '3' }
    // Aquí se cargarían dinámicamente los profesionales desde el backend
  ];
  
  return (
    <AdminLayout activePage="/admin/citas-agendadas">
      <div className="admin-citas-agendadas">
        <div className="admin-citas-agendadas__page-header">
          <div className="admin-citas-agendadas__menu-header">
            <div className="admin-citas-agendadas__text-strong">
              <div className="admin-citas-agendadas__title">
                Citas agendadas
              </div>
            </div>
          </div>
        </div>
        
        <div className="admin-citas-agendadas__filter-bar">
          <div className="admin-citas-agendadas__search-container">
            <SearchField 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o cédula"
              className="admin-citas-agendadas__search"
            />
          </div>
          
          <div className="admin-citas-agendadas__select-container">
            <SelectField
              options={statusOptions}
              value={selectedStatus}
              placeholder="Todos los estados"
              onChange={(value) => setSelectedStatus(value)}
            />
          </div>
          
          <div className="admin-citas-agendadas__select-container">
            <SelectField
              value={selectedDateRange}
              onChange={(value) => setSelectedDateRange(value)}
              options={[
                { label: '14-04-2025 20-04-2025', value: '14-04-2025 20-04-2025' }
              ]}
              placeholder="Seleccionar fechas"
            />
          </div>
          
          <div className="admin-citas-agendadas__select-container">
            <SelectField
              options={professionalOptions}
              value={selectedProfessional}
              placeholder="Todos los profesionales"
              onChange={(value) => setSelectedProfessional(value)}
            />
          </div>
        </div>
        
        <div className="admin-citas-agendadas__body">
          <div className="admin-citas-agendadas__text">
            <div className="admin-citas-agendadas__no-citas">
              Aún no hay citas agendadas
            </div>
            <div className="admin-citas-agendadas__description">
              Las citas que los pacientes registren desde el sitio de agendamiento aparecerán aquí.
              <br />
              Una vez se genere la primera cita, podrás gestionarla, filtrar por estado, y ver todos los detalles asociados.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCitasAgendadas;
