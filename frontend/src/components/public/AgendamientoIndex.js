import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgendamientoIndex.css';
import logo from '../../assets/logo_header.png';

const AgendamientoIndex = () => {
  const [seleccion, setSeleccion] = useState('');
  const navigate = useNavigate();

  const continuar = () => {
    if (seleccion === 'privado') navigate('/agendamiento/privado');
    else if (seleccion === 'convenio') navigate('/agendamiento/convenio');
  };

  return (
    <div className="agendamiento-container">
      <div className="agendamiento-header">
        <img src={logo} alt="DIAGNOCENTRO" className="agendamiento-logo" />
      </div>

      <div className="agendamiento-content">
        <a href="/" className="volver-link">
          <span className="volver-icon">←</span> Volver a la página principal
        </a>

        <h2 className="agendamiento-title">¿Cómo se pagará la cita?</h2>
        <p className="agendamiento-subtitle">
          Selecciona la opción que corresponde al tipo de atención de la persona que se va a atender. 
          Esto nos permitirá mostrar solo los pasos y documentos necesarios según cada caso.
        </p>

        <div className="agendamiento-opciones">
          <label className={`opcion-tarjeta ${seleccion === 'privado' ? 'seleccionada' : ''}`}>
            <div className="radio-container">
              <input
                type="radio"
                name="tipo-atencion"
                value="privado"
                checked={seleccion === 'privado'}
                onChange={() => setSeleccion('privado')}
              />
            </div>
            <div className="opcion-contenido">
              <h3>Atención particular</h3>
              <p>La persona pagará la consulta directamente, con o sin seguro médico.</p>
            </div>
          </label>

          <label className={`opcion-tarjeta ${seleccion === 'convenio' ? 'seleccionada' : ''}`}>
            <div className="radio-container">
              <input
                type="radio"
                name="tipo-atencion"
                value="convenio"
                checked={seleccion === 'convenio'}
                onChange={() => setSeleccion('convenio')}
              />
            </div>
            <div className="opcion-contenido">
              <h3>Atención por convenio</h3>
              <p>La persona trabaja en una empresa o institución que tiene convenio con el centro médico.</p>
            </div>
          </label>
        </div>

        <button 
          className="continuar-btn" 
          onClick={continuar} 
          disabled={!seleccion}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default AgendamientoIndex;