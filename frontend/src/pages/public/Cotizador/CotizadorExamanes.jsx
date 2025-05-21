import React, { useState, useEffect } from 'react';
import SiteFrame from '../../../components/SiteFrame/SiteFrame';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import InputField from '../../../components/Inputs/InputField';
import { Button } from '../../../components/Button/Button';
import ArrowLeft from '../../../assets/ArrowLeft.svg';
import { XMarkIcon } from '@heroicons/react/24/outline';
import styles from './CotizadorExamanes.module.css';
import DatePickerField from '../../../components/Inputs/DatePickerField';
import SimpleSearch from './SimpleSearch'; // Import our completely new search component

export default function Cotizaciones() {
  // --- STATE (match v1) ---
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
  const [modoFormulario, setModoFormulario] = useState(false);
  const [cotizacionEnviada, setCotizacionEnviada] = useState(false);
  const [cotizacionId, setCotizacionId] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [modalInfo, setModalInfo] = useState(null);

  // --- FETCH DATA (match v1) ---
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    setCargando(true);
    setError(null);
    console.log('🔍 DEBUG: Iniciando carga de exámenes...');
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
          setExamenes(data.map(e => ({ ...e, precio: e.preciousd })));
        } else {
          console.error('Error: Los datos de exámenes no son un array', data);
          setExamenes([]);
        }
      })
      .catch(err => {
        console.error('Error al cargar exámenes:', err);
        setError('No pudimos cargar el catálogo de exámenes. Por favor, intenta más tarde.');
      });
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
    setCargando(false);
  }, []);

  // --- EXAM SELECTION (match v1) ---
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

  // --- FORM SUBMIT (match v1) ---
  const handleSubmit = async () => {
    // Validación básica
    console.log('🔍 DEBUG: Validando formulario con datos:', form);
    if (!form.nombre.trim() || !form.apellido.trim() || !form.cedula.trim() || !form.telefono.trim() || !form.fecha_nacimiento || !form.sexo || !form.email.trim() || !acepta) {
      console.error('🔍 DEBUG: Error de validación: Completa todos los campos y acepta los términos.');
      setError('Completa todos los campos y acepta los términos.');
      return;
    }
    if (seleccionados.length === 0) {
      console.error('🔍 DEBUG: Error de validación: Selecciona al menos un examen.');
      setError('Selecciona al menos un examen.');
      return;
    }
    setCargando(true);
    setError(null);
    try {
      // Formatear fecha_nacimiento a YYYY-MM-DD
      let fechaNacimientoFormateada = form.fecha_nacimiento;
      if (fechaNacimientoFormateada) {
        const fechaObj = new Date(fechaNacimientoFormateada);
        if (!isNaN(fechaObj.getTime())) {
          fechaNacimientoFormateada = fechaObj.toISOString().split('T')[0];
          console.log('🔍 DEBUG: Fecha de nacimiento formateada:', fechaNacimientoFormateada);
        } else {
          console.error('🔍 DEBUG: No se pudo formatear la fecha de nacimiento, se enviará como está:', fechaNacimientoFormateada);
        }
      }
      // Validar tasa de cambio
      const tasaCambioNumerico = Number(tasaCambio);
      if (isNaN(tasaCambioNumerico)) {
        throw new Error('La tasa de cambio no es un número válido');
      }
      console.log('🔍 DEBUG: Tasa de cambio convertida a número:', tasaCambioNumerico);
      // Map selected exams to match v1
      const examenesFormateados = seleccionados.map(examen => {
        const precioNumerico = Number(examen.precio);
        if (isNaN(precioNumerico)) {
          console.error('🔍 DEBUG: Precio no válido para examen:', examen);
        }
        return {
          codigo: examen.codigo,
          nombre: examen.nombre_examen || examen.nombre,
          preciousd: precioNumerico, // Use preciousd for backend compatibility
          tiempo_entrega: examen.tiempo_entrega || null
        };
      });
      console.log('🔍 DEBUG: Exámenes formateados:', examenesFormateados);
      const dataToSend = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        cedula: form.cedula.trim(),
        telefono: form.telefono.trim(),
        fecha_nacimiento: fechaNacimientoFormateada,
        sexo: form.sexo === 'femenino' ? 'F' : 'M', // Map to single char for DB
        email: form.email.trim(),
        examenes: examenesFormateados,
        tasaCambio: tasaCambioNumerico
      };
      console.log('🔍 DEBUG: Datos finales a enviar:', JSON.stringify(dataToSend, null, 2));
      const apiUrl = process.env.REACT_APP_API_URL;
      const res = await fetch(`${apiUrl}/api/cotizaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      console.log('🔍 DEBUG: Respuesta recibida, status:', res.status);
      const responseText = await res.text();
      console.log('🔍 DEBUG: Respuesta texto completo:', responseText);
      let responseData;
      try {
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
    } finally {
      setCargando(false);
    }
  };

  // --- UI/UX LOGIC ---
  const filteredExams = examenes.filter(exam => {
    // First check if exam exists and has a valid name property
    if (!exam || typeof exam.nombre_examen !== 'string') return false;
    
    // Then check if the exam name includes the search term and isn't already selected
    const matchesSearch = exam.nombre_examen.toLowerCase().includes(busqueda.toLowerCase());
    const notAlreadySelected = !seleccionados.some(sel => sel.codigo === exam.codigo);
    
    return matchesSearch && notAlreadySelected;
  });

  const handleToggle = (codigo) => {
    const exam = examenes.find(e => e.codigo === codigo);
    if (!exam) return;
    setSeleccionados(prev =>
      prev.some(e => e.codigo === codigo)
        ? prev.filter(e => e.codigo !== codigo)
        : [...prev, exam]
    );
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // --- STEP 1: Selección de exámenes ---
  if (cotizacionEnviada) {
    // Let the default Step 3 at the end handle this case
    // The flow will now reach Step 3 when cotizacionEnviada is true
  }

  if (!modoFormulario) {
    return (
      <SiteFrame>
        <div className={styles.cotizadorFrame4}>
          <div className={styles.cotizadorHeroForm}>
            <div className={styles.cotizadorTitle}>Cotiza tus exámenes de forma rápida</div>
            <div className={styles.cotizadorSubtitle}>
              Selecciona los exámenes que necesitas. Cuando estés listo, presiona “Continuar” para completar tus datos y recibir el detalle de tu cotización.
            </div>
            <div className={styles.cotizadorInputField}>
              <SimpleSearch
                value={busqueda}
                onChange={setBusqueda}
                placeholder="Buscar examen por nombre"
              />
            </div>
            <div className={styles.cotizadorFrame1}>
              {filteredExams.length === 0 ? (
                <div className={styles.cotizadorSubtitle2}>No se encontraron exámenes con ese nombre</div>
              ) : (
                filteredExams.map((exam) => (
                  <div key={exam.codigo} className={styles.cotizadorChoiceCard}>
                    <div className={styles.cotizadorCheckboxField}>
                      <CheckboxField
                        label={exam.nombre_examen}
                        checked={seleccionados.some(e => e.codigo === exam.codigo)}
                        onChange={() => handleSelect(exam)}
                      />
                      <div className={styles.cotizadorDescriptionRow}>
                        <div className={styles.cotizadorSpace}></div>
                        <span
                          className={styles.cotizadorDescription}
                          tabIndex={0}
                          role="button"
                          onClick={() => setModalInfo(exam)}
                          onKeyPress={e => { if (e.key === 'Enter') setModalInfo(exam); }}
                        >
                          Indicación
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Button in its own right-aligned container */}
            <div className={styles.cotizadorButtonRightContainer}>
              <Button
                variant="primary"
                size="medium"
                disabled={seleccionados.length === 0}
                onClick={() => setModoFormulario(true)}
              >
                Continuar
              </Button>
            </div>
            {error && <div className={styles.cotizadorSubtitle2}>{error}</div>}
          </div>
          <div className={styles.cotizadorHeroForm2}>
            <div className={styles.cotizadorTitle}>{seleccionados.length === 0 ? 'Aún no has seleccionado ningún examen' : 'Resumen de los exámenes a cotizar'}</div>
            <div className={styles.cotizadorFrame3}>
              {seleccionados.length === 0 ? (
                <div className={styles.cotizadorSubtitle2}>
                  Busca en el listado o escribe el nombre del examen que necesitas para comenzar tu cotización.
                </div>
              ) : (
                seleccionados.map(exam => (
                  <div key={exam.codigo} className={styles.cotizadorChoiceCard}>
                    <div className={styles.cotizadorCheckboxField2}>
                      <div className={styles.cotizadorCheckboxAndLabel}>
                        <div className={styles.cotizadorLabel2}>{exam.nombre_examen}</div>
                        <button
                          type="button"
                          className={styles.cotizadorRemoveBtn}
                          aria-label="Eliminar examen"
                          onClick={() => handleRemove(exam.codigo)}
                        >
                          <XMarkIcon className={styles.cotizadorRemoveIcon} width={20} height={20} />
                        </button>
                      </div>
                      <div className={styles.cotizadorDescriptionRow}>
                        <span
                          className={styles.cotizadorDescription}
                          tabIndex={0}
                          role="button"
                          onClick={() => setModalInfo(exam)}
                          onKeyPress={e => { if (e.key === 'Enter') setModalInfo(exam); }}
                        >
                          Indicación
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        {/* Modal for exam indication */}
        {modalInfo && (
          <div className={styles.dialog} onClick={() => setModalInfo(null)}>
            <div className={styles.dialogBody} onClick={e => e.stopPropagation()}>
              <div className={styles.text}>
                <div className={styles.textHeading}>{modalInfo.nombre_examen}</div>
                <div className={styles.bodyText}>
                  {(modalInfo.indicacion && modalInfo.indicacion.trim())
                    ? modalInfo.indicacion
                    : (modalInfo.informacion && modalInfo.informacion.trim()
                        ? modalInfo.informacion
                        : 'No hay información de indicación disponible.')}
                </div>
              </div>
              <div className={styles.buttonGroup}>
                <div className={styles.button} onClick={() => setModalInfo(null)}>
                  <div className={styles.button2}>Entendido</div>
                </div>
              </div>
              <div className={styles.iconButton} onClick={() => setModalInfo(null)}>
                <XMarkIcon className={styles.x} width={20} height={20} />
              </div>
            </div>
          </div>
        )}
      </SiteFrame>
    );
  }

  // --- STEP 2: Formulario de datos y resumen ---
  if (modoFormulario) {
    return (
      <SiteFrame>
        <div className={styles.cotizadorFrame4}>
          <div className={styles.cotizadorHeroForm}>
            <div className={styles.cotizadorButtonGroupTop}>
              <Button variant="subtle" size="small" onClick={() => setModoFormulario(false)}>
                <img src={ArrowLeft} alt="Volver" className={styles.cotizadorArrowLeft} />
                <span className={styles.cotizadorButton2}>Volver al listado</span>
              </Button>
            </div>
            <div className={styles.cotizadorTitle}>Para enviarte tu cotización, necesitamos algunos datos</div>
            <div className={styles.cotizadorSubtitle}>
              Usaremos esta información para contactarte y enviarte el detalle de tu cotización.
            </div>
            {/* Only the input fields are inside the scrollable form */}
            <div className={styles.cotizadorHeroFormScroll}>
              <div className={styles.cotizadorInputField}>
                <InputField
                  label="Nombre"
                  value={form.nombre}
                  placeholder="¿Cuál es tu nombre?"
                  onChange={v => handleFormChange('nombre', v)}
                  fillContainer
                />
              </div>
              <div className={styles.cotizadorInputField}>
                <InputField
                  label="Apellido"
                  value={form.apellido}
                  placeholder="¿Cuál es tu apellido?"
                  onChange={v => handleFormChange('apellido', v)}
                  fillContainer
                />
              </div>
              <div className={styles.cotizadorInputField}>
                <InputField
                  label="Cédula"
                  value={form.cedula}
                  placeholder="Tu número de cédula"
                  onChange={v => handleFormChange('cedula', v)}
                  fillContainer
                />
              </div>
              <div className={styles.cotizadorInputField}>
                <InputField
                  label="Teléfono"
                  value={form.telefono}
                  placeholder="Número donde podamos contactarte"
                  onChange={v => handleFormChange('telefono', v)}
                  fillContainer
                />
              </div>
              <div className={styles.cotizadorInputField}>
                <label>Fecha de nacimiento</label>
                <DatePickerField
                  value={form.fecha_nacimiento}
                  onChange={v => handleFormChange('fecha_nacimiento', v)}
                  maxDate={new Date()}
                  showYearDropdown
                  showMonthDropdown
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Selecciona la fecha"
                  className={styles.cotizadorDatePicker}
                />
              </div>
              <div className={styles.cotizadorInputField}>
                <label>Sexo</label>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <label>
                    <input
                      type="radio"
                      name="sexo"
                      value="masculino"
                      checked={form.sexo === 'masculino'}
                      onChange={() => handleFormChange('sexo', 'masculino')}
                    />
                    Masculino
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="sexo"
                      value="femenino"
                      checked={form.sexo === 'femenino'}
                      onChange={() => handleFormChange('sexo', 'femenino')}
                    />
                    Femenino
                  </label>
                </div>
              </div>
              <div className={styles.cotizadorInputField}>
                <InputField
                  label="Correo electrónico"
                  value={form.email}
                  placeholder="Correo para enviarte la cotización"
                  onChange={v => handleFormChange('email', v)}
                  fillContainer
                />
              </div>
            </div>
            {/* The rest (back button, text, check, send button) stays outside the scrollable form */}
            <div className={styles.cotizadorCheckboxFieldContainer}>
              <div className={styles.cotizadorCheckboxField}>
                <CheckboxField
                  label={
                    <span className={styles.cotizadorLabel2}>
                      Autorizo que se me contacte con fines informativos y de marketing del centro médico.
                    </span>
                  }
                  checked={acepta}
                  onChange={v => setAcepta(v)}
                />
              </div>
            </div>
            <div className={styles.cotizadorButtonRow}>
              <div style={{ flex: 1 }}></div>
              <div className={styles.cotizadorButtonRightContainer}>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleSubmit}
                  disabled={
                    cargando ||
                    !form.nombre.trim() ||
                    !form.apellido.trim() ||
                    !form.cedula.trim() ||
                    !form.telefono.trim() ||
                    !form.fecha_nacimiento ||
                    !form.sexo ||
                    !form.email.trim() ||
                    !acepta
                  }
                >
                  <span className={styles.cotizadorButton4}>Enviar cotización</span>
                </Button>
              </div>
            </div>
            {error && <div className={styles.cotizadorSubtitle2}>{error}</div>}
          </div>
          <div className={styles.cotizadorHeroForm2}>
            <div className={styles.cotizadorTitle}>Resumen de los exámenes a cotizar</div>
            <div className={styles.cotizadorFrame3}>
              {seleccionados.map(exam => (
                <div key={exam.codigo} className={styles.cotizadorChoiceCard}>
                  <div className={styles.cotizadorCheckboxField2}>
                    <div className={styles.cotizadorCheckboxAndLabel}>
                      <div className={styles.cotizadorLabel2}>{exam.nombre_examen}</div>
                      <button
                        type="button"
                        className={styles.cotizadorRemoveBtn}
                        aria-label="Eliminar examen"
                        onClick={() => handleRemove(exam.codigo)}
                      >
                        <XMarkIcon className={styles.cotizadorRemoveIcon} width={20} height={20} />
                      </button>
                    </div>
                    <div className={styles.cotizadorDescriptionRow}>
                      <span
                        className={styles.cotizadorDescription}
                        tabIndex={0}
                        role="button"
                        onClick={() => setModalInfo(exam)}
                        onKeyPress={e => { if (e.key === 'Enter') setModalInfo(exam); }}
                      >
                        Indicación
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SiteFrame>
    );
  }
  
  // --- STEP 3: Confirmación final ---
  // This is our final return statement - shown when cotizacionEnviada is true
  return (
    <SiteFrame>
      <div className={styles.cotizadorHeroForm}>
        <div className={styles.cotizadorTitle}>¡Gracias por cotizar con nosotros!</div>
        <div className={styles.cotizadorSubtitle}>
          Te enviamos un PDF con el detalle de tu cotización al correo que nos indicaste.<br />
          Si no lo ves en tu bandeja de entrada, revisa la carpeta de spam o promociones.
        </div>
        <div className={styles.cotizadorButtonGroup}>
          <Button variant="subtle" size="medium" fullWidth={false} onClick={() => window.location.href = '/'}>
            <span className={styles.cotizadorButton2}>Volver a la página principal</span>
          </Button>
          <Button
            variant="primary"
            size="medium"
            fullWidth={false}
            onClick={() => {
              setModoFormulario(false);
              setSeleccionados([]);
              setForm({ nombre: '', apellido: '', cedula: '', telefono: '', fecha_nacimiento: '', sexo: 'masculino', email: '' });
              setCotizacionEnviada(false);
              setCotizacionId(null);
            }}
          >
            <span className={styles.cotizadorButton4}>Hacer otra cotización</span>
          </Button>
        </div>
        {cotizacionId && (
          <div className={styles.cotizadorSubtitle2} style={{marginTop: 24}}>
            <span>Número de cotización: </span>
            <strong>{cotizacionId}</strong>
          </div>
        )}
      </div>
    </SiteFrame>
  );
}