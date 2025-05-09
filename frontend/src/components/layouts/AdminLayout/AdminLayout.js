import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';
import { auth } from '../../../api'; // Asumiendo que la API se importa desde aquí
import api from '../../../api';

/**
 * Layout principal para secciones administrativas
 */
const AdminLayout = ({ 
  children, 
  title,
  breadcrumbs = [] 
}) => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [allowedScreens, setAllowedScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = auth.getCurrentUser();
  
  // Determinar si el usuario tiene roles administrativos
  const isAdmin = currentUser?.roles?.some(role => 
    ['admin', 'superadmin'].includes(role)
  );

  // Cargar las pantallas permitidas para este usuario
  useEffect(() => {
    const fetchAllowedScreens = async () => {
      try {
        const response = await api.get('/role-screen-permissions/usuario');
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

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={styles.adminLayout}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button 
            className={styles.menuToggle} 
            onClick={toggleSidebar} 
            aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            ☰
          </button>
          <h1 className={styles.pageTitle}>{title}</h1>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.userMenu}>
            <span className={styles.userGreeting}>Bienvenido/a, {currentUser?.name || 'Usuario'}</span>
            <div className={styles.userActions}>
              <Link to="/admin/profile" className={styles.profileLink}>Mi perfil</Link>
              <button className={styles.logoutButton} onClick={handleLogout}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.mainContainer}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
          <nav className={styles.adminNav}>
            <ul className={styles.navList}>
              {isRouteAllowed('/admin') && (
                <li className={styles.navItem}>
                  <NavLink 
                    to="/admin/dashboard" 
                    className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>📊</span>
                    <span className={styles.navText}>Inicio</span>
                  </NavLink>
                </li>
              )}
              
              {/* Sección de Agendamiento */}
              <li className={styles.navSection}>
                <span className={styles.navSectionTitle}>Agendamiento</span>
              </li>
              
              {isRouteAllowed('/admin/citas') && (
                <li className={styles.navItem}>
                  <NavLink 
                    to="/admin/citas" 
                    className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>📅</span>
                    <span className={styles.navText}>Citas agendadas</span>
                  </NavLink>
                </li>
              )}
              
              {isRouteAllowed('/admin/horarios') && (
                <li className={styles.navItem}>
                  <NavLink 
                    to="/admin/horarios" 
                    className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>🕒</span>
                    <span className={styles.navText}>Horarios de atención</span>
                  </NavLink>
                </li>
              )}
              
              {isRouteAllowed('/admin/profesionales') && (
                <li className={styles.navItem}>
                  <NavLink 
                    to="/admin/profesionales" 
                    className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>👨‍⚕️</span>
                    <span className={styles.navText}>Profesionales</span>
                  </NavLink>
                </li>
              )}
              
              {isRouteAllowed('/admin/servicios') && (
                <li className={styles.navItem}>
                  <NavLink 
                    to="/admin/servicios" 
                    className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>🏥</span>
                    <span className={styles.navText}>Servicios</span>
                  </NavLink>
                </li>
              )}

              {isRouteAllowed('/admin/convenios') && (
                <li className={styles.navItem}>
                  <NavLink 
                    to="/admin/convenios" 
                    className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>📝</span>
                    <span className={styles.navText}>Convenios</span>
                  </NavLink>
                </li>
              )}
              
              {/* Sección de Cotizador */}
              <li className={styles.navSection}>
                <span className={styles.navSectionTitle}>Cotizador</span>
              </li>
              
              {isRouteAllowed('/admin/cotizaciones') && (
                <li className={styles.navItem}>
                  <NavLink 
                    to="/admin/cotizaciones" 
                    className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>💲</span>
                    <span className={styles.navText}>Cotizaciones recibidas</span>
                  </NavLink>
                </li>
              )}
              
              {isRouteAllowed('/admin/examenes') && (
                <li className={styles.navItem}>
                  <NavLink 
                    to="/admin/examenes" 
                    className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>🔬</span>
                    <span className={styles.navText}>Exámenes y servicios</span>
                  </NavLink>
                </li>
              )}
              
              {/* Sección de Administración */}
              {isRouteAllowed('/admin/administracion') && (
                <>
                  <li className={styles.navSection}>
                    <span className={styles.navSectionTitle}>Administrar</span>
                  </li>
                  <li className={styles.navItem}>
                    <NavLink 
                      to="/admin/administracion" 
                      className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                    >
                      <span className={styles.navIcon}>⚙️</span>
                      <span className={styles.navText}>Configuración</span>
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </nav>
          
          <div className={styles.sidebarFooter}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{currentUser?.name || 'Usuario'}</span>
              <span className={styles.userRole}>{currentUser?.roles?.join(', ') || 'Sin rol'}</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className={styles.content}>
          {breadcrumbs.length > 0 && (
            <div className={styles.breadcrumbs}>
              <Link to="/admin/dashboard" className={styles.breadcrumbLink}>Inicio</Link>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <span className={styles.breadcrumbSeparator}>/</span>
                  {crumb.link ? (
                    <Link to={crumb.link} className={styles.breadcrumbLink}>{crumb.label}</Link>
                  ) : (
                    <span className={styles.breadcrumbCurrent}>{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

AdminLayout.propTypes = {
  /** Contenido de la página */
  children: PropTypes.node.isRequired,
  /** Título de la página */
  title: PropTypes.string.isRequired,
  /** Migas de pan para navegación */
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      link: PropTypes.string,
    })
  ),
};

export default AdminLayout;