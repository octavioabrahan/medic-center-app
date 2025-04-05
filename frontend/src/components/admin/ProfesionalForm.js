import { useState, useEffect } from "react";
import api from "../../api";

function ProfesionalForm() {
  const [form, setForm] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    especialidad_id: "",
  });

  const [especialidades, setEspecialidades] = useState([]);

  useEffect(() => {
    async function fetchEspecialidades() {
      try {
        const res = await api.get("/especialidades");
        setEspecialidades(res.data);
      } catch (e) {
        console.error("Error cargando especialidades:", e);
      }
    }
    fetchEspecialidades();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/profesionales", form);
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
      <button type="submit">Guardar</button>
    </form>
  );
}

export default ProfesionalForm;
