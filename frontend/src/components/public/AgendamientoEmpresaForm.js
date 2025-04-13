import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarioFechasDisponibles from './CalendarioFechasDisponibles';
import './AgendamientoEmpresaForm.css';
import logo from '../../assets/logo_header.png';

const AgendamientoEmpresaForm = () => {
  const [step, setStep] = useState(1);
  const [sinCedula, setSinCedula] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');

  const [datosRepresentante, setDatosRepresentante] = useState({
    cedula: '', nombre: '', apellido: '', numeroHijo: '', telefono: '', email: ''
  });

  const [datosPaciente, setDatosPaciente] = useState({
    nombre: '', apellido: '', fechaNacimiento: '', sexo: '', telefono: '', email: ''
  });

  const [tieneSeguro, setTieneSeguro] = useState(false);
  const [modoSeleccion, setModoSeleccion] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);

  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  useEffect(() => {
    axios.get('/api/empresas').then(res => {
      setEmpresas(res.data.filter(e => e.activa));
    });
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
    setDatosPaciente(prev => ({ ...prev, telefono: '', email: '' }));
    setDatosRepresentante(prev => ({ ...prev, nombre: '', apellido: '', numeroHijo: '', telefono: '', email: '' }));
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
        seguro_medico: tieneSeguro,
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

        {/* Paso 1 */}
        {step === 1 && (
          <form className="form-step" onSubmit={e => { e.preventDefault(); setStep(2); }}>
            <h2 className="form-title">Completa los datos del paciente que asistirá a la cita</h2>

            <label>Empresa con la que tiene convenio</label>
            <select required value={empresaSeleccionada} onChange={e => setEmpresaSeleccionada(e.target.value)}>
              <option value="">Selecciona una empresa</option>
              {empresas.map(e => (
                <option key={e.id_empresa} value={e.id_empresa}>{e.nombre_empresa}</option>
              ))}
            </select>

            <label>Cédula</label>
            <input
              type="text"
              value={datosRepresentante.cedula}
              onChange={e => setDatosRepresentante({ ...datosRepresentante, cedula: e.target.value })}
            />

            <label className="checkbox-line">
              <input type="checkbox" checked={sinCedula} onChange={handleCheckCedula} />
              La persona que se atenderá no tiene cédula
            </label>

            {sinCedula && (
              <div className="section">
                <h4>Datos del representante legal</h4>
                <input placeholder="Número de hijo(a)" value={datosRepresentante.numeroHijo} onChange={e => setDatosRepresentante({ ...datosRepresentante, numeroHijo: e.target.value })} />
                <input placeholder="Nombre" value={datosRepresentante.nombre} onChange={e => setDatosRepresentante({ ...datosRepresentante, nombre: e.target.value })} />
                <input placeholder="Apellidos" value={datosRepresentante.apellido} onChange={e => setDatosRepresentante({ ...datosRepresentante, apellido: e.target.value })} />
                <input placeholder="Teléfono" value={datosRepresentante.telefono} onChange={e => setDatosRepresentante({ ...datosRepresentante, telefono: e.target.value })} />
                <input placeholder="Correo electrónico" value={datosRepresentante.email} onChange={e => setDatosRepresentante({ ...datosRepresentante, email: e.target.value })} />
              </div>
            )}

            <div className="section">
              <h4>Datos del paciente</h4>
              <input placeholder="Nombre" value={datosPaciente.nombre} onChange={e => setDatosPaciente({ ...datosPaciente, nombre: e.target.value })} />
              <input placeholder="Apellidos" value={datosPaciente.apellido} onChange={e => setDatosPaciente({ ...datosPaciente, apellido: e.target.value })} />
              <input type="date" value={datosPaciente.fechaNacimiento} onChange={e => setDatosPaciente({ ...datosPaciente, fechaNacimiento: e.target.value })} />
              <select value={datosPaciente.sexo} onChange={e => setDatosPaciente({ ...datosPaciente, sexo: e.target.value })}>
                <option value="">Sexo</option>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
              </select>
              {!sinCedula && (
                <>
                  <input placeholder="Teléfono" value={datosPaciente.telefono} onChange={e => setDatosPaciente({ ...datosPaciente, telefono: e.target.value })} />
                  <input placeholder="Correo electrónico" value={datosPaciente.email} onChange={e => setDatosPaciente({ ...datosPaciente, email: e.target.value })} />
                </>
              )}
            </div>

            <label className="checkbox-line">
              <input type="checkbox" checked={tieneSeguro} onChange={() => setTieneSeguro(!tieneSeguro)} />
              ¿Tiene seguro médico?
            </label>

            <div className="form-actions">
              <button type="submit" className="boton-principal">Continuar</button>
            </div>
          </form>
        )}

        {/* Paso 2 */}
        {step === 2 && (
          <div className="form-step">
            <button onClick={() => setStep(1)} className="volver-btn">← Volver al paso anterior</button>
            <h2 className="form-title">Selecciona el tipo de atención y profesional</h2>
            <div className="selector-botones">
              <button onClick={() => setModoSeleccion('consulta')} className={modoSeleccion === 'consulta' ? 'activo' : ''}>Consulta médica</button>
              <button onClick={() => setModoSeleccion('estudio')} className={modoSeleccion === 'estudio' ? 'activo' : ''}>Estudio</button>
            </div>

            {modoSeleccion === 'consulta' && (
              <>
                <label>Especialidad</label>
                <select value={especialidadSeleccionada} onChange={e => setEspecialidadSeleccionada(e.target.value)}>
                  <option value="">Selecciona una opción</option>
                  {[...new Set(profesionalesFiltrados.map(p => p.nombre_especialidad))].filter(Boolean).map((esp, i) => (
                    <option key={i} value={esp}>{esp}</option>
                  ))}
                </select>

                <label>Profesional</label>
                <select value={profesionalSeleccionado} onChange={e => setProfesionalSeleccionado(e.target.value)}>
                  <option value="">Selecciona al profesional</option>
                  {profesionalesFiltrados
                    .filter(p => !especialidadSeleccionada || p.nombre_especialidad === especialidadSeleccionada)
                    .map(p => (
                      <option key={p.profesional_id} value={p.profesional_id}>
                        {p.nombre} {p.apellido}
                      </option>
                    ))}
                </select>
              </>
            )}

            {modoSeleccion === 'estudio' && (
              <>
                <label>Servicio</label>
                <select value={servicioSeleccionado} onChange={e => setServicioSeleccionado(e.target.value)}>
                  <option value="">Selecciona un servicio</option>
                  {servicios.map(s => (
                    <option key={s.id_servicio} value={s.nombre_servicio}>
                      {s.nombre_servicio}
                    </option>
                  ))}
                </select>

                <label>Profesional</label>
                <select value={profesionalSeleccionado} onChange={e => setProfesionalSeleccionado(e.target.value)}>
                  <option value="">Selecciona al profesional</option>
                  {profesionalesFiltrados.map(p => (
                    <option key={p.profesional_id} value={p.profesional_id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
                </select>
              </>
            )}

            {profesionalSeleccionado && (
              <>
                <CalendarioFechasDisponibles
                  profesionalId={profesionalSeleccionado}
                  onFechaSeleccionada={setFechaSeleccionada}
                />
                {fechaSeleccionada && (
                  <div style={{ marginTop: '20px' }}>
                    <strong>Fecha seleccionada:</strong> {fechaMostrada()}<br />
                    <strong>Hora de inicio:</strong> {horaMostrada()}
                  </div>
                )}
              </>
            )}

            <div className="form-actions">
              <button onClick={() => setStep(3)} className="boton-principal" disabled={!fechaSeleccionada}>Continuar</button>
            </div>
          </div>
        )}

        {/* Paso 3 */}
        {step === 3 && (
          <div className="form-step confirmacion">
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

        {/* Paso 4 */}
        {step === 4 && (
          <div className="form-step confirmacion-final">
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
