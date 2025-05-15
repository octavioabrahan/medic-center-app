// src/pages/admin/AdminDummy.js
import React from 'react';
import { AdminLayout } from '../../components/AdminDashboard';
import { useLocation } from 'react-router-dom';
import './AdminDummy.css';

/**
 * Página de ejemplo para mostrar el AdminLayout con el menú lateral.
 */
const AdminDummy = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Función para obtener el título según la ruta
  const getTitleForPath = (path) => {
    switch (path) {
      case '/admin/dashboard':
        return 'Panel de Administración';
      case '/admin/citas':
        return 'Gestión de Citas Agendadas';
      case '/admin/horarios':
        return 'Horarios de Atención';
      case '/admin/especialidades':
        return 'Especialidades y Profesionales';
      case '/admin/servicios':
        return 'Servicios Médicos';
      case '/admin/convenios':
        return 'Gestión de Convenios';
      case '/admin/cotizaciones':
        return 'Cotizaciones Enviadas';
      case '/admin/examenes':
        return 'Exámenes y Servicios';
      case '/admin/usuarios':
        return 'Usuarios y Roles';
      default:
        return 'Panel de Administración';
    }
  };
  
  // Función para obtener el subtítulo de la tarjeta según la ruta
  const getCardTitleForPath = (path) => {
    switch (path) {
      case '/admin/dashboard':
        return 'Bienvenido al Panel Administrativo';
      case '/admin/citas':
        return 'Gestión de Citas Médicas';
      case '/admin/horarios':
        return 'Configuración de Horarios';
      case '/admin/especialidades':
        return 'Gestión de Especialidades';
      case '/admin/servicios':
        return 'Administración de Servicios';
      case '/admin/convenios':
        return 'Administración de Convenios';
      case '/admin/cotizaciones':
        return 'Cotizaciones de Servicios';
      case '/admin/examenes':
        return 'Catálogo de Exámenes Médicos';
      case '/admin/usuarios':
        return 'Administración de Usuarios';
      default:
        return 'Información General';
    }
  };
  
  // Función para obtener la descripción de la tarjeta según la ruta
  const getCardDescriptionForPath = (path) => {
    switch (path) {
      case '/admin/dashboard':
        return 'Esta es una vista general del panel administrativo donde puedes monitorear la actividad de la clínica.';
      case '/admin/citas':
        return 'Aquí puedes gestionar todas las citas médicas agendadas, ver detalles y realizar seguimiento.';
      case '/admin/horarios':
        return 'Configura los horarios de atención para profesionales médicos y servicios.';
      case '/admin/especialidades':
        return 'Administra las especialidades médicas disponibles y los profesionales asociados a ellas.';
      case '/admin/servicios':
        return 'Gestiona el catálogo de servicios médicos ofrecidos por el centro.';
      case '/admin/convenios':
        return 'Administra los convenios con empresas, aseguradoras y otras instituciones.';
      case '/admin/cotizaciones':
        return 'Revisa y gestiona las cotizaciones enviadas a pacientes y empresas.';
      case '/admin/examenes':
        return 'Gestiona el catálogo de exámenes médicos y servicios especializados.';
      case '/admin/usuarios':
        return 'Administra usuarios del sistema, sus roles y permisos.';
      default:
        return 'Selecciona una opción del menú lateral para ver su contenido.';
    }
  };
  
  // Función para obtener las estadísticas según la ruta
  const getStatsForPath = (path) => {
    switch (path) {
      case '/admin/dashboard':
        return [
          { title: 'Citas agendadas hoy', value: 24 },
          { title: 'Profesionales activos', value: 12 },
          { title: 'Cotizaciones pendientes', value: 8 },
          { title: 'Especialidades', value: 15 }
        ];
      case '/admin/citas':
        return [
          { title: 'Citas agendadas hoy', value: 24 },
          { title: 'Citas para mañana', value: 18 },
          { title: 'Cancelaciones', value: 3 },
          { title: 'Confirmadas', value: 35 }
        ];
      case '/admin/horarios':
        return [
          { title: 'Médicos con horario', value: 12 },
          { title: 'Bloques disponibles', value: 48 },
          { title: 'Excepciones activas', value: 5 },
          { title: 'Horas por día', value: 9 }
        ];
      case '/admin/especialidades':
        return [
          { title: 'Especialidades', value: 15 },
          { title: 'Profesionales', value: 24 },
          { title: 'Especialistas', value: 18 },
          { title: 'Servicios por esp.', value: 7 }
        ];
      case '/admin/servicios':
        return [
          { title: 'Servicios activos', value: 42 },
          { title: 'Categorías', value: 8 },
          { title: 'Más solicitado', value: 'Eco' },
          { title: 'Precio promedio', value: '$45' }
        ];
      case '/admin/convenios':
        return [
          { title: 'Convenios activos', value: 15 },
          { title: 'Empresas', value: 12 },
          { title: 'Aseguradoras', value: 7 },
          { title: 'Descuento prom.', value: '25%' }
        ];
      case '/admin/cotizaciones':
        return [
          { title: 'Cotizaciones mes', value: 87 },
          { title: 'Pendientes', value: 12 },
          { title: 'Convertidas', value: 52 },
          { title: 'Monto promedio', value: '$320' }
        ];
      case '/admin/examenes':
        return [
          { title: 'Exámenes', value: 63 },
          { title: 'Laboratorio', value: 45 },
          { title: 'Imágenes', value: 18 },
          { title: 'Más solicitado', value: 'Sangre' }
        ];
      case '/admin/usuarios':
        return [
          { title: 'Usuarios activos', value: 32 },
          { title: 'Administradores', value: 5 },
          { title: 'Asistentes', value: 12 },
          { title: 'Médicos', value: 15 }
        ];
      default:
        return [
          { title: 'Estadísticas', value: '-' },
          { title: 'Disponibles', value: '-' },
          { title: 'En', value: '-' },
          { title: 'Dashboard', value: '-' }
        ];
    }
  };
  
  return (
    <AdminLayout 
      activePage={currentPath}
      username="Dr. Juan Pérez" 
      role="Administrador"
    >
      <div className="admin-dummy-container">
        <div className="admin-dummy-header">
          <h1>{getTitleForPath(currentPath)}</h1>
          <p className="admin-dummy-subtitle">Ruta actual: {currentPath}</p>
        </div>
        
        <div className="admin-dummy-content">
          <div className="admin-dummy-card">
            <h2>{getCardTitleForPath(currentPath)}</h2>
            <p>{getCardDescriptionForPath(currentPath)}</p>
            
            {currentPath === '/admin/dashboard' && (
              <>
                <p>El menú lateral incluye las siguientes secciones:</p>
                <ul>
                  <li>Resumen general</li>
                  <li>Citas agendadas</li>
                  <li>Horarios de atención</li>
                  <li>Especialidades y profesionales</li>
                  <li>Servicios</li>
                  <li>Convenios</li>
                  <li>Cotizaciones enviadas</li>
                  <li>Exámenes y servicios</li>
                  <li>Usuarios y roles</li>
                </ul>
              </>
            )}
          </div>
          
          <div className="admin-dummy-grid">
            {getStatsForPath(currentPath).map((stat, index) => (
              <div className="admin-dummy-stat-card" key={index}>
                <h3>{stat.title}</h3>
                <div className="admin-dummy-stat-value">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDummy;
