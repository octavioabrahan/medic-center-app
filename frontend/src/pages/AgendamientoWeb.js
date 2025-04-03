import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import './AgendamientoWeb.css';

const AgendamientoWeb = () => {
  const isDesktop = useMediaQuery({ minWidth: 1224 });

  const [tipoAtencion, setTipoAtencion] = useState('');
  const [step, setStep] = useState(1);

  const handleSelect = (tipo) => {
    setTipoAtencion(tipo);
  };

  const continuar = () => {
    if (!tipoAtencion) {
      alert('Por favor seleccione un tipo de atención');
      return;
    }
    setStep(2); // continuar al siguiente paso (que después agregamos)
  };

  return (
    <div className={isDesktop ? 'agendamiento-container desktop' : 'agendamiento-container mobile'}>
      {step === 1 && (
        <div className="step-wrapper">
          <p className="volver">&larr; Volver a la página principal</p>
          <h2>¿Cómo se pagará la cita?</h2>
          <p className="subtitulo">
            Selecciona la opción que corresponde al tipo de atención de la persona que se va a atender. Esto nos
            permitirá mostrar solo los pasos y documentos necesarios según cada caso.
          </p>

          <div className="opciones-container">
            <div
              className={`opcion-card ${tipoAtencion === 'particular' ? 'active' : ''}`}
              onClick={() => handleSelect('particular')}
            >
              <strong>Atención particular</strong>
              <p>La persona pagará la consulta directamente, con o sin seguro médico.</p>
            </div>

            <div
              className={`opcion-card ${tipoAtencion === 'convenio' ? 'active' : ''}`}
              onClick={() => handleSelect('convenio')}
            >
              <strong>Atención por convenio</strong>
              <p>La persona trabaja en una empresa o institución que tiene convenio con el centro médico.</p>
            </div>
          </div>

          <div className="acciones">
            <button onClick={continuar}>Continuar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendamientoWeb;
