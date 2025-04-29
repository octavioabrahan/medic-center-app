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
//import AdminAgendamientos from "./pages/admin/AdminAgendamientos";
import AdminCitas from './pages/admin/AdminCitas';
import AdminEmpresas from "./pages/admin/AdminEmpresas";
import AgendamientoEmpresaForm from "./components/public/AgendamientoEmpresaForm";
import AgendamientoIndex from './components/public/AgendamientoIndex';
import CotizacionesAdmin from './components/admin/CotizacionesAdmin';
import AdminLayout from './components/admin/AdminLayout';

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
        
        {/* Rutas de administración con el nuevo layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="profesionales" element={<ProfesionalesPage />} />
          <Route path="profesionales/:id/editar-servicios" element={<ProfesionalAsignarServicios />} />
          <Route path="horarios" element={<HorariosPage />} />
          <Route path="especialidades" element={<EspecialidadesPage />} />
          <Route path="tipo-atencion" element={<TipoAtencionPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="excepciones" element={<ExcepcionesPage />} />
          <Route path="agendamientos" element={<AdminAgendamientos />} />
          {/*<Route path="citas" element={<AdminAgendamientos />} />*/}
          <Route path="citas" element={<AdminCitas />} />
          <Route path="empresas" element={<AdminEmpresas />} />
          <Route path="cotizaciones" element={<CotizacionesAdmin />} />
          {/* Añadir más rutas de administración según sea necesario */}
        </Route>
        
        {/* Ruta para redirigir 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;