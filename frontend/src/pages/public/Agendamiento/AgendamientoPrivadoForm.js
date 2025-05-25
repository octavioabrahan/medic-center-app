import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarioFechasDisponiblesDayPicker from '../../../components/CalendarioDayPicker/CalendarioFechasDisponiblesDayPicker';
import './AgendamientoPrivadoForm.css';
import './AgendamientoCheckboxOverrides.css';
import Header from '../../../components/SiteFrame/Header';
import Footer from '../../../components/SiteFrame/Footer';
import Banner from '../../../components/Banner/Banner';
import AgendamientoCheckbox from './AgendamientoCheckbox';
import { BriefcaseIcon, UserIcon, CalendarIcon, ClockIcon, ClipboardIcon } from '@heroicons/react/24/solid';

const AgendamientoPrivadoForm = () => {
  const [step, setStep] = useState(1);
  const [sinCedula, setSinCedula] = useState(false);

  const [datosRepresentante, setDatosRepresentante] = useState({
    cedula: '', nombre: '', apellido: '', numeroHijo: '', telefono: '', email: '', sexo: ''
  });

  const [datosPaciente, setDatosPaciente] = useState({
    nombre: '', apellido: '', fechaNacimiento: '', sexo: '', telefono: '', email: ''
  });

  const [tieneSeguro, setTieneSeguro] = useState('');
  const [modoSeleccion] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [profesionalServicioMap, setProfesionalServicioMap] = useState({});

  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  
  // Nuevos estados implementados
  const [categorias, setCategorias] = useState([]);
  const [tiposAtencion, setTiposAtencion] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar categorías y tipos de atención al inicio
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
    if (step === 2) {
      const loadProfesionalesConHorarios = async () => {
        try {
          // Cargar servicios y profesional-servicios primero
          const [serviciosRes, profesionalesRes, profesionalServiciosRes] = await Promise.all([
            axios.get('/api/servicios'),
            axios.get('/api/profesionales'),
            axios.get('/api/profesional-servicios')
          ]);

          setServicios(serviciosRes.data);

          // Crear mapa de profesionales a servicios y viceversa
          const profToServ = {};
          const servToProf = {};
          
          profesionalServiciosRes.data.forEach(relacion => {
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

          // Filtrar profesionales que tengan al menos un horario
          const profesionalesConHorarios = [];
          
          for (const profesional of profesionalesRes.data) {
            try {
              const horariosRes = await axios.get(`/api/horarios/profesional/${profesional.profesional_id}`);
              // Si el profesional tiene al menos un horario, lo incluimos
              if (horariosRes.data && horariosRes.data.length > 0) {
                profesionalesConHorarios.push(profesional);
              }
            } catch (error) {
              // Si hay error al consultar los horarios de un profesional específico, lo omitimos
              console.warn(`Error al verificar horarios del profesional ${profesional.profesional_id}:`, error);
            }
          }

          setProfesionales(profesionalesConHorarios);

        } catch (error) {
          console.error('Error al cargar datos:', error);
        }
      };

      loadProfesionalesConHorarios();
    }
  }, [step]);

  // Funciones para obtener IDs por nombre
  const getCategoriaId = (slug) => {
    const categoria = categorias.find(cat => 
      cat.nombre_categoria.toLowerCase() === slug.toLowerCase()
    );
    return categoria ? categoria.id_categoria : null;
  };

  // Función para obtener el ID de tipo de atención por su nombre
  const getTipoAtencionId = (slug) => {
    const tipoAtencion = tiposAtencion.find(tipo => 
      tipo.nombre.toLowerCase() === slug.toLowerCase()
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
  // eslint-disable-next-line no-unused-vars
  const profesionalesFiltrados = serviciosSeleccionados
    ? profesionalesPorCategoria.filter(p => {
        // Si tenemos un ID de servicio y un mapa de servicio a profesionales
        const servicioObj = servicios.find(s => s.nombre_servicio === serviciosSeleccionados);
        if (servicioObj && profesionalServicioMap.servToProf) {
          const idServicio = servicioObj.id_servicio;
          return profesionalServicioMap.servToProf[idServicio]?.includes(p.profesional_id);
        }
        return true;
      })
    : profesionalesPorCategoria;

  // Filtrar servicios por profesional seleccionado (si hay uno)
  // eslint-disable-next-line no-unused-vars
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
  // eslint-disable-next-line no-unused-vars
  const handleServicioChange = (e) => {
    setServiciosSeleccionados(e.target.value);
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
  // eslint-disable-next-line no-unused-vars
  const handleProfesionalChange = (e) => {
    setProfesionalSeleccionado(e.target.value);
    // Si el servicio actual no puede ser realizado por este profesional, reseteamos la selección
    const servicioObj = servicios.find(s => s.nombre_servicio === serviciosSeleccionados);
    if (servicioObj && e.target.value) {
      const idServicio = servicioObj.id_servicio;
      const puedeRealizarlo = profesionalServicioMap.profToServ[e.target.value]?.includes(idServicio);
      if (!puedeRealizarlo) {
        setServiciosSeleccionados('');
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
    
    if (serviciosSeleccionados.length === 0) {
      alert("Debes seleccionar al menos un servicio");
      return;
    }
    
    const representanteCedula = sinCedula ? `${datosRepresentante.cedula}-${datosRepresentante.numeroHijo}` : null;
    
    // Obtener IDs de forma simplificada
    const categoriaId = getCategoriaId('Consulta');
    const tipoAtencionId = getTipoAtencionId('Presencial');
    
    if (!categoriaId) {
      alert(`No se encontró la categoría correspondiente.`);
      return;
    }
    
    if (!tipoAtencionId) {
      alert(`No se encontró el tipo de atención correspondiente.`);
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
      profesional_id: profesionalSeleccionado,
      fecha_agendada: fechaSeleccionada?.fecha || fechaSeleccionada,
      tipo_atencion_id: tipoAtencionId,
      observaciones: serviciosSeleccionados.join(", "), // Unimos todos los servicios con comas
      id_categoria: categoriaId,
      nro_consulta: fechaSeleccionada?.nro_consulta || null
    };
  
    try {
      await axios.post('/api/agendamiento', payload);
      alert('Agendamiento creado con éxito');
      setStep(4);
    } catch (error) {
      console.error('Error al crear agendamiento:', error.response?.data || error.message);
      alert(`Error al crear agendamiento: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="Agendamiento-form-wrapper">
      <Header />
      <div className="Agendamiento-form-body">
      {step === 1 && (
  <form className="Agendamiento-form-contenido" onSubmit={e => { e.preventDefault(); setStep(2); }}>
    <h2 className="Agendamiento-titulo-principal">Completa los datos del paciente que asistirá a la cita</h2>

    <label>Cédula</label>
    <input
      required
      type="text"
      value={datosRepresentante.cedula}
      onChange={e => setDatosRepresentante({ ...datosRepresentante, cedula: e.target.value })}
    />

    <div className="Agendamiento-checkbox-linea">
      <AgendamientoCheckbox
        checked={sinCedula}
        onChange={() => handleCheckCedula()}
        label="La persona que se atenderá no tiene cédula."
      />
    </div>

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

    <label style={{ marginBottom: '4px' }}>Sexo</label>
    <div className="Agendamiento-radio-group">
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

    {/* Seguro médico */}
    <h3>Seguro médico</h3>
    <p>¿La persona que se va a atender tiene seguro médico?</p>
    <div className="Agendamiento-radio-group">
      <label>
        <input
          type="radio"
          name="seguro"
          value="si"
          checked={tieneSeguro === 'si'}
          onChange={() => setTieneSeguro('si')}
          required
        /> Sí, tiene seguro
      </label>
      <label>
        <input
          type="radio"
          name="seguro"
          value="no"
          checked={tieneSeguro === 'no'}
          onChange={() => setTieneSeguro('no')}
          required
        /> No, no tiene seguro
      </label>
    </div>

    <div className="Agendamiento-boton-container">
      <button 
        type="submit" 
        className="Agendamiento-boton-continuar"
        disabled={isLoading}
      >
        {isLoading ? 'Cargando datos...' : 'Continuar'}
      </button>
    </div>
  </form>
)}
{step === 2 && (
  <div className="Agendamiento-form-step2 nuevo-estilo">
    <button onClick={() => setStep(1)} className="Agendamiento-volver-btn">
      Volver al paso anterior
    </button>

    <h2 className="Agendamiento-titulo-principal">Elige la especialidad y/o el profesional para tu cita</h2>
    <p className="Agendamiento-subtitulo-principal">Indica qué tipo de atención necesitas y/o con quién deseas agendar tu cita.</p>

    {isLoading ? (
      <div className="Agendamiento-loading-message">
        <p>Cargando datos, por favor espere...</p>
      </div>
    ) : (
      <>
        <div className="Agendamiento-seleccion-principal">
          <div className="Agendamiento-seleccion-row">
            <div className="Agendamiento-seleccion-column">
              <label className="Agendamiento-etiqueta-seleccion">¿Qué especialidad necesitas?</label>
              <select
                value={especialidadSeleccionada}
                onChange={e => setEspecialidadSeleccionada(e.target.value)}
                className="Agendamiento-selector-principal"
              >
                <option value="">Selecciona una especialidad</option>
                {[...new Set(profesionales.map(p => p.nombre_especialidad))]
                  .filter(Boolean)
                  .map((item, i) => (
                    <option key={i} value={item}>{item}</option>
                  ))}
              </select>
            </div>

            <div className="Agendamiento-seleccion-column">
              <label className="Agendamiento-etiqueta-seleccion">¿Con qué profesional quieres atenderte?</label>
              <select
                value={profesionalSeleccionado}
                onChange={e => {
                  const id = e.target.value;
                  setProfesionalSeleccionado(id);
                  
                  // Actualizar especialidad basado en el profesional seleccionado
                  const profesional = profesionales.find(p => p.profesional_id === id);
                  if (profesional?.nombre_especialidad) {
                    setEspecialidadSeleccionada(profesional.nombre_especialidad);
                  }
                }}
                className="Agendamiento-selector-principal"
              >
                <option value="">Selecciona al profesional</option>
                {profesionales
                  .filter(p => !especialidadSeleccionada || p.nombre_especialidad === especialidadSeleccionada)
                  .map(p => (
                    <option key={p.profesional_id} value={p.profesional_id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
        
        {profesionalSeleccionado && (
          <>
            <Banner 
              title="Recomendación para tu primera cita"
              text="Si es tu primera cita con este profesional, te sugerimos agendar también los servicios que se recomiendan, así aseguramos que recibas una atención completa sin necesidad de nuevas citas."
              variant="warning"
            />

            <div className="Agendamiento-servicios-section">
              <h3 className="Agendamiento-servicios-title">Selecciona los servicios para tu cita</h3>
              <div className="Agendamiento-servicios-checkbox-list">
                {servicios
                  .filter(s => {
                    if (!profesionalSeleccionado) return false;
                    const profServicios = profesionalServicioMap.profToServ?.[profesionalSeleccionado] || [];
                    return profServicios.includes(s.id_servicio);
                  })
                  .map(s => (
                    <div key={s.id_servicio} className="Agendamiento-servicio-checkbox-item">
                      <AgendamientoCheckbox
                        label={`${s.nombre_servicio} — USD ${Number(s.price_usd).toFixed(2)}`}
                        checked={serviciosSeleccionados.includes(s.nombre_servicio)}
                        onChange={(checked) => {
                          if (checked) {
                            setServiciosSeleccionados([...serviciosSeleccionados, s.nombre_servicio]);
                          } else {
                            setServiciosSeleccionados(
                              serviciosSeleccionados.filter(servicio => servicio !== s.nombre_servicio)
                            );
                          }
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>

            <div className="Agendamiento-fecha-section">
              <h3 className="Agendamiento-fecha-title">Selecciona el día de atención</h3>
              <div className="Agendamiento-fecha-calendario-container">
                <div className="Agendamiento-calendario-wrapper">
                  <CalendarioFechasDisponiblesDayPicker
                    profesionalId={profesionalSeleccionado}
                    fechaSeleccionada={fechaSeleccionada}
                    setFechaSeleccionada={setFechaSeleccionada}
                  />
                </div>
                
                <div className="Agendamiento-fecha-seleccionada-info">
                  <div className="Agendamiento-info-fecha">
                    <CalendarIcon className="Agendamiento-icon" />
                    <p>{fechaSeleccionada ? fechaMostrada() : 'Selecciona una fecha'}</p>
                  </div>
                  <div className="Agendamiento-info-hora">
                    <ClockIcon className="Agendamiento-icon" />
                    <p>{fechaSeleccionada ? horaMostrada() : 'Hora no disponible'}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="Agendamiento-boton-container">
          <button
            onClick={() => setStep(3)}
            className="Agendamiento-boton-continuar"
            disabled={
              isLoading || 
              !fechaSeleccionada ||
              !profesionalSeleccionado ||
              serviciosSeleccionados.length === 0
            }
          >
            Continuar
          </button>
        </div>
      </>
    )}
  </div>
)}
        {/* Paso 3 */}
        {step === 3 && (
  <div className="Agendamiento-form-step3-confirmacion">
    <button onClick={() => setStep(2)} className="Agendamiento-volver-btn">
      Volver al paso anterior
    </button>

    <h2 className="Agendamiento-form-title">Revisa y confirma tu solicitud</h2>
    <p className="Agendamiento-form-subtitle">Antes de enviar tu solicitud, revisa que toda la información esté correcta. Si necesitas corregir algo, puedes volver al paso anterior.</p>

    <Banner
      title="Información importante"
      text="Recuerda que el día de la cita el paciente debe presentar su cédula de identidad vigente. Sin ella, no podrá ser atendido."
      variant="warning"
    />

    <div className="Agendamiento-bloque-info">
      <h3>Información de su cita</h3>
      <div className="Agendamiento-tarjeta-info">
  <p className="Agendamiento-info-item">
    <BriefcaseIcon className="Agendamiento-icon" /> <strong>{especialidadSeleccionada}</strong>
  </p>
  <p className="Agendamiento-info-item">
    <UserIcon className="Agendamiento-icon" /> <strong>{profesionales.find(p => p.profesional_id === profesionalSeleccionado)?.nombre} {profesionales.find(p => p.profesional_id === profesionalSeleccionado)?.apellido}</strong>
  </p>
  <p className="Agendamiento-info-item">
    <ClipboardIcon className="Agendamiento-icon" /> <strong>Servicios:</strong> {serviciosSeleccionados.join(", ")}
  </p>
  <p className="Agendamiento-info-item">
    <CalendarIcon className="Agendamiento-icon" /> <strong>{fechaMostrada()}</strong>
  </p>
  <p className="Agendamiento-info-item">
    <ClockIcon className="Agendamiento-icon" /> <strong>{horaMostrada()}</strong>
  </p>
  <p className="Agendamiento-nota-horario">La atención será por orden de llegada según el horario del profesional.</p>
</div>
    </div>

    <div className="Agendamiento-bloque-info">
      <h3>Información personal</h3>
      <div className="Agendamiento-tarjeta-datos">
        {sinCedula && (
          <div className="Agendamiento-columna-datos">
            <h4>Datos del representante legal</h4>
            <p>{datosRepresentante.cedula}-{datosRepresentante.numeroHijo}</p>
            <p>{datosRepresentante.nombre} {datosRepresentante.apellido}</p>
            <p>{datosRepresentante.sexo}</p>
            <p>{datosRepresentante.telefono}</p>
            <p>{datosRepresentante.email}</p>
          </div>
        )}

        <div className="Agendamiento-columna-datos">
          <h4>Datos del paciente</h4>
          <p>{datosPaciente.nombre} {datosPaciente.apellido}</p>
          <p>{new Date(datosPaciente.fechaNacimiento).toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}</p>
          <p>{datosPaciente.sexo === 'femenino' ? 'Femenino' : 'Masculino'}</p>
        </div>
      </div>
    </div>

    <div className="Agendamiento-boton-container">
      <button 
        onClick={enviarAgendamiento} 
        className="Agendamiento-boton-continuar"
        disabled={isLoading}
      >
        {isLoading ? 'Procesando...' : 'Enviar solicitud'}
      </button>
    </div>
  </div>
)}


        {/* Paso 4 */}
        {step === 4 && (
  <div className="Agendamiento-confirmacion-final">
    <h2 className="Agendamiento-form-title">Tu solicitud fue enviada correctamente.</h2>
    <p className="Agendamiento-form-subtitle">Te enviamos por correo la información de tu cita. Gracias por agendar con nosotros.</p>

    <div className="Agendamiento-form-actions final">
      <a href="/" className="Agendamiento-boton-secundario">Volver a la página principal</a>
      <button className="Agendamiento-boton-continuar" onClick={() => window.location.reload()}>
        Agendar otra cita
      </button>
    </div>
  </div>
)}
      </div>
      <Footer />
    </div>
  );
};

export default AgendamientoPrivadoForm;