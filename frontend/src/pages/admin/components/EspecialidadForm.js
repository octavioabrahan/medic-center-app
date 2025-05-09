import { useState } from "react";
import api from "../../api";

function EspecialidadForm() {
  const [nombre, setNombre] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/especialidades", { nombre });
      alert("Especialidad guardada");
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="nombre"
        placeholder="Nombre de la especialidad"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <button type="submit">Guardar</button>
    </form>
  );
}

export default EspecialidadForm;
