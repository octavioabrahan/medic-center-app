import { useState } from "react";
import axios from "axios";

function EspecialidadForm() {
  const [nombre, setNombre] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/api/especialidades", { nombre });
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
