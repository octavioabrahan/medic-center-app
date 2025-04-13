import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import AgendarHora from './pages/AgendarHora';
import CotizadorExamenes from './pages/CotizadorExamenes'; // 👈 este es nuevo
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProfesionalesPage from "./pages/admin/ProfesionalesPage";
import HorariosPage from "./pages/admin/HorariosPage";
import EspecialidadesPage from "./pages/admin/EspecialidadesPage";
import TipoAtencionPage from "./pages/admin/TipoAtencionPage";
import RolesPage from "./pages/admin/RolesPage";
import ExcepcionesPage from "./pages/admin/ExcepcionesPage";
import AgendamientoPrivadoForm from "./components/public/AgendamientoPrivadoForm";
import ProfesionalAsignarServicios from './pages/admin/ProfesionalAsignarServicios';
import AdminAgendamientos from "./pages/admin/AdminAgendamientos";
import AdminEmpresas from "./pages/admin/AdminEmpresas";
import AgendamientoEmpresaForm from "./components/public/AgendamientoEmpresaForm";
import AgendamientoIndex from './components/public/AgendamientoIndex';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/cotizar">Cotizar Examen</Link> | <Link to="/agendar">Agendar Hora</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cotizar" element={<CotizadorExamenes />} />
        <Route path="/agendar" element={<AgendarHora />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/profesionales" element={<ProfesionalesPage />} />
        <Route path="/admin/horarios" element={<HorariosPage />} />
        <Route path="/admin/especialidades" element={<EspecialidadesPage />} />
        <Route path="/admin/tipo-atencion" element={<TipoAtencionPage />} />
        <Route path="/admin/roles" element={<RolesPage />} />
        <Route path="/admin/excepciones" element={<ExcepcionesPage />} />
        <Route path="/agendamiento/privado" element={<AgendamientoPrivadoForm />} />
        <Route path="/admin/profesionales/:id/editar-servicios" element={<ProfesionalAsignarServicios />} />
        <Route path="/admin/agendamientos" element={<AdminAgendamientos />} />
        <Route path="/admin/empresas" element={<AdminEmpresas />} />
        <Route path="/agendamiento/convenio" element={<AgendamientoEmpresaForm />} />
        <Route path="/agendamiento" element={<AgendamientoIndex />} />
      </Routes>
    </Router>
  );
}

export default App;

