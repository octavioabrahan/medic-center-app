import React, { useState, useEffect } from 'react';
import SiteFrame from '../../../components/SiteFrame/SiteFrame';
import SearchField from '../../../components/Inputs/SearchField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import InputField from '../../../components/Inputs/InputField';
import { Button } from '../../../components/Button/Button';
import ArrowLeft from '../../../assets/ArrowLeft.svg';
import { XMarkIcon } from '@heroicons/react/24/outline';
import styles from './Cotizaciones.module.css';

export default function Cotizaciones() {
  // --- LOGIC FROM CotizadorExamenes.js ---
  const [exams, setExams] = useState([]); // Catálogo de exámenes
  const [exchangeRate, setExchangeRate] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]); // [{codigo, nombre, ...}]
  const [form, setForm] = useState({ nombre: '', cedula: '', telefono: '', correo: '', acepta: false });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalExam, setModalExam] = useState(null);
  const [quoteId, setQuoteId] = useState(null);

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
        console.log('API examsData:', examsData);
        setExams(examsData);
        setExchangeRate(rateData.tasa);
      })
      .catch((err) => setError(err.message || 'No pudimos cargar los datos. Intenta más tarde.'))
      .finally(() => setLoading(false));
  }, []);

  // --- UI/UX LOGIC ---
  const filteredExams = exams.filter(exam => {
    if (!exam || typeof exam.nombre_examen !== 'string') return false;
    return exam.nombre_examen.toLowerCase().includes(search.toLowerCase()) &&
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

  // --- SUBMIT LOGIC ---
  const handleSubmit = async () => {
    // Validación básica
    if (!form.nombre.trim() || !form.cedula.trim() || !form.telefono.trim() || !form.correo.trim() || !form.acepta) {
      setError('Completa todos los campos y acepta los términos.');
      return;
    }
    if (selected.length === 0) {
      setError('Selecciona al menos un examen.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const dataToSend = {
        nombre: form.nombre.trim(),
        cedula: form.cedula.trim(),
        telefono: form.telefono.trim(),
        correo: form.correo.trim(),
        examenes: selected.map(e => ({ codigo: e.codigo, nombre: e.nombre, precio: Number(e.precio) })),
        tasaCambio: Number(exchangeRate)
      };
      const res = await fetch(`${apiUrl}/api/cotizaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      const response = await res.json();
      if (!res.ok) throw new Error(response.error || 'Error al enviar la cotización');
      setQuoteId(response.id);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al enviar la cotización');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 1: Selección de exámenes ---
  if (step === 1) {
    return (
      <SiteFrame>
        <div className={styles.cotizadorFrame4}>
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
                        label={exam.nombre_examen}
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
            <div className={styles.cotizadorButtonWrap}>
              <Button
                variant="primary"
                size="medium"
                disabled={selected.length === 0}
                fullWidth
                onClick={() => setStep(2)}
              >
                Continuar
              </Button>
            </div>
            {error && <div className={styles.cotizadorSubtitle2}>{error}</div>}
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
                <div className={styles.textHeading}>{modalExam.nombre_examen}</div>
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
                <XMarkIcon className={styles.x} width={20} height={20} />
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
          <div className={styles.cotizadorHeroForm}>
            <div className={styles.cotizadorButtonGroup}>
              <Button variant="subtle" size="small" onClick={() => setStep(1)}>
                <img src={ArrowLeft} alt="Volver" className={styles.cotizadorArrowLeft} />
                <span className={styles.cotizadorButton2}>Volver al listado</span>
              </Button>
            </div>
            <div className={styles.cotizadorTitle}>Para enviarte tu cotización, necesitamos algunos datos</div>
            <div className={styles.cotizadorSubtitle}>
              Usaremos esta información para contactarte y enviarte el detalle de tu cotización.
            </div>
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
              <InputField
                label="Correo electrónico"
                value={form.correo}
                placeholder="Correo para enviarte la cotización"
                onChange={v => handleFormChange('correo', v)}
                fillContainer
              />
            </div>
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
            <div className={styles.cotizadorButton3}>
              <Button
                variant="primary"
                size="medium"
                fullWidth
                onClick={handleSubmit}
                disabled={loading}
              >
                <span className={styles.cotizadorButton4}>Enviar cotización</span>
              </Button>
            </div>
            {error && <div className={styles.cotizadorSubtitle2}>{error}</div>}
          </div>
          <div className={styles.cotizadorHeroForm2}>
            <div className={styles.cotizadorTitle}>Resumen de los exámenes a cotizar</div>
            <div className={styles.cotizadorFrame3}>
              {selected.map(exam => (
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
                setForm({ nombre: '', cedula: '', telefono: '', correo: '', acepta: false });
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
