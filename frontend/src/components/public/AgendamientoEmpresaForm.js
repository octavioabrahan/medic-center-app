import React, { useEffect, useState } from "react";

const AgendamientoEmpresaForm = () => {
  const [paso, setPaso] = useState(1);
  const [empresas, setEmpresas] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [form, setForm] = useState({
    id_empresa: "",
    parentesco: "titular",
    representante_cedula: "",
    representante_nombre: "",
    representante_apellido: "",
    archivo_orden: null,
    cedula: "",
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    sexo: "",
    telefono: "",
    email: "",
    categoria: "",
    tipo_atencion_id: "",
    profesional_id: "",
    fecha_agendada: "",
    hora_inicio: "",
    observaciones: ""
  });

  const [errores, setErrores] = useState({});
  const [mensajeFinal, setMensajeFinal] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      const [empRes, espRes, profRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/empresas`),
        fetch(`${process.env.REACT_APP_API_URL}/api/tipo-atencion`),
        fetch(`${process.env.REACT_APP_API_URL}/api/profesionales`)
      ]);
      const [empresasData, especialidadesData, profesionalesData] = await Promise.all([
        empRes.json(),
        espRes.json(),
        profRes.json()
      ]);
      setEmpresas(empresasData.filter(e => e.activa));
      setEspecialidades(especialidadesData);
      setProfesionales(profesionalesData);
    };

    cargarDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validarPaso = () => {
    const err = {};

    if (paso === 1) {
      if (!form.id_empresa) err.id_empresa = "Empresa requerida";
      if (!form.nombre) err.nombre = "Nombre requerido";
      if (!form.apellido) err.apellido = "Apellido requerido";
      if (!form.fecha_nacimiento) err.fecha_nacimiento = "Fecha requerida";
      if (!form.sexo) err.sexo = "Sexo requerido";
      if (!form.telefono) err.telefono = "Teléfono requerido";
      if (!form.email) err.email = "Email requerido";
      if (!form.cedula) err.cedula = "Cédula requerida";

      if (form.parentesco !== "titular") {
        if (!form.representante_cedula) err.representante_cedula = "Cédula del trabajador requerida";
        if (!form.representante_nombre) err.representante_nombre = "Nombre del trabajador requerido";
        if (!form.representante_apellido) err.representante_apellido = "Apellido del trabajador requerido";
        if (!form.archivo_orden) err.archivo_orden = "Debes adjuntar la orden médica";
      }
    }

    if (paso === 2 && !form.categoria) {
      err.categoria = "Selecciona una categoría";
    }

    if (paso === 3) {
      if (!form.tipo_atencion_id) err.tipo_atencion_id = "Selecciona una especialidad o estudio";
      if (!form.profesional_id) err.profesional_id = "Selecciona un profesional";
      if (!form.fecha_agendada) err.fecha_agendada = "Selecciona una fecha";
      if (!form.hora_inicio) err.hora_inicio = "Selecciona una hora";
    }

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const siguientePaso = () => {
    if (validarPaso()) setPaso(paso + 1);
  };

  const anteriorPaso = () => {
    setPaso(paso - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      cedula: form.parentesco === "titular" ? form.cedula : `${form.representante_cedula}-1`,
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
        telefono: form.telefono,
        email: form.email,
        representante_cedula: form.parentesco === "titular" ? null : form.representante_cedula,
        representante_nombre: form.parentesco === "titular" ? null : form.representante_nombre,
        representante_apellido: form.parentesco === "titular" ? null : form.representante_apellido,
        id_empresa: form.id_empresa,
        seguro_medico: false
      }
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/agendamiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Error al agendar");
      setMensajeFinal("Tu solicitud fue enviada correctamente.");
      setPaso(5);
    } catch (err) {
      alert("No se pudo registrar el agendamiento.");
    }
  };

  return (
    <div className="form-wrapper" style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
      {paso < 5 && paso > 1 && (
        <button onClick={anteriorPaso} style={{ marginBottom: "1rem" }}>
          ← Volver al paso anterior
        </button>
      )}

      <form onSubmit={handleSubmit}>
        {paso === 1 && (
          <>
            <h3>1. Datos del paciente</h3>

            <label>Empresa</label>
            <select name="id_empresa" value={form.id_empresa} onChange={handleChange}>
              <option value="">Selecciona empresa</option>
              {empresas.map((e) => (
                <option key={e.id_empresa} value={e.id_empresa}>
                  {e.nombre_empresa}
                </option>
              ))}
            </select>
            {errores.id_empresa && <p>{errores.id_empresa}</p>}

            <label>Parentesco</label>
            <select name="parentesco" value={form.parentesco} onChange={handleChange}>
              <option value="titular">Soy el trabajador</option>
              <option value="hijo">Hijo(a)</option>
              <option value="conyuge">Cónyuge</option>
              <option value="otro">Otro</option>
            </select>

            {form.parentesco !== "titular" && (
              <>
                <label>Cédula del trabajador</label>
                <input name="representante_cedula" value={form.representante_cedula} onChange={handleChange} />
                <label>Nombre del trabajador</label>
                <input name="representante_nombre" value={form.representante_nombre} onChange={handleChange} />
                <label>Apellido del trabajador</label>
                <input name="representante_apellido" value={form.representante_apellido} onChange={handleChange} />
                <label>Orden médica</label>
                <input type="file" name="archivo_orden" onChange={handleChange} />
              </>
            )}

            <label>Cédula del paciente</label>
            <input name="cedula" value={form.cedula} onChange={handleChange} />
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} />
            <label>Apellido</label>
            <input name="apellido" value={form.apellido} onChange={handleChange} />
            <label>Fecha nacimiento</label>
            <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} />
            <label>Sexo</label>
            <select name="sexo" value={form.sexo} onChange={handleChange}>
              <option value="">Seleccionar</option>
              <option value="m">Masculino</option>
              <option value="f">Femenino</option>
            </select>
            <label>Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} />
            <label>Email</label>
            <input name="email" value={form.email} onChange={handleChange} />
          </>
        )}

        {paso === 2 && (
          <>
            <h3>2. ¿Qué necesitas?</h3>
            <button type="button" onClick={() => { setForm({ ...form, categoria: "consulta" }); siguientePaso(); }}>
              Consulta médica
            </button>
            <button type="button" onClick={() => { setForm({ ...form, categoria: "estudio" }); siguientePaso(); }}>
              Estudio
            </button>
            {errores.categoria && <p>{errores.categoria}</p>}
          </>
        )}

        {paso === 3 && (
          <>
            <h3>3. Selecciona atención</h3>
            <label>{form.categoria === "consulta" ? "Especialidad" : "Estudio"}</label>
            <select name="tipo_atencion_id" value={form.tipo_atencion_id} onChange={handleChange}>
              <option value="">Selecciona</option>
              {especialidades.map((e) => (
                <option key={e.tipo_atencion_id} value={e.tipo_atencion_id}>
                  {e.nombre}
                </option>
              ))}
            </select>

            <label>Profesional</label>
            <select name="profesional_id" value={form.profesional_id} onChange={handleChange}>
              <option value="">Selecciona</option>
              {profesionales.map((p) => (
                <option key={p.profesional_id} value={p.profesional_id}>
                  {p.nombre} {p.apellido}
                </option>
              ))}
            </select>

            <label>Fecha</label>
            <input type="date" name="fecha_agendada" value={form.fecha_agendada} onChange={handleChange} />
            <label>Hora</label>
            <input type="time" name="hora_inicio" value={form.hora_inicio} onChange={handleChange} />
            <label>Observaciones (opcional)</label>
            <textarea name="observaciones" value={form.observaciones} onChange={handleChange} />
          </>
        )}

        {paso === 4 && (
          <>
            <h3>4. Revisa tu solicitud</h3>
            <ul>
              <li><strong>Paciente:</strong> {form.nombre} {form.apellido}</li>
              <li><strong>Empresa:</strong> {empresas.find(e => e.id_empresa === form.id_empresa)?.nombre_empresa}</li>
              <li><strong>Tipo de atención:</strong> {form.categoria}</li>
              <li><strong>Fecha:</strong> {form.fecha_agendada} a las {form.hora_inicio}</li>
            </ul>
            <p>Si todo está correcto, presiona "Enviar".</p>
          </>
        )}

        {paso < 4 && <button type="button" onClick={siguientePaso}>Continuar</button>}
        {paso === 4 && <button type="submit">Enviar</button>}
      </form>

      {paso === 5 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>{mensajeFinal}</h3>
          <p>Te hemos enviado un correo con los detalles.</p>
        </div>
      )}
    </div>
  );
};

export default AgendamientoEmpresaForm;
