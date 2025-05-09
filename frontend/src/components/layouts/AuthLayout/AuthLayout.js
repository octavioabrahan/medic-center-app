import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './AuthLayout.module.css';

/**
 * Layout para páginas de autenticación
 */
const AuthLayout = ({ 
  children, 
  title,
  subtitle,
  logo = null,
}) => {
  return (
    <div className={styles.authLayout}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            {logo && (
              <div className={styles.logoContainer}>
                {typeof logo === 'string' ? (
                  <img src={logo} alt="Logo" className={styles.logo} />
                ) : (
                  logo
                )}
              </div>
            )}
            
            <h1 className={styles.authTitle}>{title}</h1>
            {subtitle && <p className={styles.authSubtitle}>{subtitle}</p>}
          </div>

          <div className={styles.authBody}>
            {children}
          </div>

          <div className={styles.authFooter}>
            <div className={styles.authLinks}>
              <Link to="/" className={styles.authLink}>
                Inicio
              </Link>
              <Link to="/contacto" className={styles.authLink}>
                Contacto
              </Link>
              <Link to="/ayuda" className={styles.authLink}>
                Ayuda
              </Link>
            </div>
            <div className={styles.copyright}>
              © {new Date().getFullYear()} Medic Center. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  /** Contenido del formulario de autenticación */
  children: PropTypes.node.isRequired,
  /** Título de la página de autenticación */
  title: PropTypes.string.isRequired,
  /** Subtítulo opcional */
  subtitle: PropTypes.string,
  /** Logo (puede ser una URL de imagen o un componente) */
  logo: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

export default AuthLayout;