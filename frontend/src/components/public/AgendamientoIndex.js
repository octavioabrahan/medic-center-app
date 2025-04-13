import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgendamientoIndex.css';
import logo from '../../assets/logo_header.png';

const AgendamientoIndex = () => {
  const [seleccion, setSeleccion] = useState('');
  const navigate = useNavigate();

  const continuar = () => {
    if (seleccion === 'privado') navigate('/agendamiento/privado');
    else if (seleccion === 'convenio') navigate('/agendamiento/empresa');
  };

  return (
    <div className="agendamiento-container">
      <div className="agendamiento-header">
        <a href="/">← Volver a la página principal</a>
        <img
          src={logo}
          alt="Logo Diagnocentro"
          className="agendamiento-logo"
        />
      </div>

      <div className="agendamiento-content">
        <h2>¿Cómo se pagará la cita?</h2>
        <p className="agendamiento-subtitle">
          Selecciona la opción que corresponde al tipo de atención de la persona que se va a atender.
          Esto nos permitirá mostrar solo los pasos y documentos necesarios según cada caso.
        </p>

        <div className="agendamiento-opciones">
          <label className={`opcion ${seleccion === 'privado' ? 'seleccionado' : ''}`}>
            <input
              type="radio"
              value="privado"
              checked={seleccion === 'privado'}
              onChange={() => setSeleccion('privado')}
            />
            <div>
              <strong>Atención particular</strong>
              <p>La persona pagará la consulta directamente, con o sin seguro médico.</p>
            </div>
          </label>

          <label className={`opcion ${seleccion === 'convenio' ? 'seleccionado' : ''}`}>
            <input
              type="radio"
              value="convenio"
              checked={seleccion === 'convenio'}
              onChange={() => setSeleccion('convenio')}
            />
            <div>
              <strong>Atención por convenio</strong>
              <p>La persona trabaja en una empresa o institución que tiene convenio con el centro médico.</p>
            </div>
          </label>
        </div>

        <button className="boton-continuar" onClick={continuar} disabled={!seleccion}>
          Continuar
        </button>
      </div>
    </div>
  );
};

export default AgendamientoIndex;
