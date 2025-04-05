import { useState, useEffect } from "react";
import api from "../../api";

function ExcepcionesPage() {
  const [profesionales, setProfesionales] = useState([]);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState("");
  const [excepciones, setExcepciones] = useState([]);
  const [fechasValidas, setFechasValidas] = useState([]);

  const [form, setForm] = useState({
    fecha: "",
    hora_inicio: "",
    hora_termino: "",
    estado: "cancelado",
    motivo: ""
  });

  useEffect(() => {
    async function fetchProfesionales() {
      const res = await api.get("/profesionales");
      setProfesionales(res.data);
    }
    fetchProfesionales();
  }, []);

  useEffect(() => {
    if (profesionalSeleccionado) {
      cargarExcepciones(profesionalSeleccionado);
      cargarFechasValidas(profesionalSeleccionado);
    }
  }, [profesionalSeleccionado]);

  const cargarExcepciones = async (id) => {
    try {
      const res = await api.get(`/excepciones/profesional/${id}`);
      setExcepciones(res.data);
    } catch (err) {
      console.error("Error al cargar excepciones:", err);
    }
  };

  const cargarFechasValidas = async (id) => {
    try {
      const res = await api.get(`/horarios/fechas/${id}`);
      setFechasValidas(res.data);
    } catch (err) {
      console.error("Error al cargar fechas válidas:", err);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/excepciones", {
        profesional_id: profesionalSeleccionado,
        ...form
      });
      alert("Excepción registrada con éxito");
      cargarExcepciones(profesionalSeleccionado);
      setForm({
        fecha: "",
        hora_inicio: "",
        hora_termino: "",
        estado: "cancelado",
        motivo: ""
      });
    } catch (err) {
      alert("Error al guardar excepción");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Gestión de Excepciones de Horario</h2>

      <select onChange={(e) => setProfesionalSeleccionado(e.target.value)}>
        <option value="">Selecciona un profesional</option>
        {profesionales.map((p) => (
          <option key={p.profesional_id} value={p.profesional_id}>
            {p.nombre} {p.apellido}
          </option>
        ))}
      </select>

      {profesionalSeleccionado && (
        <>
          <h3>Excepciones actuales</h3>
          <ul>
            {excepciones.map((ex) => (
              <li key={ex.excepcion_id}>
                {ex.fecha} | {ex.hora_inicio} - {ex.hora_termino} | {ex.estado} | {ex.motivo}
              </li>
            ))}
          </ul>

          <h3>Fechas válidas según horario</h3>
          <ul>
            {fechasValidas.map((f, index) => {
              const esExcepcion = excepciones.find((ex) => ex.fecha === f.fecha);
              return (
                <li
                  key={index}
                  style={{
                    textDecoration: esExcepcion ? "line-through" : "none",
                    color: esExcepcion ? "red" : "black"
                  }}
                >
                  {f.fecha} | {f.hora_inicio} - {f.hora_termino}
                  {esExcepcion && ` (cancelado: ${esExcepcion.motivo})`}
                </li>
              );
            })}
          </ul>

          <h3>Registrar nueva excepción</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              required
            />
            <input
              type="time"
              name="hora_inicio"
              value={form.hora_inicio}
              onChange={handleChange}
              required
            />
            <input
              type="time"
              name="hora_termino"
              value={form.hora_termino}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="motivo"
              value={form.motivo}
              onChange={handleChange}
              placeholder="Motivo (opcional)"
            />
            <button type="submit">Guardar excepción</button>
          </form>
        </>
      )}
    </div>
  );
}

export default ExcepcionesPage;