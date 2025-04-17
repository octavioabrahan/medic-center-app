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
email: '', 
telefono: '',
fecha_nacimiento: '',
sexo: 'masculino' // Valor por defecto
});
const [acepta, setAcepta] = useState(false);
const [captchaValido, setCaptchaValido] = useState(false);
const [modalInfo, setModalInfo] = useState(null);
const [modoFormulario, setModoFormulario] = useState(false);
const [cotizacionEnviada, setCotizacionEnviada] = useState(false);
const [cotizacionId, setCotizacionId] = useState(null);
const [cargando, setCargando] = useState(false);
const [error, setError] = useState(null);

const isMobile = useMediaQuery({ maxWidth: 768 });

useEffect(() => {
// Cargar catálogo de exámenes disponibles
fetch(`${process.env.REACT_APP_API_URL}/api/exams`)
.then(res => res.json())
.then(data => {
if (Array.isArray(data)) {
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
fetch(`${process.env.REACT_APP_API_URL}/api/tasa-cambio`)
.then(res => res.json())
.then(data => {
if (data && data.tasa) {
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
setSeleccionados([...seleccionados, examen]);
setExamenes(examenes.filter(e => e.codigo !== examen.codigo));
};

const handleRemove = (codigo) => {
const examen = seleccionados.find(e => e.codigo === codigo);
setExamenes([...examenes, examen]);
setSeleccionados(seleccionados.filter(e => e.codigo !== codigo));
};

const validarFormulario = () => {
if (!form.nombre.trim()) return 'Debes ingresar tu nombre';
if (!form.apellido.trim()) return 'Debes ingresar tu apellido';
if (!form.cedula.trim()) return 'Debes ingresar tu cédula';
if (!form.email.trim()) return 'Debes ingresar tu correo electrónico';
if (!form.telefono.trim()) return 'Debes ingresar tu teléfono';
if (!form.fecha_nacimiento) return 'Debes ingresar tu fecha de nacimiento';
if (!form.sexo) return 'Debes seleccionar tu sexo';
if (!acepta) return 'Debes aceptar los términos';
if (!captchaValido) return 'Debes completar el captcha';
if (seleccionados.length === 0) return 'Debes seleccionar al menos un examen';
if (!tasaCambio) return 'Estamos esperando que se cargue la tasa de cambio';
return null;
};

const handleSubmit = async () => {
const mensajeError = validarFormulario();
if (mensajeError) {
alert(mensajeError);
return;
}

setCargando(true);
setError(null);

try {
// Preparar los datos de los exámenes con la estructura correcta
const examenesFormateados = seleccionados.map(examen => ({
codigo: examen.codigo,
nombre: examen.nombre,
precio: Number(examen.precio),
tiempo_entrega: examen.tiempo_entrega || null
}));

// Enviar cotización a la API
const res = await fetch(`${process.env.REACT_APP_API_URL}/api/cotizaciones`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ 
nombre: form.nombre,
apellido: form.apellido,
cedula: form.cedula,
email: form.email,
telefono: form.telefono,
fecha_nacimiento: form.fecha_nacimiento,
sexo: form.sexo,
examenes: examenesFormateados,
tasaCambio
})
});

if (!res.ok) {
const errorData = await res.json();
throw new Error(errorData.error || 'Error al enviar la cotización');
}

const result = await res.json();
setCotizacionId(result.id);
setCotizacionEnviada(true);
} catch (err) {
console.error('Error:', err);
setError(err.message || 'Ocurrió un error al enviar la cotización');
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
  onChange={e => setForm({ ...form, nombre: e.target.value })} 
/>
</div>

<div className="form-group">
<label htmlFor="apellido">Apellido</label>
<input 
  id="apellido" 
  className="form-input" 
  placeholder="¿Cuál es tu apellido?" 
  value={form.apellido} 
  onChange={e => setForm({ ...form, apellido: e.target.value })} 
/>
</div>

<div className="form-group">
<label htmlFor="cedula">Cédula</label>
<input 
  id="cedula" 
  className="form-input" 
  placeholder="Tu número de cédula" 
  value={form.cedula} 
  onChange={e => setForm({ ...form, cedula: e.target.value })} 
/>
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
<label htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
<input 
  id="fecha_nacimiento" 
  className="form-input" 
  type="date"
  value={form.fecha_nacimiento} 
  onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })} 
/>
</div>

<div className="form-group">
<label htmlFor="sexo">Sexo</label>
<select
  id="sexo"
  className="form-input"
  value={form.sexo}
  onChange={e => setForm({ ...form, sexo: e.target.value })}
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
  onChange={e => setForm({ ...form, email: e.target.value })} 
/>
</div>

<div className="checkbox-line">
<input 
  type="checkbox" 
  checked={acepta} 
  onChange={e => setAcepta(e.target.checked)} 
  id="terminos"
/>
<label htmlFor="terminos">
  Autorizo que se me contacte con fines informativos y de marketing del centro médico.
</label>
</div>

<button 
className="btn-captcha" 
onClick={() => setCaptchaValido(true)}
disabled={captchaValido}
>
{captchaValido ? "CAPTCHA ✓" : "Simular CAPTCHA"}
</button>

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