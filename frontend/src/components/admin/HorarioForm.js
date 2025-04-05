import { useState, useEffect } from "react";
import api from "../../api";

function HorarioForm() {
  const [form, setForm] = useState({
    profesional_id: "",
    dia_semana: "",
    hora_inicio: "",
    hora_termino: "",
    valido_desde: "",
    valido_hasta: "",
    tipo_atencion_id: ""
  });

  const [profesionales, setProfesionales] = useState([]);
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [proRes, tipoRes] = await Promise.all([
          api.get("/profesionales"),
          api.get("/tipo-atencion"),
        ]);
        setProfesionales(proRes.data);
        setTipos(tipoRes.data);
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
      await api.post("/horarios", form);
      alert("Horario guardado");
    } catch (error) {
      alert("Error al guardar horario");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select name="profesional_id" onChange={handleChange}>
        <option value="">Selecciona un profesional</option>
        {profesionales.map((pro) => (
          <option key={pro.profesional_id} value={pro.profesional_id}>
            {pro.nombre} {pro.apellido}
          </option>
        ))}
      </select>

      <input name="dia_semana" placeholder="Día (0=Lunes, 6=Domingo)" onChange={handleChange} />
      <input name="hora_inicio" type="time" onChange={handleChange} />
      <input name="hora_termino" type="time" onChange={handleChange} />
      <input name="valido_desde" type="date" onChange={handleChange} />
      <input name="valido_hasta" type="date" onChange={handleChange} />

      <select name="tipo_atencion_id" onChange={handleChange}>
        <option value="">Selecciona tipo de atención</option>
        {tipos.map((tipo) => (
          <option key={tipo.tipo_atencion_id} value={tipo.tipo_atencion_id}>
            {tipo.nombre}
          </option>
        ))}
      </select>

      <button type="submit">Guardar</button>
    </form>
  );
}

export default HorarioForm;
