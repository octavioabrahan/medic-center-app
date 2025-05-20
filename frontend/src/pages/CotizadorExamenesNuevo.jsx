// Combines the robust logic of CotizadorExamenes.js with the modern UI and style of Cotizaciones.jsx
// Uses all the styled components and CSS modules from Cotizaciones.jsx, but preserves all debug, error, and validation logic from CotizadorExamenes.js

import React, { useEffect, useState } from 'react';
import SiteFrame from '../components/SiteFrame/SiteFrame';
import SearchField from '../components/Inputs/SearchField';
import CheckboxField from '../components/Inputs/CheckboxField';
import InputField from '../components/Inputs/InputField';
import { Button } from '../components/Button/Button';
import DatePickerField from '../components/Inputs/DatePickerField';
import ArrowLeft from '../assets/ArrowLeft.svg';
import MailIcon from '../assets/Mail.svg';
import styles from './public/Cotizador/Cotizaciones.module.css';

export default function CotizadorExamenesNuevo() {
  // --- LOGIC (from CotizadorExamenes.js, adapted) ---
  const [exams, setExams] = useState([]); // Catálogo de exámenes
  const [exchangeRate, setExchangeRate] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]); // [{codigo, nombre, ...}]
  const [form, setForm] = useState({ 
    nombre: '', 
    apellido: '', 
    cedula: '', 
    telefono: '',
    fecha_nacimiento: '',
    sexo: 'masculino',
    email: '',
    acepta: false
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalExam, setModalExam] = useState(null);
  const [quoteId, setQuoteId] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [captchaValido, setCaptchaValido] = useState(false);

  // Cargar catálogo de exámenes y tasa de cambio
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${apiUrl}/api/exams`).then(async r => {
        if (!r.ok) throw new Error('Error al cargar exámenes');
        const data = await r.json();
        if (!Array.isArray(data)) throw new Error('La respuesta de exámenes no es un array');
        if (data.length === 0) throw new Error('No hay exámenes disponibles');
        return data;
      }),
      fetch(`${apiUrl}/api/tasa-cambio`).then(async r => {
        if (!r.ok) throw new Error('Error al cargar tasa de cambio');
        const data = await r.json();
        if (!data || typeof data.tasa === 'undefined') throw new Error('No se recibió la tasa de cambio');
        return data;
      })
    ])
      .then(([examsData, rateData]) => {
        setExams(examsData);
        setExchangeRate(rateData.tasa);
      })
      .catch((err) => setError(err.message || 'No pudimos cargar los datos. Intenta más tarde.'))
      .finally(() => setLoading(false));
  }, []);

  // --- UI/UX LOGIC ---
  const filteredExams = exams.filter(exam => {
    const nombre = exam.nombre_examen || exam.nombre;
    return nombre && nombre.toLowerCase().includes(search.toLowerCase()) &&
      !selected.some(sel => sel.codigo === exam.codigo);
  });

  const handleToggle = (codigo) => {
    const exam = exams.find(e => e.codigo === codigo);
    if (!exam) return;
    setSelected(prev =>
      prev.some(e => e.codigo === codigo)
        ? prev.filter(e => e.codigo !== codigo)
        : [...prev, exam]
    );
  };

  const handleRemove = (codigo) => {
    setSelected(prev => prev.filter(e => e.codigo !== codigo));
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // --- VALIDATION (from CotizadorExamenes.js) ---
  const validarFormulario = () => {
    if (!form.nombre.trim()) return 'Debes ingresar tu nombre';
    if (!form.apellido.trim()) return 'Debes ingresar tu apellido';
    if (!form.cedula.trim()) return 'Debes ingresar tu cédula';
    if (!form.telefono.trim()) return 'Debes ingresar tu teléfono';
    if (!form.fecha_nacimiento) return 'Debes ingresar tu fecha de nacimiento';
    if (!form.sexo) return 'Debes seleccionar tu sexo';
    if (!form.email.trim()) return 'Debes ingresar tu correo electrónico';
    if (!form.acepta) return 'Debes aceptar los términos';
    if (!captchaValido) return 'Debes completar el captcha';
    if (selected.length === 0) return 'Debes seleccionar al menos un examen';
    if (!exchangeRate) return 'Estamos esperando que se cargue la tasa de cambio';
    return null;
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async () => {
    const mensajeError = validarFormulario();
    if (mensajeError) {
      setError(mensajeError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Formatear fecha_nacimiento a YYYY-MM-DD
      let fechaNacimientoFormateada = form.fecha_nacimiento;
      if (fechaNacimientoFormateada) {
        const fechaObj = new Date(fechaNacimientoFormateada);
        if (!isNaN(fechaObj.getTime())) {
          fechaNacimientoFormateada = fechaObj.toISOString().split('T')[0];
        }
      }
      const dataToSend = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        cedula: form.cedula.trim(),
        telefono: form.telefono.trim(),
        fecha_nacimiento: fechaNacimientoFormateada,
        sexo: form.sexo,
        email: form.email.trim(),
        examenes: selected.map(e => ({
          codigo: e.codigo,
          nombre: e.nombre_examen || e.nombre,
          precio: Number(e.precio),
          tiempo_entrega: e.tiempo_entrega || null
        })),
        tasaCambio: Number(exchangeRate)
      };
      setDebugInfo({ message: 'Datos enviados al servidor:', data: dataToSend });
      const apiUrl = process.env.REACT_APP_API_URL;
      const res = await fetch(`${apiUrl}/api/cotizaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      const responseText = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { error: 'Error al procesar la respuesta del servidor' };
      }
      if (!res.ok) throw new Error(responseData.error || 'Error al enviar la cotización');
      setQuoteId(responseData.id);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al enviar la cotización');
      setDebugInfo({ message: 'Error durante el envío:', data: { error: err.message, stack: err.stack } });
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 1: Selección de exámenes ---
  if (step === 1) {
    return (
      <SiteFrame>
        <div className={styles.cotizadorFrame4}>
          {debugInfo && (
            <div style={{ background: '#f0f8ff', border: '1px solid #4682b4', padding: 10, margin: 10, borderRadius: 5, maxHeight: 200, overflowY: 'auto' }}>
              <h4>Información de depuración</h4>
              <p>{debugInfo.message}</p>
              <pre style={{ fontSize: 11 }}>{JSON.stringify(debugInfo.data, null, 2)}</pre>
              <button onClick={() => setDebugInfo(null)}>Cerrar</button>
            </div>
          )}
          {error && <div className={styles.cotizadorSubtitle2}>{error}</div>}
          <div className={styles.cotizadorHeroForm}>
            <div className={styles.cotizadorTitle}>Cotiza tus exámenes de forma rápida</div>
            <div className={styles.cotizadorSubtitle}>
              Selecciona los exámenes que necesitas. Cuando estés listo, presiona “Continuar” para completar tus datos y recibir el detalle de tu cotización.
            </div>
            <div className={styles.cotizadorInputField}>
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Buscar examen por nombre"
                fillContainer
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
                        label={exam.nombre_examen || exam.nombre}
                        checked={selected.some(e => e.codigo === exam.codigo)}
                        onChange={() => handleToggle(exam.codigo)}
                      />
                      <div className={styles.cotizadorDescriptionRow}>
                        <div className={styles.cotizadorSpace}></div>
                        <span
                          className={styles.cotizadorDescription}
                          tabIndex={0}
                          role="button"
                          onClick={() => setModalExam(exam)}
                          onKeyPress={e => { if (e.key === 'Enter') setModalExam(exam); }}
                        >
                          Indicación
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className={styles.cotizadorButtonRightContainer}>
              <Button
                variant="primary"
                size="medium"
                disabled={selected.length === 0}
                onClick={() => setStep(2)}
              >
                Continuar
              </Button>
            </div>
          </div>
          <div className={styles.cotizadorHeroForm2}>
            <div className={styles.cotizadorTitle}>{selected.length === 0 ? 'Aún no has seleccionado ningún examen' : 'Resumen de los exámenes a cotizar'}</div>
            <div className={styles.cotizadorFrame3}>
              {selected.length === 0 ? (
                <div className={styles.cotizadorSubtitle2}>
                  Busca en el listado o escribe el nombre del examen que necesitas para comenzar tu cotización.
                </div>
              ) : (
                selected.map(exam => (
                  <div key={exam.codigo} className={styles.cotizadorChoiceCard}>
                    <div className={styles.cotizadorCheckboxField2}>
                      <div className={styles.cotizadorCheckboxAndLabel}>
                        <div className={styles.cotizadorLabel2}>{exam.nombre_examen || exam.nombre}</div>
                        <button
                          type="button"
                          className={styles.cotizadorRemoveBtn}
                          aria-label="Eliminar examen"
                          onClick={() => handleRemove(exam.codigo)}
                        >
                          ✕
                        </button>
                      </div>
                      <div className={styles.cotizadorDescriptionRow}>
                        <span
                          className={styles.cotizadorDescription}
                          tabIndex={0}
                          role="button"
                          onClick={() => setModalExam(exam)}
                          onKeyPress={e => { if (e.key === 'Enter') setModalExam(exam); }}
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
        {modalExam && (
          <div className={styles.dialog} onClick={() => setModalExam(null)}>
            <div className={styles.dialogBody} onClick={e => e.stopPropagation()}>
              <div className={styles.text}>
                <div className={styles.textHeading}>{modalExam.nombre_examen || modalExam.nombre}</div>
                <div className={styles.bodyText}>
                  {(modalExam.indicacion && modalExam.indicacion.trim())
                    ? modalExam.indicacion
                    : (modalExam.informacion && modalExam.informacion.trim()
                        ? modalExam.informacion
                        : 'No hay información de indicación disponible.')}
                </div>
              </div>
              <div className={styles.buttonGroup}>
                <div className={styles.button} onClick={() => setModalExam(null)}>
                  <div className={styles.button2}>Entendido</div>
                </div>
              </div>
              <div className={styles.iconButton} onClick={() => setModalExam(null)}>
                ✕
              </div>
            </div>
          </div>
        )}
      </SiteFrame>
    );
  }

  // --- STEP 2: Formulario de datos y resumen ---
  if (step === 2) {
    return (
      <SiteFrame>
        <div className={styles.cotizadorFrame4}>
          {debugInfo && (
            <div style={{ background: '#f0f8ff', border: '1px solid #4682b4', padding: 10, margin: 10, borderRadius: 5, maxHeight: 200, overflowY: 'auto' }}>
              <h4>Información de depuración</h4>
              <p>{debugInfo.message}</p>
              <pre style={{ fontSize: 11 }}>{JSON.stringify(debugInfo.data, null, 2)}</pre>
              <button onClick={() => setDebugInfo(null)}>Cerrar</button>
            </div>
          )}
          {error && <div className={styles.cotizadorSubtitle2}>{error}</div>}
          <div className={styles.cotizadorHeroForm}>
            <div className={styles.cotizadorButtonGroupTop}>
              <Button variant="subtle" size="small" onClick={() => setStep(1)}>
                <img src={ArrowLeft} alt="Volver" className={styles.cotizadorArrowLeft} />
                <span className={styles.cotizadorButton2}>Volver al listado</span>
              </Button>
            </div>
            <div className={styles.cotizadorTitle}>Para enviarte tu cotización, necesitamos algunos datos</div>
            <div className={styles.cotizadorSubtitle}>
              Usaremos esta información para contactarte y enviarte el detalle de tu cotización.
            </div>
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
                  <label>
                    <input
                      type="radio"
                      name="sexo"
                      value="otro"
                      checked={form.sexo === 'otro'}
                      onChange={() => handleFormChange('sexo', 'otro')}
                    />
                    Otro
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
            <div className={styles.cotizadorCheckboxFieldContainer}>
              <div className={styles.cotizadorCheckboxField}>
                <CheckboxField
                  label={
                    <span className={styles.cotizadorLabel2}>
                      Autorizo que se me contacte con fines informativos y de marketing del centro médico.
                    </span>
                  }
                  checked={form.acepta}
                  onChange={v => handleFormChange('acepta', v)}
                />
              </div>
            </div>
            <div style={{ margin: '12px 0' }}>
              <Button
                variant={captchaValido ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setCaptchaValido(true)}
                disabled={captchaValido}
              >
                {captchaValido ? 'CAPTCHA ✓' : 'Simular CAPTCHA'}
              </Button>
            </div>
            <div className={styles.cotizadorButtonRow}>
              <div style={{ flex: 1 }}></div>
              <div className={styles.cotizadorButtonRightContainer}>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !form.nombre.trim() ||
                    !form.apellido.trim() ||
                    !form.cedula.trim() ||
                    !form.telefono.trim() ||
                    !form.fecha_nacimiento ||
                    !form.sexo ||
                    !form.email.trim() ||
                    !form.acepta ||
                    !captchaValido
                  }
                >
                  <img src={MailIcon} alt="Enviar" style={{ marginRight: 8 }} />
                  <span className={styles.cotizadorButton4}>Enviar cotización</span>
                </Button>
              </div>
            </div>
          </div>
          <div className={styles.cotizadorHeroForm2}>
            <div className={styles.cotizadorTitle}>Resumen de los exámenes a cotizar</div>
            <div className={styles.cotizadorFrame3}>
              {selected.map(exam => (
                <div key={exam.codigo} className={styles.cotizadorChoiceCard}>
                  <div className={styles.cotizadorCheckboxField2}>
                    <div className={styles.cotizadorCheckboxAndLabel}>
                      <div className={styles.cotizadorLabel2}>{exam.nombre_examen || exam.nombre}</div>
                      <button
                        type="button"
                        className={styles.cotizadorRemoveBtn}
                        aria-label="Eliminar examen"
                        onClick={() => handleRemove(exam.codigo)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className={styles.cotizadorDescriptionRow}>
                      <span
                        className={styles.cotizadorDescription}
                        tabIndex={0}
                        role="button"
                        onClick={() => setModalExam(exam)}
                        onKeyPress={e => { if (e.key === 'Enter') setModalExam(exam); }}
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
        {/* Modal for exam indication */}
        {modalExam && (
          <div className={styles.dialog} onClick={() => setModalExam(null)}>
            <div className={styles.dialogBody} onClick={e => e.stopPropagation()}>
              <div className={styles.text}>
                <div className={styles.textHeading}>{modalExam.nombre_examen || modalExam.nombre}</div>
                <div className={styles.bodyText}>
                  {(modalExam.indicacion && modalExam.indicacion.trim())
                    ? modalExam.indicacion
                    : (modalExam.informacion && modalExam.informacion.trim()
                        ? modalExam.informacion
                        : 'No hay información de indicación disponible.')}
                </div>
              </div>
              <div className={styles.buttonGroup}>
                <div className={styles.button} onClick={() => setModalExam(null)}>
                  <div className={styles.button2}>Entendido</div>
                </div>
              </div>
              <div className={styles.iconButton} onClick={() => setModalExam(null)}>
                ✕
              </div>
            </div>
          </div>
        )}
      </SiteFrame>
    );
  }

  // --- STEP 3: Confirmación final ---
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
          <div className={styles.cotizadorButton3}>
            <Button
              variant="primary"
              size="medium"
              fullWidth={false}
              onClick={() => {
                setStep(1);
                setSelected([]);
                setForm({ nombre: '', apellido: '', cedula: '', telefono: '', fecha_nacimiento: '', sexo: 'masculino', email: '', acepta: false });
                setCaptchaValido(false);
                setQuoteId(null);
              }}
            >
              <span className={styles.cotizadorButton4}>Hacer otra cotización</span>
            </Button>
          </div>
        </div>
        {quoteId && (
          <div className={styles.cotizadorSubtitle2} style={{marginTop: 24}}>
            <span>Número de cotización: </span>
            <strong>{quoteId}</strong>
          </div>
        )}
      </div>
    </SiteFrame>
  );
}
