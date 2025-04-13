import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AgendamientoIndex = () => {
  const [opcion, setOpcion] = useState('');
  const navigate = useNavigate();

  const handleContinuar = () => {
    if (opcion === 'privado') navigate('/agendamiento/privado');
    else if (opcion === 'convenio') navigate('/agendamiento/convenio');
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <a href="/" style={{ display: 'block', marginBottom: '1rem' }}>← Volver a la página principal</a>

      <h2 style={{ color: '#1a3a8a' }}>¿Cómo se pagará la cita?</h2>
      <p style={{ maxWidth: 600, margin: '0 auto 2rem', color: '#444' }}>
        Selecciona la opción que corresponde al tipo de atención de la persona que se va a atender.
        Esto nos permitirá mostrar solo los pasos y documentos necesarios según cada caso.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
        <div
          onClick={() => setOpcion('privado')}
          style={{
            border: '1px solid #ccc',
            padding: '1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            maxWidth: 300,
            backgroundColor: opcion === 'privado' ? '#e5efff' : 'white',
            boxShadow: opcion === 'privado' ? '0 0 0 2px #1a3a8a' : 'none'
          }}
        >
          <strong>Atención particular</strong>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            La persona pagará la consulta directamente, con o sin seguro médico.
          </p>
        </div>

        <div
          onClick={() => setOpcion('empresa')}
          style={{
            border: '1px solid #ccc',
            padding: '1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            maxWidth: 300,
            backgroundColor: opcion === 'empresa' ? '#e5efff' : 'white',
            boxShadow: opcion === 'empresa' ? '0 0 0 2px #1a3a8a' : 'none'
          }}
        >
          <strong>Atención por convenio</strong>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            La persona trabaja en una empresa o institución que tiene convenio con el centro médico.
          </p>
        </div>
      </div>

      <button
        disabled={!opcion}
        onClick={handleContinuar}
        style={{
          background: '#1a3a8a',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1.5rem',
          fontSize: '1rem',
          borderRadius: '4px',
          cursor: opcion ? 'pointer' : 'not-allowed',
          opacity: opcion ? 1 : 0.5
        }}
      >
        Continuar
      </button>
    </div>
  );
};

export default AgendamientoIndex;
