import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CalendarioFechasDisponibles from './CalendarioFechasDisponibles';
import './AgendamientoEmpresaForm.css';
import logo from '../../assets/logo_header.png';

const AgendamientoEmpresaForm = () => {
  const navigate = useNavigate();

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

  const [tieneSeguro, setTieneSeguro] = useState(null);
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

      {/* Paso 1 */}
      {step === 1 && (
        <div className="form-body">
          <button type="button" className="volver-btn" onClick={() => navigate('/')}>
            ← Volver a la página principal
          </button>

          <form className="form-container" onSubmit={e => { e.preventDefault(); setStep(2); }}>
            <h2 className="form-title">Completa los datos del paciente que asistirá a la cita</h2>

            <label>Empresa con la que tiene convenio</label>
            <select
              required
              value={empresaSeleccionada}
              onChange={e => setEmpresaSeleccionada(e.target.value)}
            >
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
              required
            />

            <div className="checkbox-row">
              <input
                type="checkbox"
                checked={sinCedula}
                onChange={handleCheckCedula}
                id="sinCedula"
              />
              <label htmlFor="sinCedula">
                La persona que se atenderá no tiene cédula.
              </label>
            </div>

            <fieldset className="section">
              <legend>Datos del paciente</legend>

              <input
                type="text"
                placeholder="Nombre"
                value={datosPaciente.nombre}
                onChange={e => setDatosPaciente({ ...datosPaciente, nombre: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Apellidos"
                value={datosPaciente.apellido}
                onChange={e => setDatosPaciente({ ...datosPaciente, apellido: e.target.value })}
                required
              />
              <input
                type="date"
                value={datosPaciente.fechaNacimiento}
                onChange={e => setDatosPaciente({ ...datosPaciente, fechaNacimiento: e.target.value })}
                required
              />

              <div className="radio-group">
                <span>Sexo</span>
                <label>
                  <input
                    type="radio"
                    value="femenino"
                    checked={datosPaciente.sexo === 'femenino'}
                    onChange={() => setDatosPaciente({ ...datosPaciente, sexo: 'femenino' })}
                    required
                  />
                  Femenino
                </label>
                <label>
                  <input
                    type="radio"
                    value="masculino"
                    checked={datosPaciente.sexo === 'masculino'}
                    onChange={() => setDatosPaciente({ ...datosPaciente, sexo: 'masculino' })}
                    required
                  />
                  Masculino
                </label>
              </div>
            </fieldset>

            <fieldset className="section">
              <legend>Seguro médico</legend>
              <span style={{ display: 'block', marginBottom: '0.5rem' }}>
                ¿La persona que se va a atender tiene seguro médico?
              </span>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="seguro"
                    value="si"
                    checked={tieneSeguro === true}
                    onChange={() => setTieneSeguro(true)}
                    required
                  />
                  Sí, tiene seguro
                </label>
                <label>
                  <input
                    type="radio"
                    name="seguro"
                    value="no"
                    checked={tieneSeguro === false}
                    onChange={() => setTieneSeguro(false)}
                    required
                  />
                  No, no tiene seguro
                </label>
              </div>
            </fieldset>

            <div className="form-actions">
              <button type="submit" className="boton-principal">Continuar</button>
            </div>
          </form>
        </div>
      )}

      {/* Paso 2 */}
      {step === 2 && (
  <div className="form-body">
    <button onClick={() => setStep(1)} className="volver-btn">← Volver al paso anterior</button>

    <form className="form-container" onSubmit={e => { e.preventDefault(); setStep(3); }}>
      <h2 className="form-title">Selecciona el tipo de atención y profesional</h2>

      <div className="selector-botones">
        <button
          type="button"
          onClick={() => setModoSeleccion('consulta')}
          className={modoSeleccion === 'consulta' ? 'activo' : ''}
        >
          Consulta médica
        </button>
        <button
          type="button"
          onClick={() => setModoSeleccion('estudio')}
          className={modoSeleccion === 'estudio' ? 'activo' : ''}
        >
          Estudio
        </button>
      </div>

      {modoSeleccion === 'consulta' && (
        <>
          <label>Especialidad</label>
          <select
            required
            value={especialidadSeleccionada}
            onChange={e => setEspecialidadSeleccionada(e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            {[...new Set(profesionalesFiltrados.map(p => p.nombre_especialidad))].filter(Boolean).map((esp, i) => (
              <option key={i} value={esp}>{esp}</option>
            ))}
          </select>

          <label>Profesional</label>
          <select
            required
            value={profesionalSeleccionado}
            onChange={e => setProfesionalSeleccionado(e.target.value)}
          >
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
          <select
            required
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

          <label>Profesional</label>
          <select
            required
            value={profesionalSeleccionado}
            onChange={e => setProfesionalSeleccionado(e.target.value)}
          >
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
            <div className="form-grupo">
              <p><strong>Fecha seleccionada:</strong> {fechaMostrada()}</p>
              <p><strong>Hora de inicio:</strong> {horaMostrada()}</p>
            </div>
          )}
        </>
      )}

      <div className="form-actions">
        <button type="submit" className="boton-principal" disabled={!fechaSeleccionada}>
          Continuar
        </button>
      </div>
    </form>
  </div>
)}

      {/* Paso 3 */}
      {step === 3 && (
        <div className="form-body confirmacion">
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
        <div className="form-body confirmacion-final">
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
  );
};

export default AgendamientoEmpresaForm;
