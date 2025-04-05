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
  });

  const [profesionales, setProfesionales] = useState([]);

  useEffect(() => {
    async function fetchProfesionales() {
      try {
        const res = await api.get("/profesionales");
        setProfesionales(res.data);
      } catch (e) {
        console.error("Error cargando profesionales:", e);
      }
    }
    fetchProfesionales();
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

  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    async function fetchTipos() {
      try {
        const res = await api.get("/tipo-atencion");
        setTipos(res.data);
      } catch (e) {
        console.error("Error cargando tipos de atención:", e);
      }
    }
    fetchTipos();
  }, []);  

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
      <select name="tipo_atencion_id" onChange={handleChange}>
        <option value="">Selecciona tipo atención</option>
        {especialidades.map((tipo) => (
          <option key={tipo.tipo_atencion_id} value={tipo.tipo_atencion_id}>
            {tipo.nombre}
          </option>
        ))}
      </select>
      <input name="hora_inicio" type="time" onChange={handleChange} />
      <input name="hora_termino" type="time" onChange={handleChange} />
      <input name="valido_desde" type="date" onChange={handleChange} />
      <input name="valido_hasta" type="date" onChange={handleChange} />
      <button type="submit">Guardar</button>
    </form>
  );
}

export default HorarioForm;
