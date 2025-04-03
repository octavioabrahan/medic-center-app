import React from 'react';
import './Paso1TipoAtencion.css';

const Paso1TipoAtencion = ({ onNext, tipoAtencion, setTipoAtencion }) => {
  const handleChange = (e) => {
    setTipoAtencion(e.target.value);
  };

  return (
    <div className="paso paso1">
      <h2>¿Cómo se pagará la cita?</h2>
      <p>Selecciona la opción que corresponde al tipo de atención. Esto nos permitirá mostrar los pasos necesarios.</p>

      <div className="opciones-atencion">
        <label className={`opcion ${tipoAtencion === 'particular' ? 'seleccionado' : ''}`}>
          <input
            type="radio"
            name="tipoAtencion"
            value="particular"
            checked={tipoAtencion === 'particular'}
            onChange={handleChange}
          />
          <strong>Atención particular</strong><br />
          La persona pagará directamente, con o sin seguro médico.
        </label>

        <label className={`opcion ${tipoAtencion === 'convenio' ? 'seleccionado' : ''}`}>
          <input
            type="radio"
            name="tipoAtencion"
            value="convenio"
            checked={tipoAtencion === 'convenio'}
            onChange={handleChange}
          />
          <strong>Atención por convenio</strong><br />
          La persona pertenece a una institución que tiene convenio con el centro médico.
        </label>
      </div>

      <div className="acciones">
        <button onClick={onNext} disabled={!tipoAtencion}>Continuar</button>
      </div>
    </div>
  );
};

export default Paso1TipoAtencion;
