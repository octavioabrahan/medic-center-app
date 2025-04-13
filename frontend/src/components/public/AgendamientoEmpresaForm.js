import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarioFechasDisponibles from './CalendarioFechasDisponibles';

const AgendamientoEmpresaForm = () => {
  const [step, setStep] = useState(1);

  const [empresas, setEmpresas] = useState([]);
  const [idEmpresa, setIdEmpresa] = useState('');

  const [parentesco, setParentesco] = useState('titular');
  const [archivoOrden, setArchivoOrden] = useState(null); // Reservado para lógica posterior

  const [datosRepresentante, setDatosRepresentante] = useState({
    cedula: '', nombre: '', apellido: '', telefono: '', email: ''
  });
  const [datosPaciente, setDatosPaciente] = useState({
    cedula: '', nombre: '', apellido: '', fechaNacimiento: '', sexo: '', telefono: '', email: ''
  });

  const [modoSeleccion, setModoSeleccion] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);

  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  useEffect(() => {
    axios.get('/api/empresas')
      .then(res => {
        const activas = res.data.filter(e => e.activa);
        setEmpresas(activas);
      }).catch(console.error);
  }, []);

  useEffect(() => {
    if (step === 2) {
      axios.get('/api/servicios').then(res => setServicios(res.data)).catch(console.error);
      axios.get('/api/profesionales').then(res => setProfesionales(res.data)).catch(console.error);
    }
  }, [step]);

  const profesionalesFiltrados = profesionales.filter(p =>
    modoSeleccion === 'consulta'
      ? p.categorias?.includes('Consulta')
      : modoSeleccion === 'estudio'
        ? p.categorias?.includes('Estudio')
        : false
  );

  const enviarAgendamiento = async () => {
    const payload = {
      cedula: datosPaciente.cedula,
      paciente: {
        nombre: datosPaciente.nombre,
        apellido: datosPaciente.apellido,
        fecha_nacimiento: datosPaciente.fechaNacimiento,
        sexo: datosPaciente.sexo,
        telefono: datosPaciente.telefono,
        email: datosPaciente.email,
        representante_cedula: parentesco !== 'titular' ? datosRepresentante.cedula : null,
        representante_nombre: parentesco !== 'titular' ? datosRepresentante.nombre : null,
        representante_apellido: parentesco !== 'titular' ? datosRepresentante.apellido : null,
        id_empresa: idEmpresa,
        seguro_medico: false
      },
      profesional_id: profesionalSeleccionado,
      fecha_agendada: fechaSeleccionada?.fecha || fechaSeleccionada,
      tipo_atencion: modoSeleccion,
      detalle: modoSeleccion === 'consulta' ? especialidadSeleccionada : servicioSeleccionado,
      hora_inicio: fechaSeleccionada?.hora_inicio || null
    };

    try {
      await axios.post('/api/agendamiento', payload);
      setStep(4);
    } catch (err) {
      console.error('Error al crear agendamiento:', err);
      alert('Hubo un error al agendar. Intenta nuevamente.');
    }
  };

  return (
    <div>
      {/* Paso 1 */}
      {step === 1 && (
        <form onSubmit={e => { e.preventDefault(); setStep(2); }}>
          <h2>Agendamiento por Convenio</h2>

          <label>Empresa:</label>
          <select value={idEmpresa} onChange={e => setIdEmpresa(e.target.value)} required>
            <option value="">Seleccionar empresa</option>
            {empresas.map(emp => (
              <option key={emp.id_empresa} value={emp.id_empresa}>{emp.nombre_empresa}</option>
            ))}
          </select>

          <label>Parentesco con el trabajador:</label>
          <select value={parentesco} onChange={e => setParentesco(e.target.value)}>
            <option value="titular">Soy el trabajador</option>
            <option value="hijo">Hijo(a)</option>
            <option value="conyuge">Cónyuge</option>
            <option value="otro">Otro</option>
          </select>

          {parentesco !== 'titular' && (
            <fieldset>
              <legend>Datos del trabajador</legend>
              <input placeholder="Cédula"
                value={datosRepresentante.cedula}
                onChange={e => setDatosRepresentante({ ...datosRepresentante, cedula: e.target.value })} />
              <input placeholder="Nombre"
                value={datosRepresentante.nombre}
                onChange={e => setDatosRepresentante({ ...datosRepresentante, nombre: e.target.value })} />
              <input placeholder="Apellidos"
                value={datosRepresentante.apellido}
                onChange={e => setDatosRepresentante({ ...datosRepresentante, apellido: e.target.value })} />
              <input placeholder="Teléfono"
                value={datosRepresentante.telefono}
                onChange={e => setDatosRepresentante({ ...datosRepresentante, telefono: e.target.value })} />
              <input placeholder="Correo electrónico"
                value={datosRepresentante.email}
                onChange={e => setDatosRepresentante({ ...datosRepresentante, email: e.target.value })} />
            </fieldset>
          )}

          <fieldset>
            <legend>Datos del paciente</legend>
            <input placeholder="Cédula"
              value={datosPaciente.cedula}
              onChange={e => setDatosPaciente({ ...datosPaciente, cedula: e.target.value })} />
            <input placeholder="Nombre"
              value={datosPaciente.nombre}
              onChange={e => setDatosPaciente({ ...datosPaciente, nombre: e.target.value })} />
            <input placeholder="Apellidos"
              value={datosPaciente.apellido}
              onChange={e => setDatosPaciente({ ...datosPaciente, apellido: e.target.value })} />
            <input type="date"
              value={datosPaciente.fechaNacimiento}
              onChange={e => setDatosPaciente({ ...datosPaciente, fechaNacimiento: e.target.value })} />
            <select
              value={datosPaciente.sexo}
              onChange={e => setDatosPaciente({ ...datosPaciente, sexo: e.target.value })}>
              <option value="">Sexo</option>
              <option value="f">Femenino</option>
              <option value="m">Masculino</option>
            </select>
            <input placeholder="Teléfono"
              value={datosPaciente.telefono}
              onChange={e => setDatosPaciente({ ...datosPaciente, telefono: e.target.value })} />
            <input placeholder="Correo electrónico"
              value={datosPaciente.email}
              onChange={e => setDatosPaciente({ ...datosPaciente, email: e.target.value })} />
          </fieldset>

          {/* Aquí irá el botón para adjuntar orden médica */}
          {parentesco !== 'titular' && (
            <div style={{ marginTop: '1rem' }}>
              <label>Orden médica:</label>
              <input type="file" disabled />
              <small>(Pendiente por implementar)</small>
            </div>
          )}

          <button type="submit">Continuar</button>
        </form>
      )}

      {/* Paso 2 */}
      {step === 2 && (
        <div>
          <button onClick={() => setStep(1)}>← Volver al paso anterior</button>
          <h2>Selecciona la especialidad, el médico y el día.</h2>

          <div style={{ marginBottom: '1rem' }}>
            <button onClick={() => setModoSeleccion('consulta')} style={{ marginRight: 8 }}>
              Consulta médica
            </button>
            <button onClick={() => setModoSeleccion('estudio')}>Estudio</button>
          </div>

          {modoSeleccion && (
            <>
              {modoSeleccion === 'consulta' && (
                <>
                  <label>Especialidad:</label>
                  <select value={especialidadSeleccionada}
                    onChange={e => setEspecialidadSeleccionada(e.target.value)}>
                    <option value="">Selecciona una opción</option>
                    {[...new Set(profesionalesFiltrados.map(p => p.nombre_especialidad))].filter(Boolean).map((esp, i) => (
                      <option key={i} value={esp}>{esp}</option>
                    ))}
                  </select>
                </>
              )}

              {modoSeleccion === 'estudio' && (
                <>
                  <label>Servicio:</label>
                  <select value={servicioSeleccionado}
                    onChange={e => setServicioSeleccionado(e.target.value)}>
                    <option value="">Selecciona un servicio</option>
                    {servicios.map(s => (
                      <option key={s.id_servicio} value={s.nombre_servicio}>{s.nombre_servicio}</option>
                    ))}
                  </select>
                </>
              )}

              <label>Profesional:</label>
              <select value={profesionalSeleccionado}
                onChange={e => setProfesionalSeleccionado(e.target.value)}>
                <option value="">Selecciona al profesional</option>
                {profesionalesFiltrados
                  .filter(p =>
                    !especialidadSeleccionada || p.nombre_especialidad === especialidadSeleccionada
                  ).map(p => (
                    <option key={p.profesional_id} value={p.profesional_id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
              </select>

              {profesionalSeleccionado && (
                <CalendarioFechasDisponibles
                  profesionalId={profesionalSeleccionado}
                  onFechaSeleccionada={setFechaSeleccionada}
                />
              )}

              {fechaSeleccionada && (
                <button onClick={enviarAgendamiento} style={{ marginTop: '1rem' }}>
                  Enviar solicitud
                </button>
              )}
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Tu solicitud fue enviada correctamente.</h2>
          <p>Te hemos enviado un correo con los detalles.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
            Agendar otra cita
          </button>
        </div>
      )}
    </div>
  );
};

export default AgendamientoEmpresaForm;
