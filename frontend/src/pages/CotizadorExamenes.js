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
  const [form, setForm] = useState({ nombre: '', rut: '', email: '', telefono: '' });
  const [acepta, setAcepta] = useState(false);
  const [captchaValido, setCaptchaValido] = useState(false);
  const [modalInfo, setModalInfo] = useState(null);
  const [modoFormulario, setModoFormulario] = useState(false);
  const [cotizacionEnviada, setCotizacionEnviada] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/exams`)
      .then(res => res.json())
      .then(data => setExamenes(Array.isArray(data) ? data : []));

    fetch(`${process.env.REACT_APP_API_URL}/api/tasa-cambio`)
      .then(res => res.json())
      .then(data => setTasaCambio(data.tasa));
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
    if (!form.nombre || !form.rut || !form.email || !acepta || !captchaValido || seleccionados.length === 0 || !tasaCambio) {
      alert('Completa todos los campos, acepta los términos, selecciona al menos un examen y espera que se cargue la tasa de cambio.');
      return;
    }

    const resumen = {
      paciente: form,
      cotizacion: seleccionados.map(e => ({
        codigo: e.codigo,
        nombre: e.nombre,
        tiempo_entrega: e.tiempo_entrega || null,
        precioUSD: Number(e.precio),
        precioVES: Number(e.precio) * tasaCambio
      })),
      totalUSD: seleccionados.reduce((sum, e) => sum + Number(e.precio), 0),
      totalVES: seleccionados.reduce((sum, e) => sum + Number(e.precio), 0) * tasaCambio
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/cotizaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, resumen })
      });

      if (!res.ok) throw new Error('Fallo al enviar la cotización');
      setCotizacionEnviada(true);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al enviar la cotización');
    }
  };

  const filtrados = examenes.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cotizacionEnviada) {
    return (
      <div className="thankyou-screen">
        <div className="logo-header">LOGO AQUÍ</div>
        <h1>¡Gracias por cotizar con nosotros!</h1>
        <p>
          Te enviamos un PDF con el detalle de tu cotización al correo que nos indicaste.<br />
          Si no lo ves en tu bandeja de entrada, revisa la carpeta de spam o promociones.
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

      <div className="cotizador-content">
        <div className="cotizador-left">
          {!modoFormulario ? (
            <>
              <h2 className="cotizador-title">Cotiza tus exámenes de forma rápida</h2>
              <p className="cotizador-subtitle">
                Selecciona los exámenes que necesitas. Cuando estés listo, presiona “Continuar” para completar tus datos y recibir el detalle de tu cotización.
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
                      {' '}{ex.nombre}
                    </label>
                    <div>
                      <button onClick={() => setModalInfo(ex)}>Indicación</button>
                    </div>
                  </div>
                ))}
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
                <input id="nombre" className="form-input" placeholder="¿Cuál es tu nombre?" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </div>

              <div className="form-group">
                <label htmlFor="rut">Cédula</label>
                <input id="rut" className="form-input" placeholder="Tu número de cédula" value={form.rut} onChange={e => setForm({ ...form, rut: e.target.value })} />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input id="telefono" className="form-input" placeholder="Número donde podamos contactarte" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input id="email" className="form-input" placeholder="Correo para enviarte la cotización" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className="checkbox-line">
                <input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)} />
                <span>Autorizo que se me contacte con fines informativos y de marketing del centro médico.</span>
              </div>

              <button onClick={() => setCaptchaValido(true)}>Simular CAPTCHA ✔️</button><br /><br />

              <div className="form-buttons">
                <button className="btn-volver" onClick={() => setModoFormulario(false)}>
                  <img src={ArrowLeftIcon} alt="Volver" />
                  <span>Volver al listado</span>
                </button>

                <button className="btn-enviar" onClick={handleSubmit}>
                  <img src={MailIcon} alt="Enviar" />
                  <span>Enviar cotización</span>
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
                    <span className="exam-name">{ex.nombre}</span>
                    <div className="indicacion-btn-wrapper">
                      <button onClick={() => setModalInfo(ex)}>Indicación</button>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(ex.codigo)}>✕</button>
                </div>
              ))}
            </>
          )}
        </div>

        {modalInfo && (
          <div className={`modal-overlay ${isMobile ? 'modal-mobile' : ''}`}>
            <div className="modal-box">
              <h3>{modalInfo.nombre}</h3>
              <p>{modalInfo.informacion || 'Información no disponible (desactivado).'}</p>
              <button onClick={() => setModalInfo(null)}>Entendido</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
