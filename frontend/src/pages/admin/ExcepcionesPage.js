import { useEffect, useState } from "react";
import api from "../../api";

function ExcepcionesPage() {
  const [profesionales, setProfesionales] = useState([]);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState("");
  const [fechasValidas, setFechasValidas] = useState([]);
  const [excepciones, setExcepciones] = useState([]);
  const [nuevaExcepcion, setNuevaExcepcion] = useState({
    fecha: "",
    hora_inicio: "",
    hora_termino: "",
    estado: "manual",
    motivo: "",
  });

  useEffect(() => {
    async function fetchProfesionales() {
      try {
        const res = await api.get("/profesionales");
        setProfesionales(res.data);
      } catch (err) {
        console.error("Error cargando profesionales:", err);
      }
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

  const cancelarFecha = async (fecha, hora_inicio, hora_termino) => {
    try {
      await api.post("/excepciones", {
        profesional_id: profesionalSeleccionado,
        fecha,
        estado: "cancelado",
        hora_inicio,
        hora_termino,
        motivo: "Cancelación desde UI",
      });
      await cargarExcepciones(profesionalSeleccionado);
    } catch (err) {
      alert("Error al cancelar fecha");
      console.error(err);
    }
  };

  const guardarExcepcionManual = async () => {
    try {
      await api.post("/excepciones", {
        ...nuevaExcepcion,
        profesional_id: profesionalSeleccionado,
      });
      await cargarExcepciones(profesionalSeleccionado);
      setNuevaExcepcion({
        fecha: "",
        hora_inicio: "",
        hora_termino: "",
        estado: "manual",
        motivo: "",
      });
    } catch (err) {
      alert("Error al guardar excepción");
      console.error(err);
    }
  };
  
  const yaCancelada = (fecha, hora_inicio, hora_termino) => {
    return excepciones.some(
      (ex) =>
        ex.fecha.startsWith(fecha) &&
        ex.hora_inicio === hora_inicio &&
        ex.hora_termino === hora_termino &&
        ex.estado === "cancelado"
    );
  };

  return (
    <div>
      <h2>Gestión de Excepciones de Horario</h2>

      <select
        value={profesionalSeleccionado}
        onChange={(e) => setProfesionalSeleccionado(e.target.value)}
      >
        <option value="">Selecciona un profesional</option>
        {profesionales.map((p) => (
          <option key={p.profesional_id} value={p.profesional_id}>
            {p.nombre} {p.apellido}
          </option>
        ))}
      </select>

      <h3>Excepciones actuales</h3>
      <ul>
        {excepciones.map((e, i) => (
          <li key={i}>
            {e.fecha} | {e.hora_inicio} - {e.hora_termino} | {e.estado} | {e.motivo}
          </li>
        ))}
      </ul>

      <h3>Fechas válidas según horario</h3>
      <ul>
        {fechasValidas.map((f, index) => {
          const cancelada = yaCancelada(f.fecha, f.hora_inicio, f.hora_termino);
          return (
            <li key={`${f.fecha}-${f.hora_inicio}`}>
              <span
                style={{
                  textDecoration: cancelada ? "line-through" : "none",
                  color: cancelada ? "gray" : "black",
                }}
              >
                {f.fecha} | {f.hora_inicio} - {f.hora_termino}
              </span>
              <button
                onClick={() =>
                  cancelarFecha(f.fecha, f.hora_inicio, f.hora_termino)
                }
                disabled={cancelada}
                style={{
                  marginLeft: 10,
                  backgroundColor: cancelada ? "#ccc" : "#f88",
                  cursor: cancelada ? "not-allowed" : "pointer",
                }}
              >
                {cancelada ? "Cancelada" : "❌ Cancelar"}
              </button>
            </li>
          );
        })}
      </ul>

      <h3>Registrar nueva excepción</h3>
      <input
        type="date"
        value={nuevaExcepcion.fecha}
        onChange={(e) =>
          setNuevaExcepcion({ ...nuevaExcepcion, fecha: e.target.value })
        }
      />
      <input
        type="time"
        value={nuevaExcepcion.hora_inicio}
        onChange={(e) =>
          setNuevaExcepcion({ ...nuevaExcepcion, hora_inicio: e.target.value })
        }
      />
      <input
        type="time"
        value={nuevaExcepcion.hora_termino}
        onChange={(e) =>
          setNuevaExcepcion({ ...nuevaExcepcion, hora_termino: e.target.value })
        }
      />
      <input
        placeholder="Motivo"
        value={nuevaExcepcion.motivo}
        onChange={(e) =>
          setNuevaExcepcion({ ...nuevaExcepcion, motivo: e.target.value })
        }
      />
      <button onClick={guardarExcepcionManual}>Guardar excepción</button>
    </div>
  );
}

export default ExcepcionesPage;