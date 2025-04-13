import React, { useEffect, useState } from "react";

const AgendamientoEmpresaForm = () => {
  const [empresas, setEmpresas] = useState([]);
  const [form, setForm] = useState({
    id_empresa: "",
    cedula: "",
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    sexo: "",
    email: "",
    telefono: "",
    profesional_id: "",
    fecha_agendada: "",
    hora_inicio: "",
    tipo_atencion_id: "",
    observaciones: ""
  });

  const [profesionales, setProfesionales] = useState([]);
  const [tiposAtencion, setTiposAtencion] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resEmpresas, resProfes, resTipos] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/api/empresas`),
          fetch(`${process.env.REACT_APP_API_URL}/api/profesionales`),
          fetch(`${process.env.REACT_APP_API_URL}/api/tipo-atencion`)
        ]);

        const [empresasData, profData, tipoData] = await Promise.all([
          resEmpresas.json(),
          resProfes.json(),
          resTipos.json()
        ]);

        setEmpresas(empresasData);
        setProfesionales(profData);
        setTiposAtencion(tipoData);
      } catch (err) {
        setError("Error al cargar datos iniciales.");
      }
    };

    cargarDatos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/agendamiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: form.cedula,
          fecha_agendada: form.fecha_agendada,
          hora_inicio: form.hora_inicio,
          profesional_id: form.profesional_id,
          tipo_atencion_id: form.tipo_atencion_id,
          detalle: form.observaciones,
          paciente: {
            nombre: form.nombre,
            apellido: form.apellido,
            fecha_nacimiento: form.fecha_nacimiento,
            sexo: form.sexo,
            email: form.email,
            telefono: form.telefono,
            seguro_medico: false,
            id_empresa: form.id_empresa
          }
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al agendar.");
      }

      setMensaje("Agendamiento registrado correctamente.");
      setForm({
        id_empresa: "",
        cedula: "",
        nombre: "",
        apellido: "",
        fecha_nacimiento: "",
        sexo: "",
        email: "",
        telefono: "",
        profesional_id: "",
        fecha_agendada: "",
        hora_inicio: "",
        tipo_atencion_id: "",
        observaciones: ""
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2>Agendamiento por Convenio</h2>

      <form onSubmit={handleSubmit}>
        {/* Empresa */}
        <div>
          <label>
            Empresa:
            <select
              name="id_empresa"
              value={form.id_empresa}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            >
              <option value="">Seleccionar empresa</option>
              {empresas.map((e) => (
                <option key={e.id_empresa} value={e.id_empresa}>
                  {e.nombre_empresa} ({e.rif})
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Paciente */}
        <h4 style={{ marginTop: "1.5rem" }}>Datos del paciente</h4>
        <input name="cedula" placeholder="Cédula" value={form.cedula} onChange={handleChange} required />
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required />
        <input name="fecha_nacimiento" type="date" placeholder="Fecha de nacimiento" value={form.fecha_nacimiento} onChange={handleChange} required />
        <select name="sexo" value={form.sexo} onChange={handleChange} required>
          <option value="">Sexo</option>
          <option value="m">Masculino</option>
          <option value="f">Femenino</option>
        </select>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />

        {/* Agendamiento */}
        <h4 style={{ marginTop: "1.5rem" }}>Datos del agendamiento</h4>
        <select
          name="profesional_id"
          value={form.profesional_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar profesional</option>
          {profesionales.map((p) => (
            <option key={p.profesional_id} value={p.profesional_id}>
              {p.nombre} {p.apellido}
            </option>
          ))}
        </select>

        <select
          name="tipo_atencion_id"
          value={form.tipo_atencion_id}
          onChange={handleChange}
          required
        >
          <option value="">Tipo de atención</option>
          {tiposAtencion.map((t) => (
            <option key={t.tipo_atencion_id} value={t.tipo_atencion_id}>
              {t.nombre}
            </option>
          ))}
        </select>

        <input
          name="fecha_agendada"
          type="date"
          value={form.fecha_agendada}
          onChange={handleChange}
          required
        />
        <input
          name="hora_inicio"
          type="time"
          value={form.hora_inicio}
          onChange={handleChange}
        />
        <textarea
          name="observaciones"
          placeholder="Observaciones"
          value={form.observaciones}
          onChange={handleChange}
        />

        <button type="submit" style={{ marginTop: "1rem" }}>
          Agendar
        </button>
      </form>

      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AgendamientoEmpresaForm;
