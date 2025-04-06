import { useEffect, useState } from "react";
import api from "../../api";

function AgendamientoPrivadoForm() {
  const [form, setForm] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    sexo: "",
    telefono: "",
    email: "",
    seguro_medico: false,
    fecha_agendada: "",
    profesional_id: "",
    tipo_atencion_id: "",
    observaciones: ""
  });

  const [profesionales, setProfesionales] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [tiposAtencion, setTiposAtencion] = useState([]);
  const [sinCedula, setSinCedula] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profRes, tiposRes] = await Promise.all([
          api.get("/profesionales"),
          api.get("/tipo-atencion")
        ]);

        setProfesionales(
          profRes.data.filter((p) => p.rol_nombre?.toLowerCase() === "medico")
        );
        setTiposAtencion(tiposRes.data);

        // Asignar tipo de atención por defecto (privada)
        const privado = tiposRes.data.find((t) => t.nombre.toLowerCase().includes("particular"));
        if (privado) {
          setForm((f) => ({ ...f, tipo_atencion_id: privado.tipo_atencion_id }));
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchFechas() {
      if (form.profesional_id) {
        try {
          const res = await api.get(`/horarios/fechas/${form.profesional_id}`);
          setFechasDisponibles(res.data);
        } catch (err) {
          console.error("Error cargando fechas del profesional:", err);
        }
      }
    }
    fetchFechas();
  }, [form.profesional_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/agendamiento", form);
      alert("Agendamiento creado exitosamente");
    } catch (err) {
      alert("Error al crear agendamiento");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: 600 }}>
      <h2>Agendamiento Particular</h2>

      <label>
        Cédula:
        <input name="cedula" value={form.cedula} onChange={handleChange} />
      </label>

      <label>
        <input type="checkbox" checked={sinCedula} onChange={(e) => setSinCedula(e.target.checked)} /> La persona que se atenderá no tiene cédula
      </label>

      <label>
        Nombre:
        <input name="nombre" value={form.nombre} onChange={handleChange} />
      </label>

      <label>
        Apellido:
        <input name="apellido" value={form.apellido} onChange={handleChange} />
      </label>

      <label>
        Fecha nacimiento:
        <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} />
      </label>

      <label>
        Sexo:
        <select name="sexo" value={form.sexo} onChange={handleChange}>
          <option value="">Selecciona</option>
          <option value="femenino">Femenino</option>
          <option value="masculino">Masculino</option>
        </select>
      </label>

      <label>
        Teléfono:
        <input name="telefono" value={form.telefono} onChange={handleChange} />
      </label>

      <label>
        Correo electrónico:
        <input name="email" value={form.email} onChange={handleChange} />
      </label>

      <label>
        ¿Tiene seguro médico?
        <input type="checkbox" name="seguro_medico" checked={form.seguro_medico} onChange={handleChange} />
      </label>

      <label>
        Profesional:
        <select name="profesional_id" value={form.profesional_id} onChange={handleChange}>
          <option value="">Selecciona un médico</option>
          {profesionales.map((p) => (
            <option key={p.profesional_id} value={p.profesional_id}>
              {p.nombre} {p.apellido}
            </option>
          ))}
        </select>
      </label>

      {fechasDisponibles.length > 0 && (
        <label>
          Fecha agendada:
          <select name="fecha_agendada" value={form.fecha_agendada} onChange={handleChange}>
            <option value="">Selecciona una fecha</option>
            {fechasDisponibles.map((f) => (
              <option key={f.fecha} value={f.fecha}>
                {f.fecha} | {f.hora_inicio} - {f.hora_termino}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        Observaciones:
        <input name="observaciones" value={form.observaciones} onChange={handleChange} />
      </label>

      <button type="submit">Agendar</button>
    </form>
  );
}

export default AgendamientoPrivadoForm;
