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

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/cotizar">Cotizar Examen</Link> | <Link to="/agendar">Agendar Hora</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cotizar" element={<CotizadorExamenes />} /> {/* 👈 este reemplaza el anterior */}
        <Route path="/agendar" element={<AgendarHora />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/profesionales" element={<ProfesionalesPage />} />
        <Route path="/admin/horarios" element={<HorariosPage />} />
        <Route path="/admin/especialidades" element={<EspecialidadesPage />} />
        <Route path="/admin/tipo-atencion" element={<TipoAtencionPage />} />
        <Route path="/admin/roles" element={<RolesPage />} />
        <Route path="/admin/excepciones" element={<ExcepcionesPage />} />
      </Routes>
    </Router>
  );
}

export default App;

