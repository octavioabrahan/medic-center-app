import { useState } from "react";
import axios from "axios";

function HorarioForm() {
  const [form, setForm] = useState({
    profesional_id: "",
    dia_semana: "",
    hora_inicio: "",
    hora_termino: "",
    valido_desde: "",
    valido_hasta: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/api/horarios", form);
      alert("Horario guardado");
    } catch (error) {
      console.error(error);
      alert("Error al guardar horario");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="profesional_id" placeholder="ID Profesional" onChange={handleChange} />
      <input name="dia_semana" placeholder="Día (0=Lunes, 6=Domingo)" onChange={handleChange} />
      <input name="hora_inicio" type="time" onChange={handleChange} />
      <input name="hora_termino" type="time" onChange={handleChange} />
      <input name="valido_desde" type="date" onChange={handleChange} />
      <input name="valido_hasta" type="date" onChange={handleChange} />
      <button type="submit">Guardar</button>
    </form>
  );
}

export default HorarioForm;
