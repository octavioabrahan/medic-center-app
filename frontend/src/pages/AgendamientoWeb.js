import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import './AgendamientoWeb.css';

const API = `${process.env.REACT_APP_API_URL}/api`;

const AgendamientoWeb = () => {
  const isDesktop = useMediaQuery({ minWidth: 1224 });

  const [step, setStep] = useState(1);
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);

  const [formData, setFormData] = useState({
    tipoAtencion: '',
    tipo_atencion: 'consulta',
    noTieneCedula: false,
    rut: '',
    nombre: '',
    apellido: '',
    fecha_nac: '',
    sexo: '',
    telefono: '',
    email: '',
    tiene_seguro: '',
    nombre_representante: '',
    apellido_representante: '',
    numero_hijo: '',
    sexo_representante: '',
    id_especialidad: '',
    id_medico: '',
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
  });

  useEffect(() => {
    fetch(`${API}/especialidades`)
      .then(res => res.json())
      .then(data => setEspecialidades(data));

    fetch(`${API}/medicos`)
      .then(res => res.json())
      .then(data => setMedicos(data));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  return (
    <div className={isDesktop ? 'agendamiento-container desktop' : 'agendamiento-container mobile'}>
      {/* PASO 1 */}
      {step === 1 && (
        <div className="step-wrapper">
          <p className="volver">&larr; Volver a la página principal</p>
          <h2>¿Cómo se pagará la cita?</h2>
          <p className="subtitulo">
            Selecciona la opción que corresponde al tipo de atención de la persona que se va a atender.
          </p>

          <div className="opciones-container">
            <div
              className={`opcion-card ${formData.tipoAtencion === 'particular' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, tipoAtencion: 'particular' })}
            >
              <strong>Atención particular</strong>
              <p>La persona pagará la consulta directamente, con o sin seguro médico.</p>
            </div>

            <div
              className={`opcion-card ${formData.tipoAtencion === 'convenio' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, tipoAtencion: 'convenio' })}
            >
              <strong>Atención por convenio</strong>
              <p>La persona trabaja en una empresa o institución que tiene convenio con el centro médico.</p>
            </div>
          </div>

          <div className="acciones">
            <button onClick={() => formData.tipoAtencion ? handleNextStep() : alert('Selecciona un tipo de atención')}>
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* PASO 2 */}
      {step === 2 && (
        <div className="step-wrapper">
          <p className="volver" onClick={handlePrevStep}>&larr; Volver al paso anterior</p>
          <h2>Completa los datos del paciente que asistirá a la cita</h2>

          <label>Cédula</label>
          <input type="text" name="rut" value={formData.rut} onChange={handleChange} disabled={formData.noTieneCedula} />

          <div className="checkbox-line">
            <input
              type="checkbox"
              id="noTieneCedula"
              name="noTieneCedula"
              checked={formData.noTieneCedula}
              onChange={handleChange}
            />
            <label htmlFor="noTieneCedula">
              La persona que se atenderá no tiene cédula.
              <span className="hint">Deberás ingresar la cédula del representante legal.</span>
            </label>
          </div>

          {!formData.noTieneCedula ? (
            <>
              <label>Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} />

              <label>Apellidos</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} />

              <label>Fecha de nacimiento</label>
              <input type="date" name="fecha_nac" value={formData.fecha_nac} onChange={handleChange} />

              <div className="radio-group">
                <span>Sexo</span>
                <label><input type="radio" name="sexo" value="femenino" checked={formData.sexo === 'femenino'} onChange={handleChange} /> Femenino</label>
                <label><input type="radio" name="sexo" value="masculino" checked={formData.sexo === 'masculino'} onChange={handleChange} /> Masculino</label>
              </div>

              <label>Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />

              <label>Correo electrónico</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </>
          ) : (
            <>
              <h4>Datos del representante legal</h4>
              <label>Nombre</label>
              <input type="text" name="nombre_representante" value={formData.nombre_representante} onChange={handleChange} />
              <label>Apellidos</label>
              <input type="text" name="apellido_representante" value={formData.apellido_representante} onChange={handleChange} />
              <label>¿Qué número de hijo(a) es este menor?</label>
              <input type="text" name="numero_hijo" value={formData.numero_hijo} onChange={handleChange} />

              <div className="radio-group">
                <span>Sexo del representante</span>
                <label><input type="radio" name="sexo_representante" value="femenino" checked={formData.sexo_representante === 'femenino'} onChange={handleChange} /> Femenino</label>
                <label><input type="radio" name="sexo_representante" value="masculino" checked={formData.sexo_representante === 'masculino'} onChange={handleChange} /> Masculino</label>
              </div>

              <label>Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
              <label>Correo electrónico</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />

              <h4>Datos del paciente</h4>
              <label>Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} />
              <label>Apellidos</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} />
              <label>Fecha de nacimiento</label>
              <input type="date" name="fecha_nac" value={formData.fecha_nac} onChange={handleChange} />

              <div className="radio-group">
                <span>Sexo del paciente</span>
                <label><input type="radio" name="sexo" value="femenino" checked={formData.sexo === 'femenino'} onChange={handleChange} /> Femenino</label>
                <label><input type="radio" name="sexo" value="masculino" checked={formData.sexo === 'masculino'} onChange={handleChange} /> Masculino</label>
              </div>
            </>
          )}

          <div className="radio-group">
            <span>¿La persona tiene seguro médico?</span>
            <label><input type="radio" name="tiene_seguro" value="si" checked={formData.tiene_seguro === 'si'} onChange={handleChange} /> Sí</label>
            <label><input type="radio" name="tiene_seguro" value="no" checked={formData.tiene_seguro === 'no'} onChange={handleChange} /> No</label>
          </div>

          <div className="acciones">
            <button type="button" onClick={handleNextStep}>Continuar</button>
          </div>
        </div>
      )}

      {/* PASO 3 */}
      {step === 3 && (
        <div className="step-wrapper">
          <p className="volver" onClick={handlePrevStep}>&larr; Volver al paso anterior</p>
          <h2>Selecciona la especialidad, el médico y el día.</h2>

          <div className="radio-group">
            <span>Selecciona el tipo de atención</span>
            <label><input type="radio" name="tipo_atencion" value="consulta" checked={formData.tipo_atencion === 'consulta'} onChange={handleChange} /> Consulta médica</label>
            <label><input type="radio" name="tipo_atencion" value="estudio" checked={formData.tipo_atencion === 'estudio'} onChange={handleChange} /> Estudio</label>
          </div>

          <label>Especialidad</label>
          <select name="id_especialidad" value={formData.id_especialidad} onChange={handleChange}>
            <option value="">Selecciona una opción</option>
            {especialidades.map(esp => (
              <option key={esp.id_especialidad} value={esp.id_especialidad}>{esp.nombre}</option>
            ))}
          </select>

          <label>Profesional</label>
          <select name="id_medico" value={formData.id_medico} onChange={handleChange} disabled={!formData.id_especialidad}>
            <option value="">Selecciona al profesional</option>
            {medicos
              .filter(m => m.id_especialidad.toString() === formData.id_especialidad)
              .map(med => (
                <option key={med.id_medico} value={med.id_medico}>{med.nombre}</option>
              ))}
          </select>

          <h4>Selecciona el día de atención</h4>
          <div className="calendar-selectors">
            <select name="mes" value={formData.mes} onChange={handleChange}>
              {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, idx) => (
                <option key={idx} value={idx + 1}>{m}</option>
              ))}
            </select>
            <select name="anio" value={formData.anio} onChange={handleChange}>
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <p className="hint">
            📅 Debes seleccionar primero un tipo de atención <br />
            🕒 Horario sujeto al médico que selecciones
          </p>

          <div className="acciones">
            <button
              onClick={handleNextStep}
              disabled={
                !formData.id_especialidad || !formData.id_medico || !formData.tipo_atencion
              }
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendamientoWeb;
