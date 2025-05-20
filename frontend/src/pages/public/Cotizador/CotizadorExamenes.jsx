import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import SearchField from '../../../components/Inputs/SearchField';
import InputField from '../../../components/Inputs/InputField';
import SelectField from '../../../components/Inputs/SelectField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import Button from '../../../components/Button/Button';
import Modal from '../../../components/Modal/Modal';
import Banner from '../../../components/Banner/Banner';
import '../../../styles/tokens.css';
import './CotizadorExamenes.css';

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
  const [debugInfo, setDebugInfo] = useState(null);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    fetch(`${apiUrl}/api/exams`)
      .then(res => res.json())
      .then(data => setExamenes(Array.isArray(data) ? data : []))
      .catch(() => setError('No pudimos cargar el catálogo de exámenes.'));
    fetch(`${apiUrl}/api/tasa-cambio`)
      .then(res => res.json())
      .then(data => setTasaCambio(data?.tasa))
      .catch(() => setError('No pudimos obtener la tasa de cambio.'));
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

  // Fix: avoid error if e.nombre is undefined
  const filtrados = examenes.filter(e => (e?.nombre || '').toLowerCase().includes((busqueda || '').toLowerCase()));

  if (cargando) {
    return <div className="loading-screen"><div className="spinner"></div><p>Procesando tu cotización...</p></div>;
  }
  if (cotizacionEnviada) {
    return (
      <div className="thankyou-screen">
        <div className="logo-header">LOGO AQUÍ</div>
        <h1>¡Gracias por cotizar con nosotros!</h1>
        <p>Te enviamos un PDF con el detalle de tu cotización al correo que nos indicaste.<br />Si no lo ves en tu bandeja de entrada, revisa la carpeta de spam o promociones.</p>
        <div className="cotizacion-id"><span>Número de cotización: </span><strong>{cotizacionId}</strong></div>
        <div className="thankyou-buttons">
          <Button onClick={() => window.location.href = '/'}>Volver a la página principal</Button>
          <Button onClick={() => window.location.reload()}>Hacer otra cotización</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`cotizador-wrapper ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="logo-header">LOGO AQUÍ</div>
      {error && <Banner title="Error" text={error} variant="danger" onClose={() => setError(null)} />}
      <div className="cotizador-content">
        <div className="cotizador-left">
          {!modoFormulario ? (
            <>
              <h2 className="cotizador-title">Cotiza tus exámenes de forma rápida</h2>
              <p className="cotizador-subtitle">Selecciona los exámenes que necesitas. Cuando estés listo, presiona "Continuar" para completar tus datos y recibir el detalle de tu cotización.</p>
              <SearchField value={busqueda} onChange={setBusqueda} placeholder="Buscar examen por nombre" fillContainer />
              <div className="exam-list-scroll">
                {filtrados.length === 0 ? (
                  <p className="no-examenes">No se encontraron exámenes con ese nombre</p>
                ) : (
                  filtrados.map(ex => (
                    <div className="exam-item" key={ex.codigo}>
                      <CheckboxField label={ex.nombre} checked={false} onChange={() => handleSelect(ex)} />
                      <Button variant="subtle" size="small" onClick={() => setModalInfo(ex)} style={{marginTop: 4}}>Indicación</Button>
                    </div>
                  ))
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" disabled={seleccionados.length === 0} onClick={() => setModoFormulario(true)}>Continuar</Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="cotizador-title">Para enviarte tu cotización, necesitamos algunos datos</h2>
              <p className="cotizador-subtitle">Usaremos esta información para contactarte y enviarte el detalle de tu cotización.</p>
              <InputField label="Nombre" value={form.nombre} onChange={v => setForm({ ...form, nombre: v })} placeholder="¿Cuál es tu nombre?" fillContainer />
              <InputField label="Apellido" value={form.apellido} onChange={v => setForm({ ...form, apellido: v })} placeholder="¿Cuál es tu apellido?" fillContainer />
              <InputField label="Cédula" value={form.cedula} onChange={v => setForm({ ...form, cedula: v })} placeholder="Tu número de cédula" fillContainer />
              <InputField label="Teléfono" value={form.telefono} onChange={v => setForm({ ...form, telefono: v })} placeholder="Número donde podamos contactarte" fillContainer />
              <InputField label="Correo electrónico" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="Correo para enviarte la cotización" fillContainer />
              <InputField label="Fecha de nacimiento" value={form.fecha_nacimiento} onChange={v => setForm({ ...form, fecha_nacimiento: v })} placeholder="YYYY-MM-DD" fillContainer />
              <SelectField label="Sexo" value={form.sexo} onChange={v => setForm({ ...form, sexo: v })} options={[{label:'Masculino',value:'masculino'},{label:'Femenino',value:'femenino'},{label:'Otro',value:'otro'}]} fillContainer />
              <CheckboxField label="Autorizo que se me contacte con fines informativos y de marketing del centro médico." checked={acepta} onChange={setAcepta} />
              <Button variant={captchaValido ? 'positive' : 'primary'} onClick={() => setCaptchaValido(true)} disabled={captchaValido} style={{marginBottom: 12}}>{captchaValido ? 'CAPTCHA ✓' : 'Simular CAPTCHA'}</Button>
              <div className="form-buttons">
                <Button variant="subtle" onClick={() => setModoFormulario(false)}>Volver al listado</Button>
                <Button variant="primary" onClick={() => {}} disabled={cargando}>Enviar cotización</Button>
              </div>
            </>
          )}
        </div>
        <div className="cotizador-right">
          <h4>{seleccionados.length === 0 ? 'Aún no has seleccionado ningún examen' : 'Estos son los exámenes que quieres cotizar'}</h4>
          {seleccionados.length === 0 ? (
            <p className="no-seleccionados">Busca en el listado o escribe el nombre del examen que necesitas para comenzar tu cotización.</p>
          ) : (
            <div className="examenes-seleccionados">
              {seleccionados.map(ex => (
                <div className="selected-exam" key={ex.codigo}>
                  <span className="exam-name">{ex.nombre}</span>
                  <Button variant="subtle" size="small" onClick={() => setModalInfo(ex)}>Indicación</Button>
                  <Button variant="danger" size="small" onClick={() => handleRemove(ex.codigo)} aria-label="Eliminar examen">✕</Button>
                </div>
              ))}
            </div>
          )}
        </div>
        {modalInfo && (
          <Modal
            isOpen={!!modalInfo}
            heading={modalInfo.nombre}
            bodyText={modalInfo.informacion || 'Información no disponible.'}
            primaryButtonText="Entendido"
            onPrimaryClick={() => setModalInfo(null)}
            onClose={() => setModalInfo(null)}
          />
        )}
      </div>
    </div>
  );
}
