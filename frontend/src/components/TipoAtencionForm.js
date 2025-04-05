import { useState } from "react";
import axios from "axios";

function TipoAtencionForm() {
  const [nombre, setNombre] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/api/tipo-atencion", { nombre });
      alert("Tipo de atención guardado");
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="nombre"
        placeholder="Nombre del tipo de atención"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <button type="submit">Guardar</button>
    </form>
  );
}

export default TipoAtencionForm;
