import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AgendarHora from './pages/AgendarHora';
import CotizadorExamenes from './components/public/CotizadorExamenes';
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProfesionalesPage from "./pages/admin/ProfesionalesPage";
import HorariosPage from "./pages/admin/HorariosPage";
import EspecialidadesPage from "./pages/admin/EspecialidadesPage";
import TipoAtencionPage from "./pages/admin/TipoAtencionPage";
import RolesPage from "./pages/admin/RolesPage";
import ExcepcionesPage from "./pages/admin/ExcepcionesPage";
import AgendamientoPrivadoForm from "./components/public/AgendamientoPrivadoForm";
import ProfesionalAsignarServicios from './pages/admin/ProfesionalAsignarServicios';
import AdminCitas from './pages/admin/AdminCitas';
import ServiciosPage from './pages/admin/ServiciosPage';
import AdminEmpresas from "./pages/admin/AdminEmpresas";
import AdminConvenios from "./pages/admin/AdminConvenios";
import AgendamientoEmpresaForm from "./components/public/AgendamientoEmpresaForm";
import AgendamientoIndex from './components/public/AgendamientoIndex';
import CotizacionesAdmin from './components/admin/CotizacionesAdmin';
import AdminLayout from './components/admin/AdminLayout';
import AdminExamenes from './pages/admin/AdminExamenes';
import AdministracionPage from './pages/admin/AdministracionPage'; // Nueva página de administración
import ButtonDemo from './components/Button/ButtonDemo';
// Importar componentes de autenticación
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
// Eliminamos la importación no utilizada de 'auth'

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/cotizar" element={<CotizadorExamenes />} />
        <Route path="/agendar" element={<AgendarHora />} />
        <Route path="/agendamiento/privado" element={<AgendamientoPrivadoForm />} />
        <Route path="/agendamiento/convenio" element={<AgendamientoEmpresaForm />} />
        <Route path="/agendamiento" element={<AgendamientoIndex />} />
        <Route path="/buttondemo" element={<ButtonDemo />} />
        
        {/* Ruta de login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas de administración con el nuevo layout y protección */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="profesionales" element={<ProfesionalesPage />} />
          <Route path="profesionales/:id/editar-servicios" element={<ProfesionalAsignarServicios />} />
          <Route path="horarios" element={<HorariosPage />} />
          <Route path="especialidades" element={<EspecialidadesPage />} />
          <Route path="tipo-atencion" element={<TipoAtencionPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="excepciones" element={<ExcepcionesPage />} />
          <Route path="citas" element={<AdminCitas />} />
          <Route path="empresas" element={<AdminEmpresas />} />
          <Route path="convenios" element={<AdminConvenios />} />
          <Route path="cotizaciones" element={<CotizacionesAdmin />} />
          <Route path="servicios" element={<ServiciosPage />} />
          <Route path="examenes" element={<AdminExamenes />} />
          {/* Nueva ruta para la página de administración */}
          <Route path="administracion" element={
            <ProtectedRoute requiredRoles={['admin', 'superadmin']}>
              <AdministracionPage />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Ruta para acceso denegado */}
        <Route path="/forbidden" element={<div className="error-page">
          <h1>Acceso Denegado</h1>
          <p>No tiene los permisos necesarios para acceder a esta página.</p>
          <button onClick={() => window.history.back()}>Volver</button>
        </div>} />
        
        {/* Ruta para redirigir 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;