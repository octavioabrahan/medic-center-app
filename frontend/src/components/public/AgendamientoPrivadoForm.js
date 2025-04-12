import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarioFechasDisponibles from './CalendarioFechasDisponibles';
import { useNavigate } from 'react-router-dom';

const AgendamientoPrivadoForm = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [sinCedula, setSinCedula] = useState(false);

  const [datosRepresentante, setDatosRepresentante] = useState({
    cedula: '', nombre: '', apellido: '', numeroHijo: '', sexo: '', telefono: '', email: ''
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
    if (step === 2) {
      axios.get('/api/servicios').then(res => setServicios(res.data)).catch(console.error);
      axios.get('/api/profesionales').then(res => setProfesionales(res.data)).catch(console.error);
    }
  }, [step]);

  const handleCheckCedula = () => {
    const nuevaCondicion = !sinCedula;
    setSinCedula(nuevaCondicion);
    if (nuevaCondicion) {
      setDatosPaciente(prev => ({ ...prev, telefono: '', email: '' }));
      setDatosRepresentante(prev => ({
        ...prev, nombre: '', apellido: '', numeroHijo: '', sexo: '', telefono: '', email: ''
      }));
    } else {
      setDatosRepresentante(prev => ({
        ...prev, nombre: '', apellido: '', numeroHijo: '', sexo: '', telefono: '', email: ''
      }));
    }
  };

  const profesionalesFiltrados = profesionales.filter(p =>
    modoSeleccion === 'consulta' ? p.categorias?.includes('Consulta') :
    modoSeleccion === 'estudio' ? p.categorias?.includes('Estudio') : false
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

  const enviarAgendamiento = async () => {
    const payload = {
      cedula: datosRepresentante.cedula,
      paciente: datosPaciente,
      representante: sinCedula ? datosRepresentante : null,
      profesional_id: profesionalSeleccionado,
      fecha: fechaSeleccionada.fecha ?? fechaSeleccionada,
      tiene_seguro: tieneSeguro,
      tipo_atencion: modoSeleccion,
      detalle: modoSeleccion === 'consulta' ? especialidadSeleccionada : servicioSeleccionado,
      hora_inicio: fechaSeleccionada.hora_inicio ?? null
    };

    try {
      await axios.post('/api/agendamiento', payload);
      setStep(4);
    } catch (err) {
      alert('Error al registrar solicitud');
    }
  };

  return (
    <div>
      {step === 1 && (
        <form onSubmit={e => { e.preventDefault(); setStep(2); }}>
          <h2>Agendamiento Particular</h2>
          <div>
            <label>Cédula:</label>
            <input type="text" value={datosRepresentante.cedula} onChange={e => setDatosRepresentante({ ...datosRepresentante, cedula: e.target.value })} />
            <label>
              <input type="checkbox" checked={sinCedula} onChange={handleCheckCedula} />
              La persona que se atenderá no tiene cédula
            </label>
          </div>

          {sinCedula && (
            <fieldset>
              <legend>Datos del representante legal</legend>
              <input placeholder="¿Qué número de hijo(a) es este menor?" value={datosRepresentante.numeroHijo} onChange={e => setDatosRepresentante({ ...datosRepresentante, numeroHijo: e.target.value })} />
              <input placeholder="Nombre" value={datosRepresentante.nombre} onChange={e => setDatosRepresentante({ ...datosRepresentante, nombre: e.target.value })} />
              <input placeholder="Apellidos" value={datosRepresentante.apellido} onChange={e => setDatosRepresentante({ ...datosRepresentante, apellido: e.target.value })} />
              <select value={datosRepresentante.sexo} onChange={e => setDatosRepresentante({ ...datosRepresentante, sexo: e.target.value })}>
                <option value="">Sexo</option><option value="F">Femenino</option><option value="M">Masculino</option>
              </select>
              <input placeholder="Teléfono" value={datosRepresentante.telefono} onChange={e => setDatosRepresentante({ ...datosRepresentante, telefono: e.target.value })} />
              <input placeholder="Correo electrónico" value={datosRepresentante.email} onChange={e => setDatosRepresentante({ ...datosRepresentante, email: e.target.value })} />
            </fieldset>
          )}

          <fieldset>
            <legend>Datos del paciente</legend>
            <input placeholder="Nombre" value={datosPaciente.nombre} onChange={e => setDatosPaciente({ ...datosPaciente, nombre: e.target.value })} />
            <input placeholder="Apellidos" value={datosPaciente.apellido} onChange={e => setDatosPaciente({ ...datosPaciente, apellido: e.target.value })} />
            <input type="date" value={datosPaciente.fechaNacimiento} onChange={e => setDatosPaciente({ ...datosPaciente, fechaNacimiento: e.target.value })} />
            <select value={datosPaciente.sexo} onChange={e => setDatosPaciente({ ...datosPaciente, sexo: e.target.value })}>
              <option value="">Sexo</option><option value="F">Femenino</option><option value="M">Masculino</option>
            </select>
            {!sinCedula && (
              <>
                <input placeholder="Teléfono" value={datosPaciente.telefono} onChange={e => setDatosPaciente({ ...datosPaciente, telefono: e.target.value })} />
                <input placeholder="Correo electrónico" value={datosPaciente.email} onChange={e => setDatosPaciente({ ...datosPaciente, email: e.target.value })} />
              </>
            )}
          </fieldset>

          <div>
            <label>
              ¿Tiene seguro médico?
              <input type="checkbox" checked={tieneSeguro} onChange={() => setTieneSeguro(!tieneSeguro)} />
            </label>
          </div>

          <button type="submit">Continuar</button>
        </form>
      )}

      {step === 2 && (
        <div>
          <button onClick={() => setStep(1)}>← Volver al paso anterior</button>
          <h2>Selecciona la especialidad, el médico y el día.</h2>

          <div style={{ marginBottom: '1rem' }}>
            <button onClick={() => setModoSeleccion('consulta')} style={{ marginRight: 8 }}>Consulta médica</button>
            <button onClick={() => setModoSeleccion('estudio')}>Estudio</button>
          </div>

          {modoSeleccion === 'consulta' && (
            <>
              <label>Especialidad:</label>
              <select value={especialidadSeleccionada} onChange={e => setEspecialidadSeleccionada(e.target.value)}>
                <option value="">Selecciona una opción</option>
                {[...new Set(profesionalesFiltrados.map(p => p.nombre_especialidad))].filter(Boolean).map((esp, i) => (
                  <option key={i} value={esp}>{esp}</option>
                ))}
              </select>

              <label>Profesional:</label>
              <select value={profesionalSeleccionado} onChange={e => setProfesionalSeleccionado(e.target.value)}>
                <option value="">Selecciona al profesional</option>
                {profesionalesFiltrados.filter(p => !especialidadSeleccionada || p.nombre_especialidad === especialidadSeleccionada).map(p => (
                  <option key={p.profesional_id} value={p.profesional_id}>{p.nombre} {p.apellido}</option>
                ))}
              </select>
            </>
          )}

          {modoSeleccion === 'estudio' && (
            <>
              <label>Servicio:</label>
              <select value={servicioSeleccionado} onChange={e => setServicioSeleccionado(e.target.value)}>
                <option value="">Selecciona un servicio</option>
                {servicios.map(s => (
                  <option key={s.id_servicio} value={s.nombre_servicio}>{s.nombre_servicio}</option>
                ))}
              </select>

              <label>Profesional:</label>
              <select value={profesionalSeleccionado} onChange={e => setProfesionalSeleccionado(e.target.value)}>
                <option value="">Selecciona al profesional</option>
                {profesionalesFiltrados.map(p => (
                  <option key={p.profesional_id} value={p.profesional_id}>{p.nombre} {p.apellido}</option>
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

          <button onClick={() => setStep(3)} disabled={!fechaSeleccionada}>Continuar</button>
        </div>
      )}

      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <button onClick={() => setStep(2)} style={{ marginBottom: '1rem' }}>← Volver al paso anterior</button>
          <h2 style={{ color: '#0a2472' }}>Revisa y confirma tu solicitud</h2>
          <p>Confirma que todos los datos estén correctos antes de enviar tu solicitud.</p>

          <div style={{ background: '#f8f8f8', padding: '1rem', borderRadius: '8px', maxWidth: '600px', margin: 'auto', marginTop: '1rem', textAlign: 'left' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>🩺 {modoSeleccion === 'consulta' ? especialidadSeleccionada : servicioSeleccionado}</strong><br />
              <strong>👤 {profesionales.find(p => p.profesional_id === profesionalSeleccionado)?.nombre} {profesionales.find(p => p.profesional_id === profesionalSeleccionado)?.apellido}</strong><br />
              <strong>📅 {fechaMostrada()}</strong><br />
              <strong>🕐 {horaMostrada()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {sinCedula && (
                <div>
                  <h4>Representante legal</h4>
                  <p>{datosRepresentante.cedula}</p>
                  <p>{datosRepresentante.nombre} {datosRepresentante.apellido}</p>
                  <p>Hijo(a) #{datosRepresentante.numeroHijo}</p>
                  <p>{datosRepresentante.telefono}</p>
                  <p>{datosRepresentante.email}</p>
                </div>
              )}
              <div>
                <h4>Datos del paciente</h4>
                <p>{datosPaciente.nombre} {datosPaciente.apellido}</p>
                <p>{datosPaciente.fechaNacimiento}</p>
                <p>{datosPaciente.sexo === 'F' ? 'Femenino' : 'Masculino'}</p>
              </div>
            </div>
          </div>

          <button onClick={enviarAgendamiento} style={{ marginTop: '1rem', background: '#0a2472', color: 'white', padding: '0.7rem 1.5rem', border: 'none', borderRadius: '6px' }}>
            Enviar solicitud
          </button>
        </div>
      )}

      {step === 4 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ color: '#0a2472' }}>Tu solicitud fue enviada correctamente.</h2>
          <p>Te enviamos por correo la información de tu cita. Gracias por agendar con nosotros.</p>
          <div style={{ marginTop: '2rem' }}>
            <button onClick={() => navigate('/')} style={{ marginRight: '1rem' }}>Volver a la página principal</button>
            <button onClick={() => window.location.reload()} style={{ background: '#0a2472', color: 'white' }}>Agendar otra cita</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendamientoPrivadoForm;
