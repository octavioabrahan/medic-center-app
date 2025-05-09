import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AgendarHora from './pages/AgendarHora';
import CotizadorExamenes from './components/public/CotizadorExamenes';
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfesionales from "./pages/admin/AdminProfesionales";
import AdminHorarios from "./pages/admin/AdminHorarios";
import AdminEspecialidades from "./pages/admin/AdminEspecialidades";
import AdminTipoAtencion from "./pages/admin/AdminTipoAtencion";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminExcepciones from "./pages/admin/AdminExcepciones";
import AgendamientoPrivadoForm from "./components/public/AgendamientoPrivadoForm";
import AdminProfesionalServicios from './pages/admin/AdminProfesionalServicios';
import AgendamientoAdmin from './pages/admin/AgendamientoAdmin';
import AdminServicios from './pages/admin/AdminServicios';
import AdminEmpresas from "./pages/admin/AdminEmpresas";
import AdminConvenios from "./pages/admin/AdminConvenios";
import AgendamientoEmpresaForm from "./components/public/AgendamientoEmpresaForm";
import AgendamientoIndex from './components/public/AgendamientoIndex';
import CotizacionesAdmin from './pages/admin/CotizacionesAdmin';
import AdminLayout from './pages/admin/components/AdminLayout';
import AdminExamenes from './pages/admin/AdminExamenes';
import AdminAdministracion from './pages/admin/AdminAdministracion';
// Importar componentes de autenticación
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
        
        {/* Ruta de login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas de administración con el nuevo layout y protección */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="profesionales" element={<AdminProfesionales />} />
          <Route path="profesionales/:id/editar-servicios" element={<AdminProfesionalServicios />} />
          <Route path="horarios" element={<AdminHorarios />} />
          <Route path="especialidades" element={<AdminEspecialidades />} />
          <Route path="tipo-atencion" element={<AdminTipoAtencion />} />
          <Route path="roles" element={<AdminRoles />} />
          <Route path="excepciones" element={<AdminExcepciones />} />
          <Route path="citas" element={<AgendamientoAdmin />} />
          <Route path="empresas" element={<AdminEmpresas />} />
          <Route path="convenios" element={<AdminConvenios />} />
          <Route path="cotizaciones" element={<CotizacionesAdmin />} />
          <Route path="servicios" element={<AdminServicios />} />
          <Route path="examenes" element={<AdminExamenes />} />
          {/* Nueva ruta para la página de administración */}
          <Route path="administracion" element={
            <ProtectedRoute requiredRoles={['admin', 'superadmin']}>
              <AdminAdministracion />
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