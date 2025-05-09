import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './AdminLayout.module.css';

/**
 * Layout principal para secciones administrativas
 */
const AdminLayout = ({ 
  children, 
  title,
  breadcrumbs = [] 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
            <span className={styles.userGreeting}>Bienvenido/a</span>
            <div className={styles.userActions}>
              <Link to="/admin/profile" className={styles.profileLink}>Mi perfil</Link>
              <button className={styles.logoutButton}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.mainContainer}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
          <nav className={styles.adminNav}>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <Link to="/admin/dashboard" className={styles.navLink}>
                  <span className={styles.navIcon}>📊</span>
                  <span className={styles.navText}>Dashboard</span>
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/admin/agendamiento" className={styles.navLink}>
                  <span className={styles.navIcon}>📅</span>
                  <span className={styles.navText}>Agendamiento</span>
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/admin/profesionales" className={styles.navLink}>
                  <span className={styles.navIcon}>👨‍⚕️</span>
                  <span className={styles.navText}>Profesionales</span>
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/admin/pacientes" className={styles.navLink}>
                  <span className={styles.navIcon}>🧑</span>
                  <span className={styles.navText}>Pacientes</span>
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/admin/cotizaciones" className={styles.navLink}>
                  <span className={styles.navIcon}>💲</span>
                  <span className={styles.navText}>Cotizaciones</span>
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/admin/usuarios" className={styles.navLink}>
                  <span className={styles.navIcon}>👥</span>
                  <span className={styles.navText}>Usuarios</span>
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/admin/configuracion" className={styles.navLink}>
                  <span className={styles.navIcon}>⚙️</span>
                  <span className={styles.navText}>Configuración</span>
                </Link>
              </li>
            </ul>
          </nav>
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