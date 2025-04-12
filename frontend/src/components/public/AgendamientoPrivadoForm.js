import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarioFechasDisponibles from './CalendarioFechasDisponibles';

const AgendamientoPrivadoForm = () => {
  const [step, setStep] = useState(1);

  const [sinCedula, setSinCedula] = useState(false);
  const [datosRepresentante, setDatosRepresentante] = useState({
    cedula: '', nombre: '', apellido: '', numeroHijo: '', sexo: '', telefono: '', email: ''
  });
  const [datosPaciente, setDatosPaciente] = useState({
    nombre: '', apellido: '', fechaNacimiento: '', sexo: '', telefono: '', email: ''
  });
  const [tieneSeguro, setTieneSeguro] = useState(false);

  const [modoSeleccion, setModoSeleccion] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);

  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  useEffect(() => {
    if (step === 2) {
      axios.get('/api/servicios').then(res => setServicios(res.data)).catch(console.error);
      axios.get('/api/profesionales').then(res => setProfesionales(res.data)).catch(console.error);
    }
  }, [step]);

  const handleSubmitPaso1 = (e) => { e.preventDefault(); setStep(2); };

  const handleSeleccionTipo = (tipo) => {
    setModoSeleccion(tipo);
    setEspecialidadSeleccionada('');
    setServicioSeleccionado('');
    setProfesionalSeleccionado('');
    setFechaSeleccionada(null);
  };

  const volverPaso1 = () => { setStep(1); setModoSeleccion(null); setProfesionalSeleccionado(''); };
  const volverPaso2 = () => { setStep(2); };
  const continuarPaso3 = () => { setStep(3); };

  const profesionalesFiltrados = profesionales.filter(p =>
    modoSeleccion === 'consulta' ? p.categorias?.includes('Consulta') :
    modoSeleccion === 'estudio' ? p.categorias?.includes('Estudio') : false
  );

  const fechaMostrada = () => {
    const f = fechaSeleccionada?.fecha ?? fechaSeleccionada;
    if (!f || isNaN(new Date(f).getTime())) return '';
    return new Date(f).toLocaleDateString();
  };

  const horaMostrada = () => {
    if (!fechaSeleccionada || !fechaSeleccionada.hora_inicio) return 'No disponible';
    return `Desde las ${fechaSeleccionada.hora_inicio.slice(0, 5)} hrs`;
  };

  const handleCheckCedula = () => {
    setSinCedula(!sinCedula);
    if (!sinCedula) {
      setDatosRepresentante(prev => ({ ...prev, nombre: '', apellido: '', numeroHijo: '', sexo: '', telefono: '', email: '' }));
      setDatosPaciente(prev => ({ ...prev, telefono: '', email: '' }));
    }
  };

  return (
    <div>
      {step === 1 && (
        <form onSubmit={handleSubmitPaso1}>
          <h2>Agendamiento Particular</h2>
          <div>
            <label>Cédula:</label>
            <input type="text" value={datosRepresentante.cedula} onChange={e => setDatosRepresentante({ ...datosRepresentante, cedula: e.target.value })} />
            <label>
              <input type="checkbox" checked={sinCedula} onChange={handleCheckCedula} /> La persona que se atenderá no tiene cédula
            </label>
          </div>

          {sinCedula && (
            <fieldset>
              <legend>Datos del representante legal</legend>
              <input placeholder="¿Qué número de hijo(a) es este menor?" value={datosRepresentante.numeroHijo} onChange={e => setDatosRepresentante({ ...datosRepresentante, numeroHijo: e.target.value })} />
              <input placeholder="Nombre" value={datosRepresentante.nombre} onChange={e => setDatosRepresentante({ ...datosRepresentante, nombre: e.target.value })} />
              <input placeholder="Apellidos" value={datosRepresentante.apellido} onChange={e => setDatosRepresentante({ ...datosRepresentante, apellido: e.target.value })} />
              <select value={datosRepresentante.sexo} onChange={e => setDatosRepresentante({ ...datosRepresentante, sexo: e.target.value })}>
                <option value="">Sexo</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
              </select>
              <input placeholder="Teléfono" value={datosRepresentante.telefono} onChange={e => setDatosRepresentante({ ...datosRepresentante, telefono: e.target.value })} />
              <input placeholder="Correo electrónico" value={datosRepresentante.email} onChange={e => setDatosRepresentante({ ...datosRepresentante, email: e.target.value })} />
            </fieldset>
          )}

          <fieldset>
            <legend>Datos del paciente</legend>
            <input placeholder="Nombre" value={datosPaciente.nombre} onChange={e => setDatosPaciente({ ...datosPaciente, nombre: e.target.value })} />
            <input placeholder="Apellidos" value={datosPaciente.apellido} onChange={e => setDatosPaciente({ ...datosPaciente, apellido: e.target.value })} />
            <input type="date" value={datosPaciente.fechaNacimiento} onChange={e => setDatosPaciente({ ...datosPaciente, fechaNacimiento: e.target.value })} />
            <select value={datosPaciente.sexo} onChange={e => setDatosPaciente({ ...datosPaciente, sexo: e.target.value })}>
              <option value="">Sexo</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </select>
            {!sinCedula && (
              <>
                <input placeholder="Teléfono" value={datosPaciente.telefono} onChange={e => setDatosPaciente({ ...datosPaciente, telefono: e.target.value })} />
                <input placeholder="Correo electrónico" value={datosPaciente.email} onChange={e => setDatosPaciente({ ...datosPaciente, email: e.target.value })} />
              </>
            )}
          </fieldset>

          <div>
            <label>
              ¿Tiene seguro médico?
              <input type="checkbox" checked={tieneSeguro} onChange={() => setTieneSeguro(!tieneSeguro)} />
            </label>
          </div>

          <button type="submit">Continuar</button>
        </form>
      )}

      {/* Step 2 y 3 permanecen sin cambios */}

    </div>
  );
};

export default AgendamientoPrivadoForm;
