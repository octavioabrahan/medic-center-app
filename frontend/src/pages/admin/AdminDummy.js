// src/pages/admin/AdminDummy.js
import React from 'react';
import { AdminLayout } from '../../components/AdminDashboard';
import { useLocation } from 'react-router-dom';
import './AdminDummy.css';

/**
 * Página de ejemplo para mostrar el AdminLayout con el menú lateral.
 */
const AdminDummy = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <AdminLayout 
      activePage={currentPath}
      username="Dr. Juan Pérez" 
      role="Administrador"
    >
      <div className="admin-dummy-container">
        <div className="admin-dummy-header">
          <h1>Panel de Administración</h1>
          <p className="admin-dummy-subtitle">Ruta actual: {currentPath}</p>
        </div>
        
        <div className="admin-dummy-content">
          <div className="admin-dummy-card">
            <h2>Bienvenido al panel administrativo</h2>
            <p>Esta es una página de demostración para visualizar el menú lateral.</p>
            <p>El menú lateral incluye las siguientes secciones:</p>
            <ul>
              <li>Resumen general</li>
              <li>Citas agendadas</li>
              <li>Horarios de atención</li>
              <li>Especialidades y profesionales</li>
              <li>Servicios</li>
              <li>Convenios</li>
              <li>Cotizaciones enviadas</li>
              <li>Exámenes y servicios</li>
              <li>Usuarios y roles</li>
            </ul>
          </div>
          
          <div className="admin-dummy-grid">
            <div className="admin-dummy-stat-card">
              <h3>Citas agendadas hoy</h3>
              <div className="admin-dummy-stat-value">24</div>
            </div>
            <div className="admin-dummy-stat-card">
              <h3>Profesionales activos</h3>
              <div className="admin-dummy-stat-value">12</div>
            </div>
            <div className="admin-dummy-stat-card">
              <h3>Cotizaciones pendientes</h3>
              <div className="admin-dummy-stat-value">8</div>
            </div>
            <div className="admin-dummy-stat-card">
              <h3>Especialidades</h3>
              <div className="admin-dummy-stat-value">15</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDummy;
