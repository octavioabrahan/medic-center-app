import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './MainLayout.module.css';

/**
 * Layout principal para las páginas públicas del sitio
 */
const MainLayout = ({
  children,
  showFooter = true,
  showHeader = true,
}) => {
  return (
    <div className={styles.mainLayout}>
      {showHeader && (
        <header className={styles.header}>
          <div className={styles.headerContainer}>
            <div className={styles.logoContainer}>
              <Link to="/" className={styles.logoLink}>
                <span className={styles.logoText}>Medic Center</span>
              </Link>
            </div>
            
            <nav className={styles.mainNav}>
              <ul className={styles.navList}>
                <li className={styles.navItem}>
                  <Link to="/" className={styles.navLink}>
                    Inicio
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link to="/servicios" className={styles.navLink}>
                    Servicios
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link to="/profesionales" className={styles.navLink}>
                    Profesionales
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link to="/cotizador" className={styles.navLink}>
                    Cotizador
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link to="/contacto" className={styles.navLink}>
                    Contacto
                  </Link>
                </li>
              </ul>
            </nav>
            
            <div className={styles.actionButtons}>
              <Link to="/agendar" className={styles.scheduleButton}>
                Agendar Hora
              </Link>
              <Link to="/login" className={styles.loginButton}>
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </header>
      )}
      
      <main className={styles.mainContent}>
        {children}
      </main>
      
      {showFooter && (
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <div className={styles.footerGrid}>
              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Medic Center</h3>
                <p className={styles.footerDescription}>
                  Centro médico especializado en ofrecer servicios de calidad y atención personalizada.
                </p>
              </div>
              
              <div className={styles.footerColumn}>
                <h4 className={styles.footerSubtitle}>Enlaces rápidos</h4>
                <ul className={styles.footerLinks}>
                  <li><Link to="/" className={styles.footerLink}>Inicio</Link></li>
                  <li><Link to="/servicios" className={styles.footerLink}>Servicios</Link></li>
                  <li><Link to="/profesionales" className={styles.footerLink}>Profesionales</Link></li>
                  <li><Link to="/cotizador" className={styles.footerLink}>Cotizador</Link></li>
                  <li><Link to="/contacto" className={styles.footerLink}>Contacto</Link></li>
                </ul>
              </div>
              
              <div className={styles.footerColumn}>
                <h4 className={styles.footerSubtitle}>Contáctanos</h4>
                <address className={styles.footerAddress}>
                  <p>Av. Principal 123, Ciudad</p>
                  <p>Teléfono: (123) 456-7890</p>
                  <p>Email: contacto@medicenter.com</p>
                </address>
              </div>
            </div>
            
            <div className={styles.footerBottom}>
              <p className={styles.copyright}>
                © {new Date().getFullYear()} Medic Center. Todos los derechos reservados.
              </p>
              <div className={styles.footerPolicy}>
                <Link to="/privacidad" className={styles.policyLink}>Política de Privacidad</Link>
                <span className={styles.policySeparator}>|</span>
                <Link to="/terminos" className={styles.policyLink}>Términos y Condiciones</Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

MainLayout.propTypes = {
  /** Contenido principal de la página */
  children: PropTypes.node.isRequired,
  /** Si se debe mostrar el pie de página */
  showFooter: PropTypes.bool,
  /** Si se debe mostrar la cabecera */
  showHeader: PropTypes.bool,
};

export default MainLayout;