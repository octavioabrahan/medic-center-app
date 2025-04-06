import { useState, useEffect } from "react";
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
    profesional_id: "",
    fecha_agendada: "",
    convenio: false,
    observaciones: ""
  });

  const [sinCedula, setSinCedula] = useState(false);
  const [numeroHijo, setNumeroHijo] = useState(1);
  const [medicos, setMedicos] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);

  useEffect(() => {
    async function fetchMedicos() {
      try {
        const res = await api.get("/profesionales");
        const medicosFiltrados = res.data.filter(m => m.rol === "Medico");
        setMedicos(medicosFiltrados);
      } catch (e) {
        console.error("Error cargando médicos:", e);
      }
    }
    fetchMedicos();
  }, []);

  useEffect(() => {
    async function cargarFechas() {
      if (form.profesional_id) {
        try {
          const res = await api.get(`/horarios/fechas/${form.profesional_id}`);
          setFechasDisponibles(res.data);
        } catch (e) {
          console.error("Error al cargar fechas disponibles:", e);
        }
      } else {
        setFechasDisponibles([]);
      }
    }
    cargarFechas();
  }, [form.profesional_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setForm({ ...form, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let datos = { ...form };

    if (sinCedula) {
      const cedulaBase = form.cedula.replace(/[^0-9]/g, "");
      datos.cedula = `${cedulaBase}-${numeroHijo}`;
    }

    try {
      await api.post("/agendamiento", datos);
      alert("Agendamiento realizado correctamente");
    } catch (error) {
      alert("Error al registrar agendamiento");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Agendamiento Particular</h2>
      <label>
        Cédula:
        <input
          name="cedula"
          value={form.cedula}
          onChange={handleChange}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={sinCedula}
          onChange={() => setSinCedula(!sinCedula)}
        /> La persona que se atenderá no tiene cédula
      </label>

      {sinCedula && (
        <label>
          ¿Qué número de hijo es este menor?
          <input
            type="number"
            value={numeroHijo}
            min="1"
            onChange={(e) => setNumeroHijo(e.target.value)}
          />
        </label>
      )}

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
        <input
          type="checkbox"
          name="seguro_medico"
          checked={form.seguro_medico}
          onChange={handleChange}
        />
      </label>
      <label>
        Profesional:
        <select
          name="profesional_id"
          value={form.profesional_id}
          onChange={handleChange}
        >
          <option value="">Selecciona un médico</option>
          {medicos.map((med) => (
            <option key={med.profesional_id} value={med.profesional_id}>
              {med.nombre} {med.apellido}
            </option>
          ))}
        </select>
      </label>

      {fechasDisponibles.length > 0 && (
        <label>
          Fecha disponible:
          <select
            name="fecha_agendada"
            value={form.fecha_agendada}
            onChange={handleChange}
          >
            <option value="">Selecciona una fecha</option>
            {fechasDisponibles.map((fecha, i) => (
              <option key={i} value={fecha.fecha}>
                {fecha.fecha} | {fecha.hora_inicio} - {fecha.hora_termino}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        Observaciones:
        <input
          name="observaciones"
          value={form.observaciones}
          onChange={handleChange}
        />
      </label>

      <button type="submit">Agendar</button>
    </form>
  );
}

export default AgendamientoPrivadoForm;
