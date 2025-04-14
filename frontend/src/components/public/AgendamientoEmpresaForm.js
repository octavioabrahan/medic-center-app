import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import CalendarioFechasDisponibles from './CalendarioFechasDisponibles';
import CalendarioFechasDisponiblesDayPicker from './CalendarioFechasDisponiblesDayPicker';
import './AgendamientoEmpresaForm.css';
import logo from '../../assets/logo_header.png';

const AgendamientoEmpresaForm = () => {
  const [step, setStep] = useState(1);
  const [sinCedula, setSinCedula] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');

  const [datosRepresentante, setDatosRepresentante] = useState({
    cedula: '', nombre: '', apellido: '', numeroHijo: '', telefono: '', email: '', sexo: ''
  });

  const [datosPaciente, setDatosPaciente] = useState({
    nombre: '', apellido: '', fechaNacimiento: '', sexo: '', telefono: '', email: ''
  });

  const [tieneSeguro, setTieneSeguro] = useState('');
  const [modoSeleccion, setModoSeleccion] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);

  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  useEffect(() => {
    fetch('/api/empresas')
      .then(res => res.json())
      .then(data => setEmpresas(data.filter(e => e.activa)));
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

  const fechaMostrada = () => {
    const f = fechaSeleccionada?.fecha ?? fechaSeleccionada;
    if (!f || isNaN(new Date(f).getTime())) return '';
    return new Date(f).toLocaleDateString();
  };

  const horaMostrada = () => {
    if (!fechaSeleccionada || !fechaSeleccionada.hora_inicio) return 'No disponible';
    return `Desde las ${fechaSeleccionada.hora_inicio.slice(0, 5)} hrs`;
  };

  const handleCheckCedula = () => {
    const nuevaCondicion = !sinCedula;
    setSinCedula(nuevaCondicion);
    if (nuevaCondicion) {
      setDatosPaciente(prev => ({ ...prev, telefono: '', email: '' }));
    }
  };

  const enviarAgendamiento = async () => {
    const representanteCedula = sinCedula ? `${datosRepresentante.cedula}-${datosRepresentante.numeroHijo}` : null;
    const payload = {
      cedula: datosRepresentante.cedula,
      paciente: {
        nombre: datosPaciente.nombre,
        apellido: datosPaciente.apellido,
        fecha_nacimiento: datosPaciente.fechaNacimiento,
        sexo: datosPaciente.sexo,
        telefono: sinCedula ? datosRepresentante.telefono : datosPaciente.telefono,
        email: sinCedula ? datosRepresentante.email : datosPaciente.email,
        seguro_medico: tieneSeguro === 'si',
        representante_cedula: representanteCedula,
        representante_nombre: sinCedula ? datosRepresentante.nombre : null,
        representante_apellido: sinCedula ? datosRepresentante.apellido : null,
        id_empresa: empresaSeleccionada
      },
      profesional_id: profesionalSeleccionado,
      fecha_agendada: fechaSeleccionada?.fecha || fechaSeleccionada,
      tipo_atencion: modoSeleccion,
      detalle: modoSeleccion === 'consulta' ? especialidadSeleccionada : servicioSeleccionado
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
    <div className="form-wrapper">
      <div className="form-header">
        <img src={logo} alt="Logo Diagnocentro" className="form-logo" />
      </div>
      <div className="form-body">
        {step === 1 && (
          <form className="form-contenido" onSubmit={e => { e.preventDefault(); setStep(2); }}>
            <h2 className="titulo-principal">Completa los datos del paciente que asistirá a la cita</h2>

            <label>Empresa con la que tiene convenio</label>
            <select required value={empresaSeleccionada} onChange={e => setEmpresaSeleccionada(e.target.value)}>
              <option value="">Selecciona una empresa</option>
              {empresas.map(e => (
                <option key={e.id_empresa} value={e.id_empresa}>{e.nombre_empresa}</option>
              ))}
            </select>

            <label>Cédula</label>
            <input
              required
              type="text"
              value={datosRepresentante.cedula}
              onChange={e => setDatosRepresentante({ ...datosRepresentante, cedula: e.target.value })}
            />

            <label className="checkbox-linea">
              <input type="checkbox" checked={sinCedula} onChange={handleCheckCedula} />
              La persona que se atenderá no tiene cédula.
            </label>

            {/* Sección de representante */}
            {sinCedula && (
              <>
                <h3>Datos del representante legal</h3>
                <label>Nombre</label>
                <input type="text" required value={datosRepresentante.nombre} onChange={e => setDatosRepresentante({ ...datosRepresentante, nombre: e.target.value })} />

                <label>Apellidos</label>
                <input type="text" required value={datosRepresentante.apellido} onChange={e => setDatosRepresentante({ ...datosRepresentante, apellido: e.target.value })} />

                <label>¿Qué número de hijo(a) es este menor?</label>
                <input type="number" required value={datosRepresentante.numeroHijo} onChange={e => setDatosRepresentante({ ...datosRepresentante, numeroHijo: e.target.value })} />

                <label>Sexo</label>
                <div className="radio-group">
                  <label><input type="radio" name="sexo-representante" required value="femenino" checked={datosRepresentante.sexo === 'femenino'} onChange={e => setDatosRepresentante({ ...datosRepresentante, sexo: e.target.value })} /> Femenino</label>
                  <label><input type="radio" name="sexo-representante" required value="masculino" checked={datosRepresentante.sexo === 'masculino'} onChange={e => setDatosRepresentante({ ...datosRepresentante, sexo: e.target.value })} /> Masculino</label>
                </div>

                <label>Teléfono</label>
                <input type="text" required value={datosRepresentante.telefono} onChange={e => setDatosRepresentante({ ...datosRepresentante, telefono: e.target.value })} />

                <label>Correo electrónico</label>
                <input type="email" required value={datosRepresentante.email} onChange={e => setDatosRepresentante({ ...datosRepresentante, email: e.target.value })} />
              </>
            )}

            {/* Datos del paciente */}
            <h3>Datos del paciente</h3>
            <label>Nombre</label>
            <input type="text" required value={datosPaciente.nombre} onChange={e => setDatosPaciente({ ...datosPaciente, nombre: e.target.value })} />

            <label>Apellidos</label>
            <input type="text" required value={datosPaciente.apellido} onChange={e => setDatosPaciente({ ...datosPaciente, apellido: e.target.value })} />

            <label>Fecha de nacimiento</label>
            <input type="date" required value={datosPaciente.fechaNacimiento} onChange={e => setDatosPaciente({ ...datosPaciente, fechaNacimiento: e.target.value })} />

            <label>Sexo</label>
            <div className="radio-group">
              <label><input type="radio" name="sexo-paciente" required value="femenino" checked={datosPaciente.sexo === 'femenino'} onChange={e => setDatosPaciente({ ...datosPaciente, sexo: e.target.value })} /> Femenino</label>
              <label><input type="radio" name="sexo-paciente" required value="masculino" checked={datosPaciente.sexo === 'masculino'} onChange={e => setDatosPaciente({ ...datosPaciente, sexo: e.target.value })} /> Masculino</label>
            </div>

            {/* Seguro médico */}
            <h3>Seguro médico</h3>
            <p>¿La persona que se va a atender tiene seguro médico?</p>
            <div className="radio-group">
              <label><input type="radio" name="seguro" value="si" checked={tieneSeguro === 'si'} onChange={() => setTieneSeguro('si')} required /> Sí, tiene seguro</label>
              <label><input type="radio" name="seguro" value="no" checked={tieneSeguro === 'no'} onChange={() => setTieneSeguro('no')} required /> No, no tiene seguro</label>
            </div>

            <div className="boton-container">
              <button type="submit" className="boton-continuar">Continuar</button>
            </div>
          </form>
        )}
{step === 2 && (
  <div className="step-2-container">
    <button onClick={() => setStep(1)} className="volver-btn volver-btn-gris">← Volver al paso anterior</button>
    <h2 className="titulo-principal">Selecciona la especialidad, el médico y el día.</h2>

    <div className="form-grid-vertical">
      <div className="grid-2-cols">
        <div>
          <label className="label-flat">Selecciona el tipo de atención</label>
          <div className="selector-botones-radio">
            <label className={modoSeleccion === 'consulta' ? 'opcion-card activa' : 'opcion-card'}>
              <input
                type="radio"
                name="categoria"
                value="consulta"
                checked={modoSeleccion === 'consulta'}
                onChange={() => setModoSeleccion('consulta')}
              />
              <div><strong>Consulta médica</strong></div>
            </label>
            <label className={modoSeleccion === 'estudio' ? 'opcion-card activa' : 'opcion-card'}>
              <input
                type="radio"
                name="categoria"
                value="estudio"
                checked={modoSeleccion === 'estudio'}
                onChange={() => setModoSeleccion('estudio')}
              />
              <div><strong>Estudio</strong></div>
            </label>
          </div>
        </div>
      </div>

      {(modoSeleccion === 'consulta' || modoSeleccion === 'estudio') && (
        <>
          <div className="grid-2-cols">
            <div>
              <label>{modoSeleccion === 'consulta' ? 'Especialidad' : 'Servicio'}</label>
              {modoSeleccion === 'consulta' ? (
                <select
                  value={especialidadSeleccionada}
                  onChange={e => setEspecialidadSeleccionada(e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  {[...new Set(profesionalesFiltrados.map(p => p.nombre_especialidad))]
                    .filter(Boolean)
                    .map((esp, i) => (
                      <option key={i} value={esp}>{esp}</option>
                    ))}
                </select>
              ) : (
                <select
                  value={servicioSeleccionado}
                  onChange={e => setServicioSeleccionado(e.target.value)}
                >
                  <option value="">Selecciona un servicio</option>
                  {servicios.map(s => (
                    <option key={s.id_servicio} value={s.nombre_servicio}>
                      {s.nombre_servicio}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label>Profesional</label>
              <select
                value={profesionalSeleccionado}
                onChange={e => setProfesionalSeleccionado(e.target.value)}
              >
                <option value="">Selecciona al profesional</option>
                {profesionalesFiltrados
                  .filter(p => modoSeleccion !== 'consulta' || !especialidadSeleccionada || p.nombre_especialidad === especialidadSeleccionada)
                  .map(p => (
                    <option key={p.profesional_id} value={p.profesional_id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {profesionalSeleccionado && (
            <div className="calendario-y-info">
              <div>
                <label>Selecciona el día de atención</label>
                <CalendarioFechasDisponiblesDayPicker
                profesionalId={profesionalSeleccionado}
                fechaSeleccionada={fechaSeleccionada}
                setFechaSeleccionada={setFechaSeleccionada}
              />
              </div>

              <div className="info-fecha-hora">
                <p><strong>📅</strong> {fechaSeleccionada ? fechaMostrada() : '-'}</p>
                <p><strong>🕒</strong> {horaMostrada()}</p>
              </div>
            </div>
          )}
        </>
      )}

      <div className="boton-container">
        <button
          onClick={() => setStep(3)}
          className="boton-continuar"
          disabled={!fechaSeleccionada}
        >
          Continuar
        </button>
      </div>
    </div>
  </div>
)}
        {step === 3 && (
          <div className="confirmacion">
            <button onClick={() => setStep(2)} className="volver-btn">← Volver al paso anterior</button>
            <h2 className="form-title">Revisa y confirma tu solicitud</h2>
            <div className="resumen">
              <p><strong>🩺</strong> {modoSeleccion === 'consulta' ? especialidadSeleccionada : servicioSeleccionado}</p>
              <p><strong>👤</strong> {profesionales.find(p => p.profesional_id === profesionalSeleccionado)?.nombre} {profesionales.find(p => p.profesional_id === profesionalSeleccionado)?.apellido}</p>
              <p><strong>📅</strong> {fechaMostrada()}</p>
              <p><strong>🕐</strong> {horaMostrada()}</p>
            </div>
            <div className="form-actions">
              <button onClick={enviarAgendamiento} className="boton-principal">Enviar solicitud</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="confirmacion-final">
            <h2 className="form-title">Tu solicitud fue enviada correctamente.</h2>
            <p>Te enviamos por correo la información de tu cita.</p>
            <div className="form-actions" style={{ justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              <a href="/" className="boton-principal">Volver al inicio</a>
              <button className="boton-principal" onClick={() => window.location.reload()}>
                Agendar otra cita
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendamientoEmpresaForm;
