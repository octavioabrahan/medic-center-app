import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgendamientoIndex.css';
import logo from '../../assets/logo_header.png';

const AgendamientoIndex = () => {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (opcionSeleccionada === 'privado') {
      navigate('/agendamiento/privado');
    } else if (opcionSeleccionada === 'convenio') {
      navigate('/agendamiento/convenio');
    }
  };

  return (
    <div className="agendamiento-container">
      <header className="agendamiento-header">
        <img
          src={logo}
          alt="Logo Diagnocentro"
          className="agendamiento-logo"
        />
      </header>

      <form className="agendamiento-form" onSubmit={handleSubmit}>
        <h1>¿Cómo se pagará la cita?</h1>
        <p>
          Selecciona la opción que corresponde al tipo de atención de la persona que se va a atender.
          Esto nos permitirá mostrar solo los pasos y documentos necesarios según cada caso.
        </p>

        <div className="opciones-seleccion">
          <label className={`opcion-box ${opcionSeleccionada === 'privado' ? 'seleccionada' : ''}`}>
            <input
              type="radio"
              name="tipo"
              value="privado"
              checked={opcionSeleccionada === 'privado'}
              onChange={() => setOpcionSeleccionada('privado')}
            />
            <strong>Atención particular</strong>
            <span>
              La persona pagará la consulta directamente, con o sin seguro médico.
            </span>
          </label>

          <label className={`opcion-box ${opcionSeleccionada === 'convenio' ? 'seleccionada' : ''}`}>
            <input
              type="radio"
              name="tipo"
              value="convenio"
              checked={opcionSeleccionada === 'convenio'}
              onChange={() => setOpcionSeleccionada('convenio')}
            />
            <strong>Atención por convenio</strong>
            <span>
              La persona trabaja en una empresa o institución que tiene convenio con el centro médico.
            </span>
          </label>
        </div>

        <button type="submit" disabled={!opcionSeleccionada}>
          Continuar
        </button>
      </form>
    </div>
  );
};

export default AgendamientoIndex;
