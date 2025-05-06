// frontend/src/components/admin/AdminSidebar.js
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminSidebar.css';
import logo from '../../assets/logo.svg'; // Asegúrate de que la ruta sea correcta
import { auth } from '../../api';
import api from '../../api';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const currentUser = auth.getCurrentUser();
  const [allowedScreens, setAllowedScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Determinar si el usuario tiene roles administrativos
  const isAdmin = currentUser?.roles?.some(role => 
    ['admin', 'superadmin'].includes(role)
  );

  // Cargar las pantallas permitidas para este usuario
  useEffect(() => {
    const fetchAllowedScreens = async () => {
      try {
        const response = await api.get('/role-screen-permissions/user-screens');
        setAllowedScreens(response.data);
      } catch (error) {
        console.error('Error al cargar pantallas permitidas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllowedScreens();
  }, []);

  // Función para verificar si una ruta está permitida para el usuario
  const isRouteAllowed = (path) => {
    // Si es superadmin, permitir todo
    if (currentUser?.roles?.includes('superadmin')) return true;
    
    // Si no hay pantallas cargadas aún, no mostrar nada excepto a superadmin
    if (loading && !currentUser?.roles?.includes('superadmin')) return false;
    
    // Para otros usuarios, verificar contra la lista de pantallas permitidas
    return allowedScreens.some(screen => screen.path === path);
  };

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
        {isRouteAllowed('/admin') && (
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Inicio
          </NavLink>
        )}
        
        <div className="nav-section-title">Agendamiento</div>
        
        {isRouteAllowed('/admin/citas') && (
          <NavLink to="/admin/citas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Citas agendadas
          </NavLink>
        )}
        
        {isRouteAllowed('/admin/horarios') && (
          <NavLink to="/admin/horarios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Horarios de atención
          </NavLink>
        )}
        
        {isRouteAllowed('/admin/profesionales') && (
          <NavLink to="/admin/profesionales" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Profesionales
          </NavLink>
        )}
        
        {isRouteAllowed('/admin/servicios') && (
          <NavLink to="/admin/servicios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Servicios
          </NavLink>
        )}
        
        {isRouteAllowed('/admin/convenios') && (
          <NavLink to="/admin/convenios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Convenios
          </NavLink>
        )}
        
        <div className="nav-section-title">Cotizador</div>
        
        {isRouteAllowed('/admin/cotizaciones') && (
          <NavLink to="/admin/cotizaciones" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Cotizaciones recibidas
          </NavLink>
        )}
        
        {isRouteAllowed('/admin/examenes') && (
          <NavLink to="/admin/examenes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Exámenes y servicios
          </NavLink>
        )}
        
        {/* Sección de Administración - Solo visible si tiene permiso */}
        {isRouteAllowed('/admin/administracion') && (
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