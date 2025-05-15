// src/components/AdminDashboard/AdminSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminSidebar.css';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';/components/AdminDashboard/AdminSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminSidebar.css';
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

  // Define menu items for easier management
  const menuItems = [
    { label: 'Resumen general', path: '/admin/dashboard' },
    { separator: true },
    { label: 'Citas agendadas', path: '/admin/citas' },
    { label: 'Horarios de atención', path: '/admin/horarios' },
    { label: 'Especialidades y profesionales', path: '/admin/especialidades' },
    { label: 'Servicios', path: '/admin/servicios' },
    { label: 'Convenios', path: '/admin/convenios' },
    { separator: true },
    { label: 'Cotizaciones enviadas', path: '/admin/cotizaciones' },
    { label: 'Exámenes y servicios', path: '/admin/examenes' },
    { separator: true },
    { label: 'Usuarios y roles', path: '/admin/usuarios' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Implementation for logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="menu">
      <div className="menu-header">
        <img className="logo-1" src="/logo192.png" alt="Logo Centro Médico" />
      </div>
      <div className="menu-group">
        {menuItems.map((item, index) => {
          if (item.separator) {
            return (
              <div key={`separator-${index}`} className="menu-separator">
                <div className="rule"></div>
              </div>
            );
          }
          
          const isActive = activePage === item.path;
          return (
            <div 
              key={item.label}
              className={isActive ? "menu-item2" : "menu-item"}
              onClick={() => handleNavigation(item.path)}
            >
              <div className="body">
                <div className="row">
                  <div className={isActive ? "label2" : "label"}>{item.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="menu-heading">
        <div className="text-strong">
          <div className="user-info">
            <div className="user-avatar">
              {username.charAt(0)}
            </div>
            <div className="user-details">
              <span className="text-strong-2-span">
                {username}
              </span>
              <span className="text-strong-2-span2">{role}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="menu-item logout" onClick={handleLogout}>
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
