import { useState } from "react";
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
    convenio: false,
    profesional_id: "", // debes cargar dinámicamente
    tipo_atencion_id: "", // debes cargar dinámicamente
    observaciones: "",
    sin_cedula: false,
    numero_hijo: "",
    nombre_menor: "",
    apellido_menor: "",
    fecha_nacimiento_menor: "",
    sexo_menor: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let cedulaPaciente = form.cedula;

      if (form.sin_cedula && form.numero_hijo) {
        cedulaPaciente = `${form.cedula}-${form.numero_hijo}`;
      }

      const payload = {
        cedula: cedulaPaciente,
        nombre: form.sin_cedula ? form.nombre_menor : form.nombre,
        apellido: form.sin_cedula ? form.apellido_menor : form.apellido,
        fecha_nacimiento: form.sin_cedula
          ? form.fecha_nacimiento_menor
          : form.fecha_nacimiento,
        sexo: form.sin_cedula ? form.sexo_menor : form.sexo,
        telefono: form.telefono,
        email: form.email,
        seguro_medico: form.seguro_medico,
        fecha_agendada: form.fecha_agendada,
        convenio: false,
        profesional_id: form.profesional_id,
        tipo_atencion_id: form.tipo_atencion_id,
        observaciones: form.observaciones,
      };

      await api.post("/agendamiento", payload);
      alert("Agendamiento creado correctamente");
    } catch (error) {
      console.error("Error al agendar:", error);
      alert("Error al crear el agendamiento");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Agendamiento Particular</h2>

      <label>
        Cédula:
        <input name="cedula" value={form.cedula} onChange={handleChange} required />
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
            ¿Qué número de hijo es este menor?
            <input
              name="numero_hijo"
              type="number"
              value={form.numero_hijo}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Nombre del menor:
            <input
              name="nombre_menor"
              value={form.nombre_menor}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Apellido del menor:
            <input
              name="apellido_menor"
              value={form.apellido_menor}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Fecha nacimiento del menor:
            <input
              type="date"
              name="fecha_nacimiento_menor"
              value={form.fecha_nacimiento_menor}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Sexo del menor:
            <select
              name="sexo_menor"
              value={form.sexo_menor}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona</option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
            </select>
          </label>
        </>
      )}

      {!form.sin_cedula && (
        <>
          <label>
            Nombre:
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </label>
          <label>
            Apellido:
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Fecha nacimiento:
            <input
              type="date"
              name="fecha_nacimiento"
              value={form.fecha_nacimiento}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Sexo:
            <select name="sexo" value={form.sexo} onChange={handleChange} required>
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
        Fecha agendada:
        <input
          type="date"
          name="fecha_agendada"
          value={form.fecha_agendada}
          onChange={handleChange}
          required
        />
      </label>

      {/* Temporalmente campos fijos de prueba para IDs */}
      <label>
        Profesional ID:
        <input
          name="profesional_id"
          value={form.profesional_id}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Tipo Atención ID:
        <input
          name="tipo_atencion_id"
          value={form.tipo_atencion_id}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Observaciones:
        <textarea name="observaciones" onChange={handleChange} value={form.observaciones} />
      </label>

      <button type="submit">Agendar</button>
    </form>
  );
}

export default AgendamientoPrivadoForm;
