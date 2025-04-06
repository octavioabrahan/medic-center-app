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
    profesional_id: "",
    observaciones: "",
  });

  const [profesionales, setProfesionales] = useState([]);
  const [pacienteSinCedula, setPacienteSinCedula] = useState(false);
  const [hijoNumero, setHijoNumero] = useState("");

  useEffect(() => {
    const fetchProfesionales = async () => {
      try {
        const res = await api.get("/profesionales");
        const medicos = res.data.filter(
          (p) => p.id_rol && p.id_rol.nombre_rol === "Medico"
        );
        setProfesionales(medicos);
      } catch (err) {
        console.error("Error cargando profesionales:", err);
      }
    };

    fetchProfesionales();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setForm({ ...form, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...form };

    if (pacienteSinCedula && hijoNumero) {
      payload.cedula = `${form.cedula}-${hijoNumero}`;
    }

    try {
      await api.post("/agendamiento", payload);
      alert("Agendamiento creado con éxito");
    } catch (err) {
      console.error("Error al agendar:", err);
      alert("Hubo un error al registrar el agendamiento");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <h2>Agendamiento Particular</h2>

      <label>
        Cédula:
        <input
          name="cedula"
          onChange={handleChange}
          value={form.cedula}
          disabled={pacienteSinCedula}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={pacienteSinCedula}
          onChange={(e) => setPacienteSinCedula(e.target.checked)}
        />
        La persona que se atenderá no tiene cédula
      </label>

      {pacienteSinCedula && (
        <label>
          ¿Qué número de hijo(a) es este menor?
          <input
            type="number"
            value={hijoNumero}
            onChange={(e) => setHijoNumero(e.target.value)}
            min={1}
          />
        </label>
      )}

      <label>
        Nombre:
        <input name="nombre" onChange={handleChange} value={form.nombre} />
      </label>

      <label>
        Apellido:
        <input name="apellido" onChange={handleChange} value={form.apellido} />
      </label>

      <label>
        Fecha nacimiento:
        <input type="date" name="fecha_nacimiento" onChange={handleChange} value={form.fecha_nacimiento} />
      </label>

      <label>
        Sexo:
        <select name="sexo" onChange={handleChange} value={form.sexo}>
          <option value="">Selecciona</option>
          <option value="femenino">Femenino</option>
          <option value="masculino">Masculino</option>
        </select>
      </label>

      <label>
        Teléfono:
        <input name="telefono" onChange={handleChange} value={form.telefono} />
      </label>

      <label>
        Correo electrónico:
        <input name="email" onChange={handleChange} value={form.email} />
      </label>

      <label>
        ¿Tiene seguro médico?
        <input
          type="checkbox"
          name="seguro_medico"
          onChange={handleChange}
          checked={form.seguro_medico}
        />
      </label>

      <label>
        Profesional:
        <select name="profesional_id" onChange={handleChange} value={form.profesional_id}>
          <option value="">Selecciona un médico</option>
          {profesionales.map((p) => (
            <option key={p.profesional_id} value={p.profesional_id}>
              {p.nombre} {p.apellido}
            </option>
          ))}
        </select>
      </label>

      <label>
        Observaciones:
        <input name="observaciones" onChange={handleChange} value={form.observaciones} />
      </label>

      <button type="submit">Agendar</button>
    </form>
  );
}

export default AgendamientoPrivadoForm;