import React from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/layouts';
import styles from './DashboardPage.module.css';

/**
 * Página principal del panel de administración
 */
const DashboardPage = () => {
  // Datos para las migas de pan
  const breadcrumbs = [
    { label: 'Dashboard' }
  ];

  return (
    <AdminLayout 
      title="Panel de Administración" 
      breadcrumbs={breadcrumbs}
    >
      <div className={styles.dashboardContainer}>
        <div className={styles.welcomeSection}>
          <h2 className={styles.welcomeTitle}>Bienvenido al Panel de Administración</h2>
          <p className={styles.welcomeText}>
            Desde aquí puede gestionar todos los aspectos del sistema médico. 
            Seleccione una de las opciones del menú lateral o utilice los accesos directos a continuación.
          </p>
        </div>
        
        <div className={styles.quickLinksGrid}>
          <div className={styles.quickLinkCard}>
            <Link to="/admin/profesionales" className={styles.quickLink}>
              <div className={styles.quickLinkIcon}>👨‍⚕️</div>
              <h3 className={styles.quickLinkTitle}>Profesionales</h3>
              <p className={styles.quickLinkDescription}>
                Administre los profesionales médicos y sus especialidades
              </p>
            </Link>
          </div>
          
          <div className={styles.quickLinkCard}>
            <Link to="/admin/horarios" className={styles.quickLink}>
              <div className={styles.quickLinkIcon}>🕒</div>
              <h3 className={styles.quickLinkTitle}>Horarios Médicos</h3>
              <p className={styles.quickLinkDescription}>
                Configure los horarios de atención de los profesionales
              </p>
            </Link>
          </div>
          
          <div className={styles.quickLinkCard}>
            <Link to="/admin/citas" className={styles.quickLink}>
              <div className={styles.quickLinkIcon}>📅</div>
              <h3 className={styles.quickLinkTitle}>Citas Agendadas</h3>
              <p className={styles.quickLinkDescription}>
                Visualice y gestione las citas programadas
              </p>
            </Link>
          </div>
          
          <div className={styles.quickLinkCard}>
            <Link to="/admin/cotizaciones" className={styles.quickLink}>
              <div className={styles.quickLinkIcon}>💲</div>
              <h3 className={styles.quickLinkTitle}>Cotizaciones</h3>
              <p className={styles.quickLinkDescription}>
                Gestione las cotizaciones recibidas
              </p>
            </Link>
          </div>
          
          <div className={styles.quickLinkCard}>
            <Link to="/admin/especialidades" className={styles.quickLink}>
              <div className={styles.quickLinkIcon}>🏥</div>
              <h3 className={styles.quickLinkTitle}>Especialidades</h3>
              <p className={styles.quickLinkDescription}>
                Administre las especialidades médicas disponibles
              </p>
            </Link>
          </div>
          
          <div className={styles.quickLinkCard}>
            <Link to="/admin/tipo-atencion" className={styles.quickLink}>
              <div className={styles.quickLinkIcon}>📋</div>
              <h3 className={styles.quickLinkTitle}>Tipos de Atención</h3>
              <p className={styles.quickLinkDescription}>
                Configure los diferentes tipos de atención médica
              </p>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;