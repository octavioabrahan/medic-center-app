import { useState } from "react";
import axios from "axios";

function ProfesionalForm() {
  const [form, setForm] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    especialidad_id: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/api/profesionales", form);
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
      <input name="especialidad_id" placeholder="ID Especialidad" onChange={handleChange} />
      <button type="submit">Guardar</button>
    </form>
  );
}

export default ProfesionalForm;
