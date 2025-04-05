import { useState, useEffect } from "react";
import api from "../../api";

function ProfesionalForm() {
  const [form, setForm] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    especialidad_id: "",
    rol_id: ""
  });

  const [especialidades, setEspecialidades] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [espRes, rolesRes] = await Promise.all([
          api.get("/especialidades"),
          api.get("/roles"),
        ]);
        setEspecialidades(espRes.data);
        setRoles(rolesRes.data);
      } catch (e) {
        console.error("Error cargando datos:", e);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Crear profesional y obtener ID
      const res = await api.post("/profesionales", {
        cedula: form.cedula,
        nombre: form.nombre,
        apellido: form.apellido,
        especialidad_id: form.especialidad_id
      });

      const profesional_id = res.data.profesional_id;

      // 2. Asignar rol al profesional
      await api.post("/profesional-roles", {
        profesional_id,
        id_rol: form.rol_id,
        creado_desde: "panel"
      });

      alert("Profesional creado con éxito");
    } catch (error) {
      alert("Error al crear profesional");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="cedula" placeholder="Cédula" onChange={handleChange} />
      <input name="nombre" placeholder="Nombre" onChange={handleChange} />
      <input name="apellido" placeholder="Apellido" onChange={handleChange} />

      <select name="especialidad_id" onChange={handleChange}>
        <option value="">Selecciona una especialidad</option>
        {especialidades.map((esp) => (
          <option key={esp.especialidad_id} value={esp.especialidad_id}>
            {esp.nombre}
          </option>
        ))}
      </select>

      <select name="rol_id" onChange={handleChange}>
        <option value="">Selecciona un rol</option>
        {roles.map((rol) => (
          <option key={rol.id_rol} value={rol.id_rol}>
            {rol.nombre_rol}
          </option>
        ))}
      </select>

      <button type="submit">Guardar</button>
    </form>
  );
}

export default ProfesionalForm;
