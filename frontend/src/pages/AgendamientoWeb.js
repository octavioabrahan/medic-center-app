import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AgendamientoWeb.css';

const API = `${process.env.REACT_APP_API_URL}/api`;

const AgendamientoWeb = () => {
  const isDesktop = useMediaQuery({ minWidth: 1224 });
  const [step, setStep] = useState(3); // <--- ponlo en 3 para testear el paso 3 directamente

  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]); // del backend
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  const [formData, setFormData] = useState({
    tipo_atencion: '',
    id_especialidad: '',
    id_medico: '',
  });

  useEffect(() => {
    fetch(`${API}/especialidades`)
      .then(res => res.json())
      .then(data => setEspecialidades(data));

    fetch(`${API}/medicos`)
      .then(res => res.json())
      .then(data => setMedicos(data));
  }, []);

  useEffect(() => {
    if (formData.id_medico) {
      fetch(`${API}/horarios/disponibles/${formData.id_medico}`)
        .then(res => res.json())
        .then(data => setFechasDisponibles(data)); // formato: ["2025-04-03", "2025-04-07", ...]
    }
  }, [formData.id_medico]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'id_medico') setFechaSeleccionada(null);
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const fecha = date.toISOString().split('T')[0];
      return !fechasDisponibles.includes(fecha);
    }
    return false;
  };

  return (
    <div className={isDesktop ? 'agendamiento-container desktop' : 'agendamiento-container mobile'}>
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
          <select
            name="id_especialidad"
            value={formData.id_especialidad}
            onChange={handleChange}
          >
            <option value="">Selecciona una opción</option>
            {especialidades.map(esp => (
              <option key={esp.id_especialidad} value={esp.id_especialidad}>{esp.nombre}</option>
            ))}
          </select>

          <label>Profesional</label>
          <select
            name="id_medico"
            value={formData.id_medico}
            onChange={handleChange}
            disabled={!formData.id_especialidad}
          >
            <option value="">Selecciona al profesional</option>
            {medicos
              .filter(m => m.id_especialidad.toString() === formData.id_especialidad)
              .map(med => (
                <option key={med.id_medico} value={med.id_medico}>{med.nombre}</option>
              ))}
          </select>

          <h4>Selecciona el día de atención</h4>
          {formData.id_medico ? (
            <Calendar
              onChange={setFechaSeleccionada}
              value={fechaSeleccionada}
              tileDisabled={tileDisabled}
            />
          ) : (
            <div className="info-box">
              <p>📅 Debes seleccionar primero un médico</p>
              <p>🕒 Horario sujeto al médico que selecciones</p>
            </div>
          )}

          <div className="acciones">
            <button
              onClick={handleNextStep}
              disabled={!formData.id_especialidad || !formData.id_medico || !fechaSeleccionada}
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
