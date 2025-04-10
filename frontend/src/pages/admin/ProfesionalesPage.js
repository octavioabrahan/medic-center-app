import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProfesionalForm from "../../components/admin/ProfesionalForm";
import axios from "axios";

function ProfesionalesPage() {
  const [profesionales, setProfesionales] = useState([]);

  useEffect(() => {
    const fetchProfesionales = async () => {
      try {
        const res = await axios.get("/api/profesionales");
        setProfesionales(res.data);
      } catch (err) {
        console.error("Error al cargar profesionales:", err);
      }
    };

    fetchProfesionales();
  }, []);

  return (
    <div>
      <h2>Gestión de Profesionales</h2>

      <ProfesionalForm />

      <h3>Listado de profesionales</h3>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Rol</th>
            <th>Servicios</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {profesionales.map(p => (
            <tr key={p.profesional_id}>
              <td>{p.nombre} {p.apellido}</td>
              <td>{p.nombre_especialidad || "-"}</td>
              <td>{p.nombre_rol || "-"}</td>
              <td>{p.servicios?.length ? p.servicios.join(", ") : "-"}</td>
              <td>
                <Link to={`/admin/profesionales/${p.profesional_id}/editar-servicios`}>
                  Editar servicios
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProfesionalesPage;
