import { useState, useEffect } from "react";
import api from "../../api";

function ExcepcionesPage() {
  const [profesionales, setProfesionales] = useState([]);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState("");
  const [fechasValidas, setFechasValidas] = useState([]);
  const [excepciones, setExcepciones] = useState([]);

  const [form, setForm] = useState({
    fecha: "",
    hora_inicio: "",
    hora_termino: "",
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

  const cargarFechasValidas = async (id) => {
    const res = await api.get(`/horarios/fechas/${id}`);
    setFechasValidas(res.data);
  };

  const cargarExcepciones = async (id) => {
    const res = await api.get(`/excepciones/profesional/${id}`);
    setExcepciones(res.data);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const cancelarFecha = async (fecha, hora_inicio, hora_termino) => {
    try {
      await api.post("/excepciones", {
        profesional_id: profesionalSeleccionado,
        fecha,
        estado: "cancelado",
        hora_inicio,
        hora_termino,
        motivo: "Cancelación desde UI"
      });
      cargarExcepciones(profesionalSeleccionado);
    } catch (err) {
      alert("Error al cancelar fecha");
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/excepciones", {
        profesional_id: profesionalSeleccionado,
        ...form,
        estado: "manual"
      });
      alert("Excepción registrada con éxito");
      cargarExcepciones(profesionalSeleccionado);
      cargarFechasValidas(profesionalSeleccionado);
      setForm({ fecha: "", hora_inicio: "", hora_termino: "", motivo: "" });
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
          <h3>Fechas válidas según horario</h3>
          <ul>
            {fechasValidas.map((f, index) => {
              const esExcepcion = excepciones.find((ex) => ex.fecha === f.fecha);
              return (
                <li key={index}>
                  <span
                    style={{
                      textDecoration: esExcepcion ? "line-through" : "none",
                      color: esExcepcion ? "red" : "black"
                    }}
                  >
                    {f.fecha} | {f.hora_inicio} - {f.hora_termino}
                  </span>
                  {!esExcepcion && (
                    <button
                      onClick={() =>
                        cancelarFecha(f.fecha, f.hora_inicio, f.hora_termino)
                      }
                      style={{ marginLeft: 10 }}
                    >
                      ❌ Cancelar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <h3>Agregar excepción puntual</h3>
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
              placeholder="Motivo (opcional)"
              value={form.motivo}
              onChange={handleChange}
            />
            <button type="submit">Agregar</button>
          </form>
        </>
      )}
    </div>
  );
}

export default ExcepcionesPage;
