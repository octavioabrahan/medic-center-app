import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import './CotizadorExamenes.css';
import MailIcon from '../assets/Mail.svg';
import ArrowLeftIcon from '../assets/ArrowLeft.svg';

export default function CotizadorExamenes() {
  const [examenes, setExamenes] = useState([]);
  const [tasaCambio, setTasaCambio] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState([]);
  const [form, setForm] = useState({ 
    nombre: '', 
    apellido: '', 
    cedula: '', 
    telefono: '',
    fecha_nacimiento: '',
    sexo: 'masculino',
    email: ''
  });
  const [acepta, setAcepta] = useState(false);
  const [captchaValido, setCaptchaValido] = useState(false);
  const [modalInfo, setModalInfo] = useState(null);
  const [modoFormulario, setModoFormulario] = useState(false);
  const [cotizacionEnviada, setCotizacionEnviada] = useState(false);
  const [cotizacionId, setCotizacionId] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null); // Estado para mostrar información de depuración

  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    // Cargar catálogo de exámenes disponibles
    console.log('🔍 DEBUG: Iniciando carga de exámenes...');
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log('🔍 DEBUG: URL de la API:', apiUrl);

    fetch(`${apiUrl}/api/exams`)
      .then(res => {
        console.log('🔍 DEBUG: Respuesta de exámenes recibida, status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('🔍 DEBUG: Datos de exámenes recibidos:', data);
        if (Array.isArray(data)) {
          console.log(`🔍 DEBUG: Se cargaron ${data.length} exámenes correctamente`);
          setExamenes(data);
        } else {
          console.error('Error: Los datos de exámenes no son un array', data);
          setExamenes([]);
        }
      })
      .catch(err => {
        console.error('Error al cargar exámenes:', err);
        setError('No pudimos cargar el catálogo de exámenes. Por favor, intenta más tarde.');
      });

    // Obtener tasa de cambio actual
    console.log('🔍 DEBUG: Iniciando carga de tasa de cambio...');
    fetch(`${apiUrl}/api/tasa-cambio`)
      .then(res => {
        console.log('🔍 DEBUG: Respuesta de tasa de cambio recibida, status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('🔍 DEBUG: Datos de tasa de cambio recibidos:', data);
        if (data && data.tasa) {
          console.log('🔍 DEBUG: Tasa de cambio establecida:', data.tasa);
          setTasaCambio(data.tasa);
        } else {
          console.error('Error: No se recibió la tasa de cambio', data);
          setError('No pudimos obtener la tasa de cambio actual. Por favor, intenta más tarde.');
        }
      })
      .catch(err => {
        console.error('Error al cargar tasa de cambio:', err);
        setError('No pudimos obtener la tasa de cambio. Por favor, intenta más tarde.');
      });
  }, []);

  const handleSelect = (examen) => {
    console.log('🔍 DEBUG: Seleccionando examen:', examen);
    setSeleccionados([...seleccionados, examen]);
    setExamenes(examenes.filter(e => e.codigo !== examen.codigo));
  };

  const handleRemove = (codigo) => {
    console.log('🔍 DEBUG: Removiendo examen con código:', codigo);
    const examen = seleccionados.find(e => e.codigo === codigo);
    setExamenes([...examenes, examen]);
    setSeleccionados(seleccionados.filter(e => e.codigo !== codigo));
  };

  const validarFormulario = () => {
    console.log('🔍 DEBUG: Validando formulario con datos:', form);
    
    // Validar cada campo y registrar el resultado
    let validacionNombre = Boolean(form.nombre.trim());
    console.log('🔍 DEBUG: Nombre válido:', validacionNombre);
    if (!validacionNombre) return 'Debes ingresar tu nombre';
    
    let validacionApellido = Boolean(form.apellido.trim());
    console.log('🔍 DEBUG: Apellido válido:', validacionApellido);
    if (!validacionApellido) return 'Debes ingresar tu apellido';
    
    let validacionCedula = Boolean(form.cedula.trim());
    console.log('🔍 DEBUG: Cédula válida:', validacionCedula);
    if (!validacionCedula) return 'Debes ingresar tu cédula';
    
    let validacionTelefono = Boolean(form.telefono.trim());
    console.log('🔍 DEBUG: Teléfono válido:', validacionTelefono);
    if (!validacionTelefono) return 'Debes ingresar tu teléfono';
    
    let validacionFechaNacimiento = Boolean(form.fecha_nacimiento);
    console.log('🔍 DEBUG: Fecha de nacimiento válida:', validacionFechaNacimiento, 'Fecha actual:', form.fecha_nacimiento);
    if (!validacionFechaNacimiento) return 'Debes ingresar tu fecha de nacimiento';
    
    let validacionSexo = Boolean(form.sexo);
    console.log('🔍 DEBUG: Sexo válido:', validacionSexo);
    if (!validacionSexo) return 'Debes seleccionar tu sexo';
    
    let validacionEmail = Boolean(form.email.trim());
    console.log('🔍 DEBUG: Email válido:', validacionEmail);
    if (!validacionEmail) return 'Debes ingresar tu correo electrónico';
    
    let validacionTerminos = acepta;
    console.log('🔍 DEBUG: Términos aceptados:', validacionTerminos);
    if (!validacionTerminos) return 'Debes aceptar los términos';
    
    let validacionCaptcha = captchaValido;
    console.log('🔍 DEBUG: Captcha válido:', validacionCaptcha);
    if (!validacionCaptcha) return 'Debes completar el captcha';
    
    let validacionExamenes = seleccionados.length > 0;
    console.log('🔍 DEBUG: Hay exámenes seleccionados:', validacionExamenes, 'Cantidad:', seleccionados.length);
    if (!validacionExamenes) return 'Debes seleccionar al menos un examen';
    
    let validacionTasaCambio = Boolean(tasaCambio);
    console.log('🔍 DEBUG: Tasa de cambio disponible:', validacionTasaCambio, 'Valor:', tasaCambio);
    if (!validacionTasaCambio) return 'Estamos esperando que se cargue la tasa de cambio';
    
    console.log('🔍 DEBUG: Validación de formulario exitosa');
    return null;
  };

  const handleSubmit = async () => {
    console.log('🔍 DEBUG: Iniciando proceso de envío de formulario');
    const mensajeError = validarFormulario();
    if (mensajeError) {
      console.error('🔍 DEBUG: Error de validación:', mensajeError);
      alert(mensajeError);
      return;
    }

    // Mostrar datos completos que se van a enviar
    setDebugInfo({
      message: 'Estos son los datos que se van a enviar al servidor:',
      data: {
        nombre: form.nombre,
        apellido: form.apellido,
        cedula: form.cedula,
        telefono: form.telefono,
        fecha_nacimiento: form.fecha_nacimiento,
        sexo: form.sexo,
        email: form.email,
        examenes: seleccionados,
        tasaCambio
      }
    });

    setCargando(true);
    setError(null);

    try {
      console.log('🔍 DEBUG: Preparando datos para enviar');
      
      // Asegurarse de que la fecha de nacimiento tenga el formato correcto
      let fechaNacimientoFormateada = form.fecha_nacimiento;
      if (fechaNacimientoFormateada) {
        // Tratar de formatear la fecha al formato YYYY-MM-DD
        const fechaObj = new Date(fechaNacimientoFormateada);
        if (!isNaN(fechaObj.getTime())) {
          fechaNacimientoFormateada = fechaObj.toISOString().split('T')[0];
          console.log('🔍 DEBUG: Fecha de nacimiento formateada:', fechaNacimientoFormateada);
        } else {
          console.error('🔍 DEBUG: No se pudo formatear la fecha de nacimiento, se enviará como está:', fechaNacimientoFormateada);
        }
      }

      // Validar que la tasa de cambio sea un número
      const tasaCambioNumerico = Number(tasaCambio);
      if (isNaN(tasaCambioNumerico)) {
        throw new Error('La tasa de cambio no es un número válido');
      }
      console.log('🔍 DEBUG: Tasa de cambio convertida a número:', tasaCambioNumerico);

      // Preparar los datos de los exámenes con la estructura correcta
      const examenesFormateados = seleccionados.map(examen => {
        // Validar que el precio del examen sea un número
        const precioNumerico = Number(examen.precio);
        if (isNaN(precioNumerico)) {
          console.error('🔍 DEBUG: Precio no válido para examen:', examen);
        }
        
        return {
          codigo: examen.codigo,
          nombre: examen.nombre,
          precio: precioNumerico,
          tiempo_entrega: examen.tiempo_entrega || null
        };
      });
      
      console.log('🔍 DEBUG: Exámenes formateados:', examenesFormateados);

      // Construir objeto final para enviar
      const dataToSend = { 
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        cedula: form.cedula.trim(),
        telefono: form.telefono.trim(),
        fecha_nacimiento: fechaNacimientoFormateada,
        sexo: form.sexo,
        email: form.email.trim(),
        examenes: examenesFormateados,
        tasaCambio: tasaCambioNumerico
      };
      
      console.log('🔍 DEBUG: Datos finales a enviar:', JSON.stringify(dataToSend, null, 2));
      
      // Actualizamos el estado de depuración con los datos finales
      setDebugInfo({
        message: 'Datos finales enviados al servidor:',
        data: dataToSend
      });

      // URL de la API
      const apiUrl = process.env.REACT_APP_API_URL;
      const endpointUrl = `${apiUrl}/api/cotizaciones`;
      console.log('🔍 DEBUG: Enviando datos a:', endpointUrl);

      // Enviar cotización a la API
      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      console.log('🔍 DEBUG: Respuesta recibida, status:', res.status);
      
      const responseText = await res.text();
      console.log('🔍 DEBUG: Respuesta texto completo:', responseText);
      
      let responseData;
      try {
        // Intentamos parsear la respuesta como JSON
        responseData = JSON.parse(responseText);
        console.log('🔍 DEBUG: Respuesta parseada como JSON:', responseData);
      } catch (e) {
        console.error('🔍 DEBUG: No se pudo parsear la respuesta como JSON:', e);
        responseData = { error: 'Error al procesar la respuesta del servidor' };
      }

      if (!res.ok) {
        console.error('🔍 DEBUG: Error en la respuesta:', responseData);
        throw new Error(responseData.error || 'Error al enviar la cotización');
      }
      
      console.log('🔍 DEBUG: Cotización enviada exitosamente:', responseData);
      setCotizacionId(responseData.id);
      setCotizacionEnviada(true);
    } catch (err) {
      console.error('🔍 DEBUG: Error en el proceso:', err);
      setError(err.message || 'Ocurrió un error al enviar la cotización');
      
      // Actualizamos el estado de depuración con el error
      setDebugInfo({
        message: 'Error durante el envío:',
        data: {
          error: err.message,
          stack: err.stack
        }
      });
    } finally {
      setCargando(false);
    }
  };

  // Filtrar exámenes según búsqueda
  const filtrados = examenes.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Pantalla de carga
  if (cargando) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Procesando tu cotización, por favor espera...</p>
      </div>
    );
  }

  // Pantalla de agradecimiento después de enviar cotización
  if (cotizacionEnviada) {
    return (
      <div className="thankyou-screen">
        <div className="logo-header">LOGO AQUÍ</div>
        <h1>¡Gracias por cotizar con nosotros!</h1>
        <p>
          Te enviamos un PDF con el detalle de tu cotización al correo que nos indicaste.<br />
          Si no lo ves en tu bandeja de entrada, revisa la carpeta de spam o promociones.
        </p>
        <div className="cotizacion-id">
          <span>Número de cotización: </span>
          <strong>{cotizacionId}</strong>
        </div>
        <div className="thankyou-buttons">
          <button onClick={() => window.location.href = '/'}>Volver a la página principal</button>
          <button onClick={() => window.location.reload()}>Hacer otra cotización</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`cotizador-wrapper ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="logo-header">LOGO AQUÍ</div>

      {/* Panel de depuración - Solo visible en desarrollo */}
      {debugInfo && (
        <div style={{
          background: '#f0f8ff',
          border: '1px solid #4682b4',
          padding: '10px',
          margin: '10px',
          borderRadius: '5px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <h4>Información de depuración</h4>
          <p>{debugInfo.message}</p>
          <pre style={{ fontSize: '11px' }}>{JSON.stringify(debugInfo.data, null, 2)}</pre>
          <button onClick={() => setDebugInfo(null)}>Cerrar</button>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="cotizador-content">
        <div className="cotizador-left">
          {!modoFormulario ? (
            <>
              <h2 className="cotizador-title">Cotiza tus exámenes de forma rápida</h2>
              <p className="cotizador-subtitle">
                Selecciona los exámenes que necesitas. Cuando estés listo, presiona "Continuar" para completar tus datos y recibir el detalle de tu cotización.
              </p>

              <input
                className="input-busqueda"
                type="text"
                placeholder="Buscar examen por nombre"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />

              <div className="exam-list-scroll">
                {filtrados.length === 0 ? (
                  <p className="no-examenes">No se encontraron exámenes con ese nombre</p>
                ) : (
                  filtrados.map(ex => (
                    <div className="exam-item" key={ex.codigo}>
                      <label>
                        <input
                          type="checkbox"
                          onChange={() => handleSelect(ex)}
                        />
                        {' '}{ex.nombre}
                      </label>
                      <div>
                        <button onClick={() => setModalInfo(ex)}>Indicación</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn-continuar"
                  disabled={seleccionados.length === 0}
                  onClick={() => setModoFormulario(true)}
                >
                  Continuar
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="cotizador-title">Para enviarte tu cotización, necesitamos algunos datos</h2>
              <p className="cotizador-subtitle">
                Usaremos esta información para contactarte y enviarte el detalle de tu cotización.
              </p>

              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input 
                  id="nombre" 
                  className="form-input" 
                  placeholder="¿Cuál es tu nombre?" 
                  value={form.nombre} 
                  onChange={e => {
                    console.log('🔍 DEBUG: Nombre modificado:', e.target.value);
                    setForm({ ...form, nombre: e.target.value });
                  }} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input 
                  id="apellido" 
                  className="form-input" 
                  placeholder="¿Cuál es tu apellido?" 
                  value={form.apellido} 
                  onChange={e => {
                    console.log('🔍 DEBUG: Apellido modificado:', e.target.value);
                    setForm({ ...form, apellido: e.target.value });
                  }} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="cedula">Cédula</label>
                <input 
                  id="cedula" 
                  className="form-input" 
                  placeholder="Tu número de cédula" 
                  value={form.cedula} 
                  onChange={e => {
                    console.log('🔍 DEBUG: Cédula modificada:', e.target.value);
                    setForm({ ...form, cedula: e.target.value });
                  }} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input 
                  id="telefono" 
                  className="form-input" 
                  placeholder="Número donde podamos contactarte" 
                  value={form.telefono} 
                  onChange={e => {
                    console.log('🔍 DEBUG: Teléfono modificado:', e.target.value);
                    setForm({ ...form, telefono: e.target.value });
                  }} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
                <input 
                  id="fecha_nacimiento" 
                  className="form-input" 
                  type="date"
                  value={form.fecha_nacimiento} 
                  onChange={e => {
                    console.log('🔍 DEBUG: Fecha de nacimiento modificada:', e.target.value);
                    setForm({ ...form, fecha_nacimiento: e.target.value });
                  }} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="sexo">Sexo</label>
                <select
                  id="sexo"
                  className="form-input"
                  value={form.sexo}
                  onChange={e => {
                    console.log('🔍 DEBUG: Sexo modificado:', e.target.value);
                    setForm({ ...form, sexo: e.target.value });
                  }}
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input 
                  id="email" 
                  className="form-input" 
                  placeholder="Correo para enviarte la cotización" 
                  value={form.email} 
                  onChange={e => {
                    console.log('🔍 DEBUG: Email modificado:', e.target.value);
                    setForm({ ...form, email: e.target.value });
                  }} 
                />
              </div>

              <div className="checkbox-line">
                <input 
                  type="checkbox" 
                  checked={acepta} 
                  onChange={e => {
                    console.log('🔍 DEBUG: Términos aceptados:', e.target.checked);
                    setAcepta(e.target.checked);
                  }} 
                  id="terminos"
                />
                <label htmlFor="terminos">
                  Autorizo que se me contacte con fines informativos y de marketing del centro médico.
                </label>
              </div>

              <button 
                className="btn-captcha" 
                onClick={() => {
                  console.log('🔍 DEBUG: CAPTCHA validado manualmente');
                  setCaptchaValido(true);
                }}
                disabled={captchaValido}
              >
                {captchaValido ? "CAPTCHA ✓" : "Simular CAPTCHA"}
              </button>

              {/* Botón para mostrar el panel de depuración 
              <button 
                onClick={() => {
                  console.log('🔍 DEBUG: Mostrando información completa');
                  setDebugInfo({
                    message: 'Estado actual del formulario:',
                    data: {
                      form,
                      seleccionados,
                      tasaCambio,
                      acepta,
                      captchaValido
                    }
                  });
                }}
                style={{ marginTop: '10px', background: '#f0f0f0', border: '1px solid #ccc', padding: '5px 10px' }}
              >
                Mostrar depuración
              </button>*/}

              <div className="form-buttons">
                <button className="btn-volver" onClick={() => setModoFormulario(false)}>
                  <img src={ArrowLeftIcon} alt="Volver" />
                  <span>Volver al listado</span>
                </button>

                <button 
                  className="btn-enviar" 
                  onClick={handleSubmit} 
                  disabled={cargando}
                >
                  <img src={MailIcon} alt="Enviar" />
                  <span>Enviar cotización</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="cotizador-right">
          <h4>
            {seleccionados.length === 0 
              ? "Aún no has seleccionado ningún examen" 
              : "Estos son los exámenes que quieres cotizar"}
          </h4>
          
          {seleccionados.length === 0 ? (
            <p className="no-seleccionados">
              Busca en el listado o escribe el nombre del examen que necesitas para comenzar tu cotización.
            </p>
          ) : (
            <>
              <div className="examenes-seleccionados">
                {seleccionados.map(ex => (
                  <div className="selected-exam" key={ex.codigo}>
                    <div>
                      <span className="exam-name">{ex.nombre}</span>
                      <div className="indicacion-btn-wrapper">
                        <button onClick={() => setModalInfo(ex)}>Indicación</button>
                      </div>
                    </div>
                    <button 
                      className="btn-remove" 
                      onClick={() => handleRemove(ex.codigo)}
                      aria-label="Eliminar examen"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              {tasaCambio && (
                <div className="resumen-costos">
                  <div className="costo-item">
                    <span>Total USD:</span>
                    <span className="monto">
                      ${seleccionados.reduce((sum, e) => sum + Number(e.precio), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="costo-item">
                    <span>Total VES:</span>
                    <span className="monto">
                      Bs. {(seleccionados.reduce((sum, e) => sum + Number(e.precio), 0) * tasaCambio).toFixed(2)}
                    </span>
                  </div>
                  <div className="tasa-info">
                    <small>Tasa del día: ${1} = Bs. {tasaCambio.toFixed(2)}</small>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {modalInfo && (
          <div className={`modal-overlay ${isMobile ? 'modal-mobile' : ''}`}>
            <div className="modal-box">
              <h3>{modalInfo.nombre}</h3>
              <p>{modalInfo.informacion || 'Información no disponible.'}</p>
              <button onClick={() => setModalInfo(null)}>Entendido</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}