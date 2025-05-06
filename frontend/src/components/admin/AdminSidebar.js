// frontend/src/components/admin/AdminSidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminSidebar.css';
import logo from '../../assets/logo.svg'; // Asegúrate de que la ruta sea correcta
import { auth } from '../../api';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const currentUser = auth.getCurrentUser();
  
  // Determinar si el usuario tiene roles administrativos
  const isAdmin = currentUser?.roles?.some(role => 
    ['admin', 'superadmin'].includes(role)
  );

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="DIAGNOCENTRO" className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Inicio
        </NavLink>
        
        <div className="nav-section-title">Agendamiento</div>
        
        <NavLink to="/admin/citas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Citas agendadas
        </NavLink>
        
        <NavLink to="/admin/horarios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Horarios de atención
        </NavLink>
        
        <NavLink to="/admin/profesionales" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Profesionales
        </NavLink>
        
        <NavLink to="/admin/servicios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Servicios
        </NavLink>
        
        <NavLink to="/admin/convenios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Convenios
        </NavLink>
        
        <div className="nav-section-title">Cotizador</div>
        
        <NavLink to="/admin/cotizaciones" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Cotizaciones recibidas
        </NavLink>
        
        <NavLink to="/admin/examenes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Exámenes y servicios
        </NavLink>
        
        {/* Sección de Administración - Solo visible para administradores */}
        {isAdmin && (
          <>
            <div className="nav-section-title">Administrar</div>
            
            <NavLink to="/admin/administracion" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Configuración
            </NavLink>
          </>
        )}
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-name">{currentUser?.name || 'Usuario'}</span>
          <span className="user-role">{currentUser?.roles?.join(', ') || 'Sin rol'}</span>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <span className="logout-icon">↩</span> Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;