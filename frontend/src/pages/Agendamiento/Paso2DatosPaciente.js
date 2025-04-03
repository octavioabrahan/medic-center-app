import React, { useState } from 'react';
import './Paso2DatosPaciente.css';

const Paso2DatosPaciente = ({ onNext, onPrev, datosPaciente, setDatosPaciente }) => {
  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosPaciente((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validar = () => {
    let nuevosErrores = {};
    if (!datosPaciente.nombre) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!datosPaciente.rut) nuevosErrores.rut = 'El RUT es obligatorio';
    if (!datosPaciente.correo) nuevosErrores.correo = 'El correo es obligatorio';
    if (!datosPaciente.telefono) nuevosErrores.telefono = 'El teléfono es obligatorio';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleNext = () => {
    if (validar()) {
      onNext();
    }
  };

  return (
    <div className="paso paso2">
      <h2>Datos del Paciente</h2>

      <label>Nombre Completo</label>
      <input
        type="text"
        name="nombre"
        value={datosPaciente.nombre}
        onChange={handleChange}
      />
      {errores.nombre && <p className="error">{errores.nombre}</p>}

      <label>RUT</label>
      <input
        type="text"
        name="rut"
        value={datosPaciente.rut}
        onChange={handleChange}
      />
      {errores.rut && <p className="error">{errores.rut}</p>}

      <label>Correo Electrónico</label>
      <input
        type="email"
        name="correo"
        value={datosPaciente.correo}
        onChange={handleChange}
      />
      {errores.correo && <p className="error">{errores.correo}</p>}

      <label>Teléfono</label>
      <input
        type="tel"
        name="telefono"
        value={datosPaciente.telefono}
        onChange={handleChange}
      />
      {errores.telefono && <p className="error">{errores.telefono}</p>}

      <div className="acciones">
        <button onClick={onPrev}>Volver</button>
        <button onClick={handleNext}>Continuar</button>
      </div>
    </div>
  );
};

export default Paso2DatosPaciente;
