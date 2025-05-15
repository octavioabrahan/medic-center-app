// src/components/AdminDashboard/AdminSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminSidebar.css';
import { Menu, MenuHeader, MenuHeading, MenuSeparator } from '../Menu';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import logo from '../../assets/logo_header.png';

/**
 * AdminSidebar component that provides navigation for the admin dashboard.
 * 
 * Props:
 *   - username: The name of the current logged in user
 *   - role: The role of the current logged in user
 *   - activePage: The current active page
 */
const AdminSidebar = ({ username = 'Usuario', role = 'Administrador', activePage = '' }) => {
  const navigate = useNavigate();

  // No necesitamos definir los items del menú aquí ya que los definimos directamente en el render

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Implementation for logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Función para determinar si un ítem está activo
  const isActive = (path) => activePage === path;
  
  return (
    <div className="menu">
      <div className="menu-header">
        <img className="logo-1" src={logo} alt="Logo" />
      </div>
      <div className="menu-group">
        <div 
          className={isActive('/admin/dashboard') ? "menu-item2" : "menu-item"}
          onClick={() => handleNavigation('/admin/dashboard')}
        >
          <div className="body">
            <div className="row">
              <div className={isActive('/admin/dashboard') ? "label2" : "label"}>Resumen general</div>
            </div>
          </div>
        </div>
        
        <MenuSeparator />
        
        <div 
          className={isActive('/admin/citas-agendadas') ? "menu-item2" : "menu-item"}
          onClick={() => handleNavigation('/admin/citas-agendadas')}
        >
          <div className="body">
            <div className="row">
              <div className={isActive('/admin/citas-agendadas') ? "label2" : "label"}>Citas agendadas</div>
            </div>
          </div>
        </div>
        
        <div 
          className={isActive('/admin/horarios') ? "menu-item2" : "menu-item"}
          onClick={() => handleNavigation('/admin/horarios')}
        >
          <div className="body">
            <div className="row">
              <div className={isActive('/admin/horarios') ? "label2" : "label"}>Horarios de atención</div>
            </div>
          </div>
        </div>
        
        <div 
          className={isActive('/admin/especialidades') ? "menu-item2" : "menu-item"}
          onClick={() => handleNavigation('/admin/especialidades')}
        >
          <div className="body">
            <div className="row">
              <div className={isActive('/admin/especialidades') ? "label2" : "label"}>Especialidades y profesionales</div>
            </div>
          </div>
        </div>
        
        <div 
          className={isActive('/admin/servicios') ? "menu-item2" : "menu-item"}
          onClick={() => handleNavigation('/admin/servicios')}
        >
          <div className="body">
            <div className="row">
              <div className={isActive('/admin/servicios') ? "label2" : "label"}>Servicios</div>
            </div>
          </div>
        </div>
        
        <div 
          className={isActive('/admin/convenios') ? "menu-item2" : "menu-item"}
          onClick={() => handleNavigation('/admin/convenios')}
        >
          <div className="body">
            <div className="row">
              <div className={isActive('/admin/convenios') ? "label2" : "label"}>Convenios</div>
            </div>
          </div>
        </div>
        
        <MenuSeparator />
        
        <div 
          className={isActive('/admin/cotizaciones') ? "menu-item2" : "menu-item"}
          onClick={() => handleNavigation('/admin/cotizaciones')}
        >
          <div className="body">
            <div className="row">
              <div className={isActive('/admin/cotizaciones') ? "label2" : "label"}>Cotizaciones enviadas</div>
            </div>
          </div>
        </div>
        
        <div 
          className={isActive('/admin/examenes') ? "menu-item2" : "menu-item"}
          onClick={() => handleNavigation('/admin/examenes')}
        >
          <div className="body">
            <div className="row">
              <div className={isActive('/admin/examenes') ? "label2" : "label"}>Exámenes y servicios</div>
            </div>
          </div>
        </div>
        
        <MenuSeparator />
        
        <div 
          className={isActive('/admin/usuarios') ? "menu-item2" : "menu-item"}
          onClick={() => handleNavigation('/admin/usuarios')}
        >
          <div className="body">
            <div className="row">
              <div className={isActive('/admin/usuarios') ? "label2" : "label"}>Usuarios y roles</div>
            </div>
          </div>
        </div>
      </div>
      
      <MenuHeading heading={`${username} ${role}`} />
      
      <div className="menu-item" onClick={handleLogout}>
        <ArrowLeftOnRectangleIcon className="log-out" />
        <div className="body">
          <div className="row">
            <div className="label">Cerrar sesión</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
