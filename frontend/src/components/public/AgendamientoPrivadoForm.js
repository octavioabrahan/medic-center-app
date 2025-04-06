import { useEffect, useState } from "react";
import api from "../../api";

function AgendamientoPrivadoForm() {
  const [form, setForm] = useState({
    cedula: "",
    sin_cedula: false,
    numero_hijo: "",
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    sexo: "",
    telefono: "",
    email: "",
    seguro_medico: false,
    profesional_id: "",
    observaciones: ""
  });
  const [profesionales, setProfesionales] = useState([]);

  useEffect(() => {
    async function fetchProfesionales() {
      try {
        const response = await api.get("/profesionales");
        const medicos = response.data.filter(p => p.nombre_rol === "Medico");
        setProfesionales(medicos);
      } catch (err) {
        console.error("Error cargando profesionales:", err);
      }
    }
    fetchProfesionales();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/agendamiento", form);
      alert("Agendamiento registrado exitosamente");
    } catch (err) {
      console.error("Error al registrar agendamiento:", err);
      alert("Error al registrar agendamiento");
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
          name="sin_cedula"
          checked={form.sin_cedula}
          onChange={handleChange}
        />
        La persona que se atenderá no tiene cédula
      </label>

      {form.sin_cedula && (
        <>
          <label>
            ¿Qué número de hijo(a) es este menor?
            <input
              name="numero_hijo"
              value={form.numero_hijo}
              onChange={handleChange}
            />
          </label>

          <h3>Datos Paciente</h3>
        </>
      )}

      <label>
        Nombre:
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
        />
      </label>

      <label>
        Apellido:
        <input
          name="apellido"
          value={form.apellido}
          onChange={handleChange}
        />
      </label>

      <label>
        Fecha nacimiento:
        <input
          type="date"
          name="fecha_nacimiento"
          value={form.fecha_nacimiento}
          onChange={handleChange}
        />
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
        <input
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
        />
      </label>

      <label>
        Correo electrónico:
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
        />
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
          {profesionales.map((p) => (
            <option key={p.profesional_id} value={p.profesional_id}>
              {p.nombre} {p.apellido}
            </option>
          ))}
        </select>
      </label>

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
