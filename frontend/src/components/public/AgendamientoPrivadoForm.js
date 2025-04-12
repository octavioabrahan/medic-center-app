import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarioFechasDisponibles from './CalendarioFechasDisponibles';

const AgendamientoPrivadoForm = () => {
  const [step, setStep] = useState(1);

  const [sinCedula, setSinCedula] = useState(false);
  const [datosRepresentante, setDatosRepresentante] = useState({
    cedula: '', nombre: '', apellido: '', numeroHijo: '', sexo: '', telefono: '', email: ''
  });
  const [datosPaciente, setDatosPaciente] = useState({
    nombre: '', apellido: '', fechaNacimiento: '', sexo: ''
  });
  const [tieneSeguro, setTieneSeguro] = useState(false);

  const [modoSeleccion, setModoSeleccion] = useState(null); // "consulta" o "estudio"
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);

  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null); // { fecha: Date, hora_inicio: '08:30:00' }

  useEffect(() => {
    if (step === 2) {
      axios.get('/api/servicios').then(res => setServicios(res.data)).catch(console.error);
      axios.get('/api/profesionales').then(res => setProfesionales(res.data)).catch(console.error);
    }
  }, [step]);

  const handleSubmitPaso1 = (e) => { e.preventDefault(); setStep(2); };
  const handleSeleccionTipo = (tipo) => {
    setModoSeleccion(tipo);
    setEspecialidadSeleccionada('');
    setServicioSeleccionado('');
    setProfesionalSeleccionado('');
    setFechaSeleccionada(null);
  };
  const volverPaso1 = () => { setStep(1); setModoSeleccion(null); setProfesionalSeleccionado(''); };

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

  return (
    <div>
      {step === 1 && (
        <form onSubmit={handleSubmitPaso1}>
          <h2>Agendamiento Particular</h2>
          <div>
            <label>Cédula:</label>
            <input type="text" disabled={sinCedula} value={datosRepresentante.cedula} onChange={e => setDatosRepresentante({ ...datosRepresentante, cedula: e.target.value })} />
            <label>
              <input type="checkbox" checked={sinCedula} onChange={() => setSinCedula(!sinCedula)} /> La persona que se atenderá no tiene cédula
            </label>
          </div>

          {sinCedula && (
            <fieldset>
              <legend>Datos del representante legal</legend>
              <input placeholder="¿Qué número de hijo(a) es este menor?" value={datosRepresentante.numeroHijo} onChange={e => setDatosRepresentante({ ...datosRepresentante, numeroHijo: e.target.value })} />
              <input placeholder="Nombre" value={datosRepresentante.nombre} onChange={e => setDatosRepresentante({ ...datosRepresentante, nombre: e.target.value })} />
              <input placeholder="Apellidos" value={datosRepresentante.apellido} onChange={e => setDatosRepresentante({ ...datosRepresentante, apellido: e.target.value })} />
              <select value={datosRepresentante.sexo} onChange={e => setDatosRepresentante({ ...datosRepresentante, sexo: e.target.value })}>
                <option value="">Sexo</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
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
              <option value="">Sexo</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </select>
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
          <button onClick={volverPaso1}>← Volver al paso anterior</button>
          <h2>Selecciona la especialidad, el médico y el día.</h2>

          <div style={{ marginBottom: '1rem' }}>
            <button onClick={() => handleSeleccionTipo('consulta')} style={{ marginRight: 8 }}>Consulta médica</button>
            <button onClick={() => handleSeleccionTipo('estudio')}>Estudio</button>
          </div>

          {modoSeleccion === 'consulta' && (
            <div>
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
                {profesionalesFiltrados
                  .filter(p => !especialidadSeleccionada || p.nombre_especialidad === especialidadSeleccionada)
                  .map(p => (
                    <option key={p.profesional_id} value={p.profesional_id}>{p.nombre} {p.apellido}</option>
                  ))}
              </select>
            </div>
          )}

          {modoSeleccion === 'estudio' && (
            <div>
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
            </div>
          )}

          {profesionalSeleccionado && (
            <div>
              <CalendarioFechasDisponibles
                profesionalId={profesionalSeleccionado}
                onFechaSeleccionada={data => setFechaSeleccionada(data)}
              />

              {fechaSeleccionada && (
                <div style={{ marginTop: '20px' }}>
                  <strong>Fecha seleccionada:</strong> {fechaMostrada()}<br />
                  <strong>Hora de inicio:</strong> {horaMostrada()}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgendamientoPrivadoForm;
