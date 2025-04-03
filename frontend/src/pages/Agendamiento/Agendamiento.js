import React, { useState } from 'react';
import Paso1TipoAtencion from './Paso1TipoAtencion';
import Paso2DatosPaciente from './Paso2DatosPaciente';
import Paso3SeleccionAtencion from './Paso3SeleccionAtencion';
import Paso4HoraDisponible from './Paso4HoraDisponible';
import Paso5ResumenConfirmacion from './Paso5ResumenConfirmacion';
import './Agendamiento.css';

const Agendamiento = () => {
  const [step, setStep] = useState(1);

  const [tipoAtencion, setTipoAtencion] = useState('');
  const [datosPaciente, setDatosPaciente] = useState({
    nombre: '', rut: '', correo: '', telefono: ''
  });
  const [seleccion, setSeleccion] = useState({
    tipoAtencion: '', idEspecialidad: '', idMedico: ''
  });
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="agendamiento-flujo">
      {step === 1 && (
        <Paso1TipoAtencion
          tipoAtencion={tipoAtencion}
          setTipoAtencion={(v) => {
            setTipoAtencion(v);
            setSeleccion((prev) => ({ ...prev, tipoAtencion: v }));
          }}
          onNext={nextStep}
        />
      )}
      {step === 2 && (
        <Paso2DatosPaciente
          datosPaciente={datosPaciente}
          setDatosPaciente={setDatosPaciente}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}
      {step === 3 && (
        <Paso3SeleccionAtencion
          seleccion={seleccion}
          setSeleccion={setSeleccion}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}
      {step === 4 && (
        <Paso4HoraDisponible
          seleccion={seleccion}
          fechaSeleccionada={fechaSeleccionada}
          setFechaSeleccionada={setFechaSeleccionada}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}
      {step === 5 && (
        <Paso5ResumenConfirmacion
          datosPaciente={datosPaciente}
          seleccion={seleccion}
          fechaSeleccionada={fechaSeleccionada}
          onPrev={prevStep}
        />
      )}
    </div>
  );
};

export default Agendamiento;
