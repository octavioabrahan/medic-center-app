import { useState, useEffect } from "react";
import api from "../../api";

function HorarioForm() {
  const [form, setForm] = useState({
    profesional_id: "",
    dia_semana: [],
    hora_inicio: "",
    hora_termino: "",
    valido_desde: "",
    valido_hasta: "",
    tipo_atencion_id: "",
    nro_consulta: ""
  });

  const [profesionales, setProfesionales] = useState([]);
  const [tiposAtencion, setTiposAtencion] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profesionalesRes, tiposRes] = await Promise.all([
          api.get("/profesionales"),
          api.get("/tipo-atencion")
        ]);
        setProfesionales(profesionalesRes.data);
        setTiposAtencion(tiposRes.data);
      } catch (e) {
        console.error("Error cargando datos:", e);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleMultipleDays = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => parseInt(opt.value));
    setForm({ ...form, dia_semana: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/horarios", form);
      alert("Horario creado con éxito");
    } catch (error) {
      alert("Error al crear horario");
      console.error(error);
    }
  };

  const diasSemana = [
    { valor: 1, nombre: "Lunes" },
    { valor: 2, nombre: "Martes" },
    { valor: 3, nombre: "Miércoles" },
    { valor: 4, nombre: "Jueves" },
    { valor: 5, nombre: "Viernes" },
    { valor: 6, nombre: "Sábado" },
    { valor: 7, nombre: "Domingo" }
  ];

  return (
    <form onSubmit={handleSubmit}>
      <select name="profesional_id" onChange={handleChange}>
        <option value="">Selecciona un profesional</option>
        {profesionales.map((p) => (
          <option key={p.profesional_id} value={p.profesional_id}>
            {p.nombre} {p.apellido}
          </option>
        ))}
      </select>

      <select multiple name="dia_semana" onChange={handleMultipleDays}>
        {diasSemana.map((dia) => (
          <option key={dia.valor} value={dia.valor}>
            {dia.nombre}
          </option>
        ))}
      </select>

      <input type="time" name="hora_inicio" onChange={handleChange} />
      <input type="time" name="hora_termino" onChange={handleChange} />
      <input type="date" name="valido_desde" onChange={handleChange} />
      <input type="date" name="valido_hasta" onChange={handleChange} />

      <select name="tipo_atencion_id" onChange={handleChange}>
        <option value="">Selecciona tipo de atención</option>
        {tiposAtencion.map((t) => (
          <option key={t.tipo_atencion_id} value={t.tipo_atencion_id}>
            {t.nombre}
          </option>
        ))}
      </select>

      <div>
        <label htmlFor="nro_consulta">Número de consulta:</label>
        <input 
          type="number" 
          id="nro_consulta"
          name="nro_consulta" 
          min="1"
          onChange={handleChange} 
          value={form.nro_consulta}
          placeholder="Número de consulta"
        />
      </div>

      <button type="submit">Guardar</button>
    </form>
  );
}

export default HorarioForm;