import React, { useState, useEffect } from 'react';
import './Paso3SeleccionAtencion.css';

const API = `${process.env.REACT_APP_API_URL}/api`;

const Paso3SeleccionAtencion = ({ onNext, onPrev, seleccion, setSeleccion }) => {
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    fetch(`${API}/especialidades`)
      .then((res) => res.json())
      .then((data) => setEspecialidades(data));

    fetch(`${API}/medicos`)
      .then((res) => res.json())
      .then((data) => setMedicos(data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSeleccion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validar = () => {
    let nuevosErrores = {};
    if (!seleccion.tipoAtencion) nuevosErrores.tipoAtencion = 'Selecciona un tipo de atención';
    if (!seleccion.idEspecialidad) nuevosErrores.idEspecialidad = 'Selecciona una especialidad';
    if (!seleccion.idMedico) nuevosErrores.idMedico = 'Selecciona un médico';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleNext = () => {
    if (validar()) {
      onNext();
    }
  };

  return (
    <div className="paso paso3">
      <h2>Selecciona la Especialidad y el Médico</h2>

      <label>Tipo de Atención</label>
      <select name="tipoAtencion" value={seleccion.tipoAtencion} onChange={handleChange}>
        <option value="">Selecciona una opción</option>
        <option value="consulta">Consulta Médica</option>
        <option value="estudio">Estudio</option>
      </select>
      {errores.tipoAtencion && <p className="error">{errores.tipoAtencion}</p>}

      <label>Especialidad</label>
      <select name="idEspecialidad" value={seleccion.idEspecialidad} onChange={handleChange}>
        <option value="">Selecciona una especialidad</option>
        {especialidades.map((esp) => (
          <option key={esp.id_especialidad} value={esp.id_especialidad}>
            {esp.nombre}
          </option>
        ))}
      </select>
      {errores.idEspecialidad && <p className="error">{errores.idEspecialidad}</p>}

      <label>Médico</label>
      <select name="idMedico" value={seleccion.idMedico} onChange={handleChange}>
        <option value="">Selecciona un médico</option>
        {medicos
          .filter((med) => med.id_especialidad.toString() === seleccion.idEspecialidad)
          .map((med) => (
            <option key={med.id_medico} value={med.id_medico}>
              {med.nombre}
            </option>
          ))}
      </select>
      {errores.idMedico && <p className="error">{errores.idMedico}</p>}

      <div className="acciones">
        <button onClick={onPrev}>Volver</button>
        <button onClick={handleNext}>Continuar</button>
      </div>
    </div>
  );
};

export default Paso3SeleccionAtencion;
