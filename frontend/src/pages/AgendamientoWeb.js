import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import './AgendamientoWeb.css';

const AgendamientoWeb = () => {
  const isDesktop = useMediaQuery({ minWidth: 1224 });

  const [step, setStep] = useState(1);
  const [tipoAtencion, setTipoAtencion] = useState('');
  const [formData, setFormData] = useState({
    noTieneCedula: false,
    rut: '',
    nombre: '',
    apellido: '',
    fecha_nac: '',
    sexo: '',
    telefono: '',
    email: '',
    tiene_seguro: '',

    // Para menores sin cédula
    nombre_representante: '',
    apellido_representante: '',
    numero_hijo: '',
    sexo_representante: '',
  });

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
      {/* PASO 1: Selección de tipo de atención */}
      {step === 1 && (
        <div className="step-wrapper">
          <p className="volver">&larr; Volver a la página principal</p>
          <h2>¿Cómo se pagará la cita?</h2>
          <p className="subtitulo">
            Selecciona la opción que corresponde al tipo de atención de la persona que se va a atender.
          </p>

          <div className="opciones-container">
            <div
              className={`opcion-card ${tipoAtencion === 'particular' ? 'active' : ''}`}
              onClick={() => setTipoAtencion('particular')}
            >
              <strong>Atención particular</strong>
              <p>La persona pagará la consulta directamente, con o sin seguro médico.</p>
            </div>

            <div
              className={`opcion-card ${tipoAtencion === 'convenio' ? 'active' : ''}`}
              onClick={() => setTipoAtencion('convenio')}
            >
              <strong>Atención por convenio</strong>
              <p>La persona trabaja en una empresa o institución que tiene convenio con el centro médico.</p>
            </div>
          </div>

          <div className="acciones">
            <button onClick={() => tipoAtencion ? handleNextStep() : alert('Selecciona un tipo de atención')}>Continuar</button>
          </div>
        </div>
      )}

      {/* PASO 2: Datos del paciente */}
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
              checked={formData.noTieneCedula}
              onChange={handleChange}
              name="noTieneCedula"
            />
            <label htmlFor="noTieneCedula">
              La persona que se atenderá no tiene cédula.
              <span className="hint">Deberás ingresar la cédula del representante legal.</span>
            </label>
          </div>

          {!formData.noTieneCedula && (
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
          )}

          {formData.noTieneCedula && (
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
    </div>
  );
};

export default AgendamientoWeb;
