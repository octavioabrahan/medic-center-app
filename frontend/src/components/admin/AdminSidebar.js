// frontend/src/components/admin/AdminSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';
import logo from '../../assets/logo.svg'; // Asegúrate de que la ruta sea correcta

const AdminSidebar = () => {
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
        
        <NavLink to="/admin/categorias-servicios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Categorías y servicios
        </NavLink>
        
        <div className="nav-section-title">Cotizador</div>
        
        <NavLink to="/admin/cotizaciones" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Cotizaciones recibidas
        </NavLink>
        
        <NavLink to="/admin/examenes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Exámenes y servicios
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-button">
          <span className="logout-icon">↩</span> Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;