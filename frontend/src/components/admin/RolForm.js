import { useState } from "react";
import api from "../../api";

function RolForm() {
  const [form, setForm] = useState({ nombre_rol: "", descripcion: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/roles", form);
      alert("Rol creado");
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre_rol" placeholder="Nombre del rol" onChange={handleChange} />
      <input name="descripcion" placeholder="Descripción" onChange={handleChange} />
      <button type="submit">Guardar</button>
    </form>
  );
}

export default RolForm;
