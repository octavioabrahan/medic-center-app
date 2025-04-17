import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import '../../pages/CotizadorExamenes.css'; // Mantenemos la referencia al CSS original
import MailIcon from '../../assets/Mail.svg';
import ArrowLeftIcon from '../../assets/ArrowLeft.svg';

export default function CotizadorExamenes() {
  const [examenes, setExamenes] = useState([]);
  const [tasaCambio, setTasaCambio] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState([]);
  const [form, setForm] = useState({ 
    cedula: '', 
    nombre: '', 
    apellido: '',
    fecha_nacimiento: '',
    sexo: 'O',
    telefono: '', 
    email: '' 
  });
  const [acepta, setAcepta] = useState(false);
  const [captchaValido, setCaptchaValido] = useState(false);
  const [modalInfo, setModalInfo] = useState(null);
  const [modoFormulario, setModoFormulario] = useState(false);
  const [cotizacionEnviada, setCotizacionEnviada] = useState(false);
  const [folioGenerado, setFolioGenerado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  const [formErrors, setFormErrors] = useState({
  cedula: false,
  nombre: false,
  apellido: false,
  fecha_nacimiento: false,
  email: false
  });

  useEffect(() => {
    // Cargar exámenes
    fetch(`${process.env.REACT_APP_API_URL}/api/exams`)
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar exámenes');
        return res.json();
      })
      .then(data => setExamenes(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Error cargando exámenes:', err);
        setError('No se pudieron cargar los exámenes. Por favor, intenta de nuevo más tarde.');
      });

    // Cargar tasa de cambio
    fetch(`${process.env.REACT_APP_API_URL}/api/tasa-cambio`)
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar tasa de cambio');
        return res.json();
      })
      .then(data => setTasaCambio(data.tasa))
      .catch(err => {
        console.error('Error cargando tasa de cambio:', err);
        setError('No se pudo cargar la tasa de cambio. Los precios en VES no estarán disponibles.');
      });
  }, []);

  const handleSelect = (examen) => {
    setSeleccionados([...seleccionados, examen]);
    setExamenes(examenes.filter(e => e.codigo !== examen.codigo));
  };

  const handleRemove = (codigo) => {
    const examen = seleccionados.find(e => e.codigo === codigo);
    setExamenes([...examenes, examen]);
    setSeleccionados(seleccionados.filter(e => e.codigo !== codigo));
  };

  const handleSubmit = async () => {
    // Validar campos obligatorios
    const errors = {
      cedula: !form.cedula,
      nombre: !form.nombre,
      apellido: !form.apellido,
      fecha_nacimiento: !form.fecha_nacimiento,
      email: !form.email
    };
    
    const hasErrors = Object.values(errors).some(error => error);
    
    if (hasErrors || !acepta || !captchaValido || seleccionados.length === 0) {
      setFormErrors(errors);
      
      if (seleccionados.length === 0) {
        setError('Por favor, selecciona al menos un examen.');
      } else if (!acepta) {
        setError('Debes aceptar los términos para continuar.');
      } else if (!captchaValido) {
        setError('Por favor, completa el captcha.');
      } else {
        setError('Por favor, completa todos los campos obligatorios.');
      }
      return;
    }
  
    setCargando(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/cotizaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          examenes: seleccionados
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al enviar la cotización');
      }

      const data = await res.json();
      setFolioGenerado(data.folio);
      setCotizacionEnviada(true);
    } catch (err) {
      console.error('Error al enviar cotización:', err);
      setError(err.message || 'Ocurrió un error al enviar la cotización. Por favor, intenta de nuevo más tarde.');
    } finally {
      setCargando(false);
    }
  };

  const filtrados = examenes.filter(e =>
    e.nombre_examen?.toLowerCase().includes(busqueda.toLowerCase()) || 
    e.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Pantalla de éxito después de enviar la cotización
  if (cotizacionEnviada) {
    return (
      <div className="thankyou-screen">
        <div className="logo-header">LOGO AQUÍ</div>
        <h1>¡Gracias por cotizar con nosotros!</h1>
        <p>
          Te enviamos un PDF con el detalle de tu cotización al correo que nos indicaste.<br />
          Tu número de folio es: <strong>{folioGenerado}</strong><br />
          Si no ves el correo en tu bandeja de entrada, revisa la carpeta de spam o promociones.
        </p>
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

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
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
                {filtrados.map(ex => (
                  <div className="exam-item" key={ex.codigo}>
                    <label>
                      <input
                        type="checkbox"
                        onChange={() => handleSelect(ex)}
                      />
                      {' '}{ex.nombre_examen || ex.nombre}
                    </label>
                    <div>
                      <button onClick={() => setModalInfo(ex)}>Indicación</button>
                    </div>
                  </div>
                ))}

                {filtrados.length === 0 && (
                  <div className="no-results">
                    No se encontraron exámenes que coincidan con tu búsqueda
                  </div>
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
  <label htmlFor="cedula">Cédula <span className="required">*</span></label>
  <input 
    id="cedula" 
    className={`form-input ${formErrors.cedula ? 'input-error' : ''}`}
    placeholder="Tu número de cédula" 
    value={form.cedula} 
    onChange={e => {
      setForm({ ...form, cedula: e.target.value });
      if (e.target.value) setFormErrors({...formErrors, cedula: false});
    }} 
  />
  {formErrors.cedula && <div className="error-message-field">Este campo es obligatorio</div>}
</div>

<div className="form-group">
  <label htmlFor="nombre">Nombre <span className="required">*</span></label>
  <input 
    id="nombre" 
    className={`form-input ${formErrors.nombre ? 'input-error' : ''}`}
    placeholder="Tu nombre" 
    value={form.nombre} 
    onChange={e => {
      setForm({ ...form, nombre: e.target.value });
      if (e.target.value) setFormErrors({...formErrors, nombre: false});
    }} 
  />
  {formErrors.nombre && <div className="error-message-field">Este campo es obligatorio</div>}
</div>

<div className="form-group">
  <label htmlFor="apellido">Apellido <span className="required">*</span></label>
  <input 
    id="apellido" 
    className={`form-input ${formErrors.apellido ? 'input-error' : ''}`}
    placeholder="Tu apellido" 
    value={form.apellido} 
    onChange={e => {
      setForm({ ...form, apellido: e.target.value });
      if (e.target.value) setFormErrors({...formErrors, apellido: false});
    }}
  />
  {formErrors.apellido && <div className="error-message-field">Este campo es obligatorio</div>}
</div>

<div className="form-group">
  <label htmlFor="fecha_nacimiento">Fecha de nacimiento <span className="required">*</span></label>
  <input 
    id="fecha_nacimiento" 
    type="date" 
    className={`form-input ${formErrors.fecha_nacimiento ? 'input-error' : ''}`}
    value={form.fecha_nacimiento} 
    onChange={e => {
      setForm({ ...form, fecha_nacimiento: e.target.value });
      if (e.target.value) setFormErrors({...formErrors, fecha_nacimiento: false});
    }}
  />
  {formErrors.fecha_nacimiento && <div className="error-message-field">Este campo es obligatorio</div>}
</div>

<div className="form-group">
  <label>Sexo <span className="required">*</span></label>
  <div className="radio-group">
    <label className="radio-label">
      <input 
        type="radio" 
        name="sexo" 
        value="F" 
        checked={form.sexo === 'F'} 
        onChange={() => setForm({ ...form, sexo: 'F' })}
      />
      Femenino
    </label>
    <label className="radio-label">
      <input 
        type="radio" 
        name="sexo" 
        value="M" 
        checked={form.sexo === 'M'} 
        onChange={() => setForm({ ...form, sexo: 'M' })}
      />
      Masculino
    </label>
  </div>
</div>

<div className="form-group">
  <label htmlFor="telefono">Teléfono</label>
  <input 
    id="telefono" 
    className="form-input"
    placeholder="Número donde podamos contactarte" 
    value={form.telefono} 
    onChange={e => setForm({ ...form, telefono: e.target.value })}
  />
</div>

<div className="form-group">
  <label htmlFor="email">Correo electrónico <span className="required">*</span></label>
  <input 
    id="email" 
    className={`form-input ${formErrors.email ? 'input-error' : ''}`}
    type="email"
    placeholder="Correo para enviarte la cotización" 
    value={form.email} 
    onChange={e => {
      setForm({ ...form, email: e.target.value });
      if (e.target.value) setFormErrors({...formErrors, email: false});
    }}
  />
  {formErrors.email && <div className="error-message-field">Este campo es obligatorio</div>}
</div>

              <div className="checkbox-line">
                <input 
                  id="acepta-terminos"
                  type="checkbox" 
                  checked={acepta} 
                  onChange={e => setAcepta(e.target.checked)} 
                />
                <label htmlFor="acepta-terminos">
                  Autorizo que se me contacte con fines informativos y de marketing del centro médico.
                </label>
              </div>

              <button onClick={() => setCaptchaValido(true)}>Simular CAPTCHA ✔️</button><br /><br />

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
                  {cargando ? (
                    <span>Enviando...</span>
                  ) : (
                    <>
                      <img src={MailIcon} alt="Enviar" />
                      <span>Enviar cotización</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="cotizador-right">
          {seleccionados.length === 0 ? (
            <>
              <h4>Aún no has seleccionado ningún examen</h4>
              <p>Busca en el listado o escribe el nombre del examen que necesitas para comenzar tu cotización.</p>
            </>
          ) : (
            <>
              <h4>Estos son los exámenes que quieres cotizar</h4>
              {seleccionados.map(ex => (
                <div className="selected-exam" key={ex.codigo}>
                  <div>
                    <span className="exam-name">{ex.nombre_examen || ex.nombre}</span>
                    <div className="indicacion-btn-wrapper">
                      <button onClick={() => setModalInfo(ex)}>Indicación</button>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(ex.codigo)}>✕</button>
                </div>
              ))}

              {tasaCambio && (
                <div className="total-section">
                  <div className="total-row">
                    <span>Total USD:</span>
                    <span className="total-amount">
                      ${seleccionados.reduce((sum, e) => sum + parseFloat(e.preciousd || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="total-row">
                    <span>Total VES:</span>
                    <span className="total-amount">
                      Bs. {(seleccionados.reduce((sum, e) => sum + parseFloat(e.preciousd || 0), 0) * tasaCambio).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {modalInfo && (
          <div className={`modal-overlay ${isMobile ? 'modal-mobile' : ''}`}>
            <div className="modal-box">
              <h3>{modalInfo.nombre_examen || modalInfo.nombre}</h3>
              <p>{modalInfo.informacion || 'Información no disponible para este examen.'}</p>
              <button onClick={() => setModalInfo(null)}>Entendido</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}