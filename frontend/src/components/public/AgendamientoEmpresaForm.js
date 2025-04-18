import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarioFechasDisponiblesDayPicker from './CalendarioFechasDisponiblesDayPicker';
import './AgendamientoEmpresaForm.css';
import logo from '../../assets/logo_header.png';
import ArchivoAdjuntoForm from './ArchivoAdjuntoForm';

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

  const [tieneSeguro] = useState('');
  const [modoSeleccion, setModoSeleccion] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [profesionalServicioMap, setProfesionalServicioMap] = useState({});
  const [archivoAdjuntoId, setArchivoAdjuntoId] = useState(null);
  console.log("Estado inicial archivoAdjuntoId:", archivoAdjuntoId);
  
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [tiposAtencion, setTiposAtencion] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener categorías
        const categoriasRes = await axios.get('/api/categorias');
        setCategorias(categoriasRes.data);
        
        // Obtener tipos de atención
        const tiposAtencionRes = await axios.get('/api/tipo-atencion');
        setTiposAtencion(tiposAtencionRes.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        alert('Error al cargar datos necesarios. Por favor, recarga la página.');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    fetch('/api/empresas')
      .then(res => res.json())
      .then(data => setEmpresas(data.filter(e => e.activa)));
  }, []);

  useEffect(() => {
    if (step === 2) {
      axios.get('/api/servicios').then(res => setServicios(res.data)).catch(console.error);
      axios.get('/api/profesionales').then(res => setProfesionales(res.data)).catch(console.error);
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

// Función para obtener el ID de categoría por su nombre (slug)
const getCategoriaId = (slug) => {
  const categoria = categorias.find(cat => 
    cat.nombre_categoria.toLowerCase() === slug.toLowerCase()
  );
  return categoria ? categoria.id_categoria : null;
};

// Función para obtener el ID de tipo de atención por su nombre (slug)
const getTipoAtencionId = (slug) => {
  const tipoAtencion = tiposAtencion.find(tipoAtencion => 
    tipoAtencion.nombre.toLowerCase() === slug.toLowerCase()
  );
  return tipoAtencion ? tipoAtencion.tipo_atencion_id : null;
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
    const fecha = fechaSeleccionada?.dateObj;
    if (!fecha || !(fecha instanceof Date)) return '';
    return fecha.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).replace(/,/g, '').replace(/^./, str => str.toUpperCase());
  };

  const horaMostrada = () => {
    if (!fechaSeleccionada || !fechaSeleccionada.hora_inicio || !fechaSeleccionada.hora_termino) return 'No disponible';
    const inicio = fechaSeleccionada.hora_inicio.slice(0, 5);
    const termino = fechaSeleccionada.hora_termino.slice(0, 5);
    return `Desde las ${inicio} hasta las ${termino} hrs`;
  };

  const handleCheckCedula = () => {
    const nuevaCondicion = !sinCedula;
    setSinCedula(nuevaCondicion);
    if (nuevaCondicion) {
      setDatosPaciente(prev => ({ ...prev, telefono: '', email: '' }));
    }
  };

  const enviarAgendamiento = async () => {
    if (isLoading) {
      alert("Aún se están cargando datos necesarios. Por favor espere.");
      return;
    }
    const representanteCedula = sinCedula ? `${datosRepresentante.cedula}-${datosRepresentante.numeroHijo}` : null;
    if (!archivoAdjuntoId) {
      alert("Por favor adjunta la orden médica firmada y sellada antes de continuar.");
      return;
    }
    const categoriaId = getCategoriaId(modoSeleccion === 'consulta' ? 'Consulta' : 'Estudio');
    const tipoAtencionId = getTipoAtencionId(modoSeleccion === 'presencial' ? 'Presencial' : 'Previa Cita');
    if (!categoriaId) {
      alert(`No se encontró la categoría correspondiente a ${modoSeleccion}.`);
      return;
    }
    
    if (!tipoAtencionId) {
      alert(`No se encontró el tipo de atención correspondiente a ${modoSeleccion}.`);
      return;
    }

    const payload = {
      cedula: sinCedula ? `${datosRepresentante.cedula}-${datosRepresentante.numeroHijo}` : datosRepresentante.cedula,
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
      tipo_atencion_id: tipoAtencionId,
      observaciones: modoSeleccion === 'consulta' ? especialidadSeleccionada : servicioSeleccionado,
      id_categoria: categoriaId,
      archivo_adjunto_id: archivoAdjuntoId,
      nro_consulta: fechaSeleccionada?.nro_consulta || null
    };

    try {
      await axios.post('/api/agendamiento', payload);
      alert('Agendamiento creado con éxito');
      setStep(4);
      // Redireccionar o limpiar formulario
    } catch (error) {
      console.error('Error al crear agendamiento:', error.response?.data || error.message);
      alert(`Error al crear agendamiento: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-header">
        <img src={logo} alt="Logo Diagnocentro" className="form-logo" />
      </div>
      <div className="form-body">
      {step === 1 && (
  <form className="form-contenido" onSubmit={e => { e.preventDefault() 
    if (!archivoAdjuntoId) {
      alert("Por favor adjunta la orden médica firmada y sellada antes de continuar.");
      return;}
      setStep(2); }}>
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
        <input
          type="text"
          required
          value={datosRepresentante.nombre}
          onChange={e => setDatosRepresentante({ ...datosRepresentante, nombre: e.target.value })}
        />

        <label>Apellidos</label>
        <input
          type="text"
          required
          value={datosRepresentante.apellido}
          onChange={e => setDatosRepresentante({ ...datosRepresentante, apellido: e.target.value })}
        />

        <label>¿Qué número de hijo(a) es este menor?</label>
        <input
          type="number"
          required
          value={datosRepresentante.numeroHijo}
          onChange={e => setDatosRepresentante({ ...datosRepresentante, numeroHijo: e.target.value })}
        />

        <label>Teléfono</label>
        <input
          type="text"
          required
          value={datosRepresentante.telefono}
          onChange={e => setDatosRepresentante({ ...datosRepresentante, telefono: e.target.value })}
        />

        <label>Correo electrónico</label>
        <input
          type="email"
          required
          value={datosRepresentante.email}
          onChange={e => setDatosRepresentante({ ...datosRepresentante, email: e.target.value })}
        />
      </>
    )}

    {/* Datos del paciente */}
    <h3>Datos del paciente</h3>
    <label>Nombre</label>
    <input
      type="text"
      required
      value={datosPaciente.nombre}
      onChange={e => setDatosPaciente({ ...datosPaciente, nombre: e.target.value })}
    />

    <label>Apellidos</label>
    <input
      type="text"
      required
      value={datosPaciente.apellido}
      onChange={e => setDatosPaciente({ ...datosPaciente, apellido: e.target.value })}
    />

    <label>Fecha de nacimiento</label>
    <input
      type="date"
      required
      value={datosPaciente.fechaNacimiento}
      onChange={e => setDatosPaciente({ ...datosPaciente, fechaNacimiento: e.target.value })}
    />

    <label>Sexo</label>
    <div className="radio-group">
      <label>
        <input
          type="radio"
          name="sexo-paciente"
          required
          value="femenino"
          checked={datosPaciente.sexo === 'femenino'}
          onChange={e => setDatosPaciente({ ...datosPaciente, sexo: e.target.value })}
        /> Femenino
      </label>
      <label>
        <input
          type="radio"
          name="sexo-paciente"
          required
          value="masculino"
          checked={datosPaciente.sexo === 'masculino'}
          onChange={e => setDatosPaciente({ ...datosPaciente, sexo: e.target.value })}
        /> Masculino
      </label>
    </div>

    {!sinCedula && (
  <>
    <label>Teléfono</label>
    <input
      type="text"
      required
      value={datosPaciente.telefono}
      onChange={e => setDatosPaciente({ ...datosPaciente, telefono: e.target.value })}
    />

    <label>Correo electrónico</label>
    <input
      type="email"
      required
      value={datosPaciente.email}
      onChange={e => setDatosPaciente({ ...datosPaciente, email: e.target.value })}
    />
  </>
)}

    {/* Orden médica */}
    <h3>Orden médica</h3>
    <p>Adjunta la orden de atención médica firmada y sellada por la empresa</p>
    <ArchivoAdjuntoForm
        onFileUploaded={(fileId) => {
        console.log("Archivo subido, ID recibido:", fileId);
        setArchivoAdjuntoId(fileId);}}
    requiereArchivo={true}
    />

    <div className="boton-container">
      <button type="submit" className="boton-continuar">Continuar</button>
    </div>
  </form>
)}
{step === 2 && (
  <div className="form-step2 nuevo-estilo">
    <button onClick={() => setStep(1)} className="volver-btn volver-btn-gris">
      ← Volver al paso anterior
    </button>

    <h2 className="titulo-principal">Selecciona la especialidad, el médico y el día.</h2>

    {/* Tipo de atención: Consulta o Estudio */}
    <div className="tarjeta-seleccion">
      <label className="etiqueta-grupo">Selecciona el tipo de atención</label>
      <div className="selector-botones-radio personalizado">
        <label className={`opcion-card ${modoSeleccion === 'consulta' ? 'activa' : ''}`}>
          <input
            type="radio"
            name="categoria"
            value="consulta"
            checked={modoSeleccion === 'consulta'}
            onChange={() => {
              setModoSeleccion('consulta');
              setServicioSeleccionado('');
              setEspecialidadSeleccionada('');
              setProfesionalSeleccionado('');
              setFechaSeleccionada(null);
            }}
          />
          <div><strong>Consulta médica</strong></div>
        </label>
        <label className={`opcion-card ${modoSeleccion === 'estudio' ? 'activa' : ''}`}>
          <input
            type="radio"
            name="categoria"
            value="estudio"
            checked={modoSeleccion === 'estudio'}
            onChange={() => {
              setModoSeleccion('estudio');
              setServicioSeleccionado('');
              setEspecialidadSeleccionada('');
              setProfesionalSeleccionado('');
              setFechaSeleccionada(null);
            }}
          />
          <div><strong>Estudio</strong></div>
        </label>
      </div>
    </div>

    {/* 👇 Mostrar campos solo si se eligió un tipo de atención */}
    {modoSeleccion && (
      <div className="tarjeta-seleccion">
        <div className="form-row triple">
          <div className="form-column">
            <label className="etiqueta-grupo">
              {modoSeleccion === 'consulta' ? 'Especialidad' : 'Servicio'} <span className="asterisk">*</span>
            </label>
            {modoSeleccion === 'consulta' ? (
              <select
                value={especialidadSeleccionada}
                onChange={e => setEspecialidadSeleccionada(e.target.value)}
                required
              >
                <option value="">Selecciona una opción</option>
                {[...new Set(profesionalesFiltrados.map(p => p.nombre_especialidad))]
                  .filter(Boolean)
                  .map((item, i) => (
                    <option key={i} value={item}>{item}</option>
                  ))}
              </select>
            ) : (
              <select
                value={servicioSeleccionado}
                onChange={handleServicioChange}
                required
              >
                <option value="">Selecciona una opción</option>
                {serviciosFiltrados
                  .filter(Boolean)
                  .map((s, i) => (
                    <option key={i} value={s.nombre_servicio}>{s.nombre_servicio}</option>
                  ))}
              </select>
            )}
          </div>

          <div className="form-column">
            <label className="etiqueta-grupo">
              Profesional <span className="asterisk">*</span>
            </label>
            <select
              value={profesionalSeleccionado}
              onChange={e => {
                handleProfesionalChange(e);
                
                // Mantener la lógica adicional específica para esta UI
                const id = e.target.value;
                const profesional = profesionales.find(p => p.profesional_id === id);
                
                if (modoSeleccion === 'consulta' && profesional?.nombre_especialidad) {
                  setEspecialidadSeleccionada(profesional.nombre_especialidad);
                }
                
                if (modoSeleccion === 'estudio' && !servicioSeleccionado && profesional?.servicios && profesional.servicios.length > 0) {
                  setServicioSeleccionado(profesional.servicios[0]);
                }
              }}
              required
            >
              <option value="">Selecciona al profesional</option>
              {modoSeleccion === 'consulta' 
                ? (
                  profesionalesFiltrados
                    .filter(p => !especialidadSeleccionada || p.nombre_especialidad === especialidadSeleccionada)
                    .map(p => (
                      <option key={p.profesional_id} value={p.profesional_id}>
                        {p.nombre} {p.apellido}
                      </option>
                    ))
                )
                : (
                  profesionalesFiltrados
                    .filter(p => {
                      if (!servicioSeleccionado) return true;
                      const servicioObj = servicios.find(s => s.nombre_servicio === servicioSeleccionado);
                      if (servicioObj && profesionalServicioMap.servToProf) {
                        const idServicio = servicioObj.id_servicio;
                        return profesionalServicioMap.servToProf[idServicio]?.includes(p.profesional_id);
                      }
                      return true;
                    })
                    .map(p => (
                      <option key={p.profesional_id} value={p.profesional_id}>
                        {p.nombre} {p.apellido}
                      </option>
                    ))
                )
              }
            </select>
          </div>
        </div>
      </div>
    )}

    {/* Mostrar calendario solo si hay profesional seleccionado */}
    {profesionalSeleccionado && (
      <div className="calendar-section">
        <div className="calendar-wrapper">
          <label className="etiqueta-grupo">
            Selecciona el día de atención <span className="asterisk">*</span>
          </label>
          <CalendarioFechasDisponiblesDayPicker
            profesionalId={profesionalSeleccionado}
            fechaSeleccionada={fechaSeleccionada}
            setFechaSeleccionada={setFechaSeleccionada}
          />
        </div>

        <div className="info-fecha-hora">
          <p><strong>🗓️</strong> {fechaSeleccionada ? fechaMostrada() : '-'}</p>
          <p><strong>🕒</strong> {fechaSeleccionada ? horaMostrada() : 'No disponible'}</p>
          {fechaSeleccionada && fechaSeleccionada.nro_consulta && (
          <p><strong>🔢</strong> Consulta #{fechaSeleccionada.nro_consulta}</p>)}
        </div>
      </div>
    )}

    {/* Botón de continuar */}
    <div className="boton-container">
      <button
        onClick={() => setStep(3)}
        className="boton-continuar"
        disabled={
          !fechaSeleccionada ||
          !profesionalSeleccionado ||
          (modoSeleccion === 'consulta' && !especialidadSeleccionada) ||
          (modoSeleccion === 'estudio' && !servicioSeleccionado)
        }
      >
        Continuar
      </button>
    </div>
  </div>
)}
        {/* Paso 3 */}
        {step === 3 && (
  <div className="form-step3-confirmacion">
    <button onClick={() => setStep(2)} className="volver-btn">
      ← Volver al paso anterior
    </button>

    <h2 className="form-title">Revisa y confirma tu solicitud</h2>
    <p className="form-subtitle">Antes de enviar tu solicitud, revisa que toda la información esté correcta. Si necesitas corregir algo, puedes volver al paso anterior.</p>

    <div className="alerta-info">
      <span>⚠️</span> Recuerda que el día de la consulta el paciente debe presentar su cédula de identidad vigente. Sin ella, no podrá ser atendido.
    </div>

    <div className="bloque-info">
      <h3>Información de su cita</h3>
      <div className="tarjeta-info">
        <p><strong>🩺 {modoSeleccion === 'consulta' ? especialidadSeleccionada : servicioSeleccionado}</strong></p>
        <p><strong>👤 {profesionales.find(p => p.profesional_id === profesionalSeleccionado)?.nombre} {profesionales.find(p => p.profesional_id === profesionalSeleccionado)?.apellido}</strong></p>
        <p><strong>📅 {fechaMostrada()}</strong></p>
        <p><strong>🕐 {horaMostrada()}</strong></p>
        {fechaSeleccionada && fechaSeleccionada.nro_consulta && (
        <p><strong>🔢 Consulta #{fechaSeleccionada.nro_consulta}</strong></p>)}
        <p className="nota-horario">La atención será por orden de llegada según el horario del profesional.</p>
      </div>
    </div>

    <div className="bloque-info">
      <h3>Información personal</h3>
      <div className="tarjeta-datos">
        {sinCedula && (
          <div className="columna-datos">
            <h4>Datos del representante legal</h4>
            <p>{datosRepresentante.cedula}-{datosRepresentante.numeroHijo}</p>
            <p>{datosRepresentante.nombre} {datosRepresentante.apellido}</p>
            <p>{datosRepresentante.sexo}</p>
            <p>{datosRepresentante.telefono}</p>
            <p>{datosRepresentante.email}</p>
          </div>
        )}

        <div className="columna-datos">
          <h4>Datos del paciente</h4>
          <p>{datosPaciente.nombre} {datosPaciente.apellido}</p>
          <p>{new Date(datosPaciente.fechaNacimiento).toLocaleDateString('es-CL')}</p>
          <p>{datosPaciente.sexo}</p>
        </div>
      </div>
    </div>

    <div className="boton-container">
      <button onClick={enviarAgendamiento} className="boton-continuar">Enviar solicitud</button>
    </div>
  </div>
)}


        {/* Paso 4 */}
        {step === 4 && (
  <div className="confirmacion-final">
    <h2 className="form-title">Tu solicitud fue enviada correctamente.</h2>
    <p className="form-subtitle">Te enviamos por correo la información de tu cita. Gracias por agendar con nosotros.</p>

    <div className="form-actions final">
      <a href="/" className="boton-secundario">Volver a la página principal</a>
      <button className="boton-continuar" onClick={() => window.location.reload()}>
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
