import { useState, useEffect } from "react";
import api from "../../api";

function AgendamientoPrivadoForm() {
  const [form, setForm] = useState({
    cedula: "",
    sinCedula: false,
    numeroHijo: "",
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    sexo: "",
    telefono: "",
    email: "",
    seguro_medico: false,
    profesional_id: "",
    observaciones: "",
    paciente_nombre: "",
    paciente_apellido: "",
    paciente_fecha_nacimiento: "",
    paciente_sexo: ""
  });

  const [profesionales, setProfesionales] = useState([]);

  useEffect(() => {
    async function fetchProfesionales() {
      try {
        const res = await api.get("/profesionales");
        setProfesionales(res.data);
      } catch (error) {
        console.error("Error al cargar profesionales", error);
      }
    }
    fetchProfesionales();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      cedula: form.cedula,
      nombre: form.sinCedula ? form.paciente_nombre : form.nombre,
      apellido: form.sinCedula ? form.paciente_apellido : form.apellido,
      fecha_nacimiento: form.sinCedula ? form.paciente_fecha_nacimiento : form.fecha_nacimiento,
      sexo: form.sinCedula ? form.paciente_sexo : form.sexo,
      telefono: form.telefono,
      email: form.email,
      seguro_medico: form.seguro_medico,
      profesional_id: form.profesional_id,
      convenio: false,
      observaciones: form.observaciones,
      numero_hijo: form.sinCedula ? form.numeroHijo : null
    };

    try {
      await api.post("/agendamiento", payload);
      alert("Agendamiento exitoso");
    } catch (error) {
      alert("Error al agendar");
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
          required
        />
      </label>

      <label>
        <input
          type="checkbox"
          name="sinCedula"
          checked={form.sinCedula}
          onChange={handleChange}
        />
        La persona que se atenderá no tiene cédula
      </label>

      {form.sinCedula && (
        <>
          <label>
            ¿Qué número de hijo(a) es este menor?
            <input
              name="numeroHijo"
              value={form.numeroHijo}
              onChange={handleChange}
            />
          </label>

          <h3>Datos Paciente</h3>
          <label>
            Nombre:
            <input
              name="paciente_nombre"
              value={form.paciente_nombre}
              onChange={handleChange}
            />
          </label>

          <label>
            Apellido:
            <input
              name="paciente_apellido"
              value={form.paciente_apellido}
              onChange={handleChange}
            />
          </label>

          <label>
            Fecha nacimiento:
            <input
              type="date"
              name="paciente_fecha_nacimiento"
              value={form.paciente_fecha_nacimiento}
              onChange={handleChange}
            />
          </label>

          <label>
            Sexo:
            <select
              name="paciente_sexo"
              value={form.paciente_sexo}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
            </select>
          </label>
        </>
      )}

      {!form.sinCedula && (
        <>
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
        </>
      )}

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
          {profesionales.map((prof) => (
            <option key={prof.profesional_id} value={prof.profesional_id}>
              {prof.nombre} {prof.apellido}
            </option>
          ))}
        </select>
      </label>

      <label>
        Observaciones:
        <input name="observaciones" value={form.observaciones} onChange={handleChange} />
      </label>

      <button type="submit">Agendar</button>
    </form>
  );
}

export default AgendamientoPrivadoForm;
