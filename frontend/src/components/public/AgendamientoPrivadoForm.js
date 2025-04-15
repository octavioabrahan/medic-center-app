import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarioFechasDisponibles from './CalendarioFechasDisponibles';

const AgendamientoPrivadoForm = () => {
  const [step, setStep] = useState(1);
  const [sinCedula, setSinCedula] = useState(false);

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
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');
  const [profesionalServicioMap, setProfesionalServicioMap] = useState({});

  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  useEffect(() => {
    if (step === 2) {
      // Cargar servicios y profesionales
      axios.get('/api/servicios').then(res => setServicios(res.data)).catch(console.error);
      axios.get('/api/profesionales').then(res => setProfesionales(res.data)).catch(console.error);
      
      // Cargar el mapeo de profesional-servicio
      axios.get('/api/profesional-servicios')
        .then(res => {
          // Crear mapa de profesionales a servicios y viceversa
          const profToServ = {};
          const servToProf = {};
          
          res.data.forEach(relacion => {
            // Mapeo de profesional a servicios
            if (!profToServ[relacion.profesional_id]) {
              profToServ[relacion.profesional_id] = [];
            }
            profToServ[relacion.profesional_id].push(relacion.id_servicio);
            
            // Mapeo de servicio a profesionales
            if (!servToProf[relacion.id_servicio]) {
              servToProf[relacion.id_servicio] = [];
            }
            servToProf[relacion.id_servicio].push(relacion.profesional_id);
          });
          
          setProfesionalServicioMap({ profToServ, servToProf });
        })
        .catch(console.error);
    }
  }, [step]);

  const handleCheckCedula = () => {
    const nuevaCondicion = !sinCedula;
    setSinCedula(nuevaCondicion);

    if (nuevaCondicion) {
      setDatosPaciente(prev => ({ ...prev, telefono: '', email: '' }));
      setDatosRepresentante(prev => ({
        ...prev,
        nombre: '',
        apellido: '',
        numeroHijo: '',
        telefono: '',
        email: ''
      }));
    } else {
      setDatosRepresentante(prev => ({
        ...prev,
        nombre: '',
        apellido: '',
        numeroHijo: '',
        telefono: '',
        email: ''
      }));
    }
  };

  // Filtrar profesionales por categoría (consulta o estudio)
  const profesionalesPorCategoria = profesionales.filter(p =>
    modoSeleccion === 'consulta'
      ? p.categorias?.includes('Consulta')
      : modoSeleccion === 'estudio'
        ? p.categorias?.includes('Estudio')
        : false
  );

  // Filtrar profesionales por servicio seleccionado (si hay uno)
  const profesionalesFiltrados = servicioSeleccionado
    ? profesionalesPorCategoria.filter(p => {
        // Si tenemos un ID de servicio y un mapa de servicio a profesionales
        const servicioObj = servicios.find(s => s.nombre_servicio === servicioSeleccionado);
        if (servicioObj && profesionalServicioMap.servToProf) {
          const idServicio = servicioObj.id_servicio;
          return profesionalServicioMap.servToProf[idServicio]?.includes(p.profesional_id);
        }
        return true;
      })
    : profesionalesPorCategoria;

  // Filtrar servicios por profesional seleccionado (si hay uno)
  const serviciosFiltrados = profesionalSeleccionado
    ? servicios.filter(s => {
        // Si tenemos un ID de profesional y un mapa de profesional a servicios
        if (profesionalServicioMap.profToServ) {
          return profesionalServicioMap.profToServ[profesionalSeleccionado]?.includes(s.id_servicio);
        }
        return true;
      })
    : servicios;

  // Manejar cambio de servicio
  const handleServicioChange = (e) => {
    setServicioSeleccionado(e.target.value);
    // Si el profesional actual no puede realizar este servicio, reseteamos la selección
    const servicioObj = servicios.find(s => s.nombre_servicio === e.target.value);
    if (servicioObj && profesionalSeleccionado) {
      const idServicio = servicioObj.id_servicio;
      const puedeRealizarlo = profesionalServicioMap.profToServ[profesionalSeleccionado]?.includes(idServicio);
      if (!puedeRealizarlo) {
        setProfesionalSeleccionado('');
      }
    }
  };

  // Manejar cambio de profesional
  const handleProfesionalChange = (e) => {
    setProfesionalSeleccionado(e.target.value);
    // Si el servicio actual no puede ser realizado por este profesional, reseteamos la selección
    const servicioObj = servicios.find(s => s.nombre_servicio === servicioSeleccionado);
    if (servicioObj && e.target.value) {
      const idServicio = servicioObj.id_servicio;
      const puedeRealizarlo = profesionalServicioMap.profToServ[e.target.value]?.includes(idServicio);
      if (!puedeRealizarlo) {
        setServicioSeleccionado('');
      }
    }
  };

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
    const representanteCedula = sinCedula ? `${datosRepresentante.cedula}-${datosRepresentante.numeroHijo}` : null;
    const categoriaMap = {
      consulta: 1,
      estudio: 3
    };
    
    const tipoAtencionMap = {
      consulta: 1,
      estudio: 3
    };    
    const payload = {
      cedula: datosRepresentante.cedula,
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
      id_empresa: empresaSeleccionada,
      profesional_id: profesionalSeleccionado,
      fecha_agendada: fechaSeleccionada?.fecha || fechaSeleccionada,
      tipo_atencion_id: tipoAtencionMap[modoSeleccion],
      observaciones: modoSeleccion === 'consulta' ? especialidadSeleccionada : servicioSeleccionado,
      hora_inicio: fechaSeleccionada?.hora_inicio || null,
      id_categoria: categoriaMap[modoSeleccion],
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
          <h2>Agendamiento Particular</h2>

          <div>
            <label>Cédula:</label>
            <input
              type="text"
              value={datosRepresentante.cedula}
              onChange={e => setDatosRepresentante({ ...datosRepresentante, cedula: e.target.value })}
            />
            <label>
              <input
                type="checkbox"
                checked={sinCedula}
                onChange={handleCheckCedula}
              />
              La persona que se atenderá no tiene cédula
            </label>
          </div>

          {sinCedula && (
            <fieldset>
              <legend>Datos del representante legal</legend>
              <input placeholder="Número de hijo(a)"
                value={datosRepresentante.numeroHijo}
                onChange={e => setDatosRepresentante({ ...datosRepresentante, numeroHijo: e.target.value })} />
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
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
            </select>
            {!sinCedula && (
              <>
                <input placeholder="Teléfono"
                  value={datosPaciente.telefono}
                  onChange={e => setDatosPaciente({ ...datosPaciente, telefono: e.target.value })} />
                <input placeholder="Correo electrónico"
                  value={datosPaciente.email}
                  onChange={e => setDatosPaciente({ ...datosPaciente, email: e.target.value })} />
              </>
            )}
          </fieldset>

          <div>
            <label>
              ¿Tiene seguro médico?
              <input
                type="checkbox"
                checked={tieneSeguro}
                onChange={() => setTieneSeguro(!tieneSeguro)}
              />
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
            <button onClick={() => {
              setModoSeleccion('consulta');
              setServicioSeleccionado('');
              setProfesionalSeleccionado('');
            }} style={{ marginRight: 8 }}>
              Consulta médica
            </button>
            <button onClick={() => {
              setModoSeleccion('estudio');
              setEspecialidadSeleccionada('');
              setProfesionalSeleccionado('');
            }}>
              Estudio
            </button>
          </div>

          {modoSeleccion === 'consulta' && (
            <>
              <label>Especialidad:</label>
              <select value={especialidadSeleccionada}
                onChange={e => setEspecialidadSeleccionada(e.target.value)}
              >
                <option value="">Selecciona una opción</option>
                {[...new Set(profesionalesFiltrados.map(p => p.nombre_especialidad))].filter(Boolean).map((esp, i) => (
                  <option key={i} value={esp}>{esp}</option>
                ))}
              </select>

              <label>Profesional:</label>
              <select value={profesionalSeleccionado}
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
              <label>Servicio:</label>
              <select value={servicioSeleccionado}
                onChange={handleServicioChange}
              >
                <option value="">Selecciona un servicio</option>
                {serviciosFiltrados.map(s => (
                  <option key={s.id_servicio} value={s.nombre_servicio}>
                    {s.nombre_servicio}
                  </option>
                ))}
              </select>

              <label>Profesional:</label>
              <select value={profesionalSeleccionado}
                onChange={handleProfesionalChange}
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
                <div style={{ marginTop: '20px' }}>
                  <strong>Fecha seleccionada:</strong> {fechaMostrada()}<br />
                  <strong>Hora de inicio:</strong> {horaMostrada()}
                </div>
              )}
            </>
          )}

          <button onClick={() => setStep(3)} disabled={!fechaSeleccionada}>
            Continuar
          </button>
        </div>
      )}

      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <button onClick={() => setStep(2)} style={{ marginBottom: '1rem' }}>← Volver al paso anterior</button>
          <h2 style={{ color: '#0a2472' }}>Revisa y confirma tu solicitud</h2>
          <div style={{ background: '#f8f8f8', padding: '1rem', borderRadius: '8px', maxWidth: '600px', margin: 'auto' }}>
            <p><strong>🩺</strong> {modoSeleccion === 'consulta' ? especialidadSeleccionada : servicioSeleccionado}</p>
            <p><strong>👤</strong> {profesionales.find(p => p.profesional_id === profesionalSeleccionado)?.nombre} {profesionales.find(p => p.profesional_id === profesionalSeleccionado)?.apellido}</p>
            <p><strong>📅</strong> {fechaMostrada()}</p>
            <p><strong>🕐</strong> {horaMostrada()}</p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            {sinCedula && (
              <>
                <h4>Representante legal</h4>
                <p>{datosRepresentante.nombre} {datosRepresentante.apellido}</p>
                <p>{datosRepresentante.telefono} | {datosRepresentante.email}</p>
              </>
            )}
            <h4>Paciente</h4>
            <p>{datosPaciente.nombre} {datosPaciente.apellido}</p>
            <p>{datosPaciente.fechaNacimiento} | {datosPaciente.sexo}</p>
          </div>

          <button onClick={enviarAgendamiento} style={{ marginTop: '2rem', background: '#1a3a8a', color: 'white', padding: '10px 20px' }}>
            Enviar solicitud
          </button>
        </div>
      )}

      {step === 4 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Tu solicitud fue enviada correctamente.</h2>
          <p>Te enviamos por correo la información de tu cita.</p>
          <div style={{ marginTop: '2rem' }}>
            <a href="/" style={{ marginRight: '1rem' }}>Volver a la página principal</a>
            <button onClick={() => window.location.reload()} style={{ background: '#1a3a8a', color: 'white', padding: '8px 16px', border: 'none' }}>
              Agendar otra cita
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendamientoPrivadoForm;