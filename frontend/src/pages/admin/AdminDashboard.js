import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/AdminDashboard";
import "./AdminDashboard.css";

function AdminDashboard() {
  return (
    <AdminLayout activePage="/admin/dashboard" username="Dr. Juan Pérez" role="Administrador">
      <div className="admin-dashboard-content">
        <h1>Panel de Administración</h1>
        <div className="dashboard-summary">
          <h2>Resumen general</h2>
          <p>Bienvenido al panel de administración del centro médico.</p>
        </div>
        <div className="dashboard-quick-links">
          <h3>Accesos rápidos</h3>
          <div className="links-grid">
            <Link to="/admin/citas" className="quick-link-card">Citas agendadas</Link>
            <Link to="/admin/horarios" className="quick-link-card">Horarios Médicos</Link>
            <Link to="/admin/especialidades" className="quick-link-card">Especialidades</Link>
            <Link to="/admin/servicios" className="quick-link-card">Servicios</Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
