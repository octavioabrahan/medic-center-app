import React from 'react';
import './Paso5ResumenConfirmacion.css';

const Paso5ResumenConfirmacion = ({ datosPaciente, seleccion, fechaSeleccionada, onPrev }) => {
  const handleSubmit = () => {
    alert('✅ Cita agendada (en backend lo implementaremos)');
  };

  return (
    <div className="paso paso5">
      <h2>Confirmación de la Cita</h2>

      <p><strong>Nombre:</strong> {datosPaciente.nombre}</p>
      <p><strong>RUT:</strong> {datosPaciente.rut}</p>
      <p><strong>Email:</strong> {datosPaciente.correo}</p>
      <p><strong>Teléfono:</strong> {datosPaciente.telefono}</p>
      <hr />
      <p><strong>Tipo de atención:</strong> {seleccion.tipoAtencion}</p>
      <p><strong>Especialidad ID:</strong> {seleccion.idEspecialidad}</p>
      <p><strong>Médico ID:</strong> {seleccion.idMedico}</p>
      <p><strong>Fecha:</strong> {new Date(fechaSeleccionada).toLocaleDateString()}</p>

      <div className="acciones">
        <button onClick={onPrev}>Volver</button>
        <button onClick={handleSubmit}>Confirmar Cita</button>
      </div>
    </div>
  );
};

export default Paso5ResumenConfirmacion;
