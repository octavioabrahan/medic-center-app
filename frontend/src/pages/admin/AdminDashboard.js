import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div>
      <h1>Panel de Administración</h1>
      <ul>
        <li><Link to="/admin/profesionales">Profesionales</Link></li>
        <li><Link to="/admin/horarios">Horarios Médicos</Link></li>
        <li><Link to="/admin/especialidades">Especialidades</Link></li>
        <li><Link to="/admin/tipo-atencion">Tipos de Atención</Link></li>
      </ul>
    </div>
  );
}

export default AdminDashboard;
