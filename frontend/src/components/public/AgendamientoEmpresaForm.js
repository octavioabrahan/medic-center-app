import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarioFechasDisponibles from './CalendarioFechasDisponibles';
import './AgendamientoEmpresaForm.css';
import logo from '../../assets/logo_header.png';
import { FaArrowLeft } from 'react-icons/fa';

const AgendamientoEmpresaForm = () => {
  const [step, setStep] = useState(1);
  const [sinCedula, setSinCedula] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');

  const [datosRepresentante, setDatosRepresentante] = useState({
    cedula: '', nombre: '', apellido: '', numeroHijo: '', telefono: '', email: ''
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
    axios.get('/api/empresas').then(res => {
      setEmpresas(res.data.filter(e => e.activa));
    });
  }, []);

  useEffect(() => {
    if (step === 2) {
      axios.get('/api/servicios').then(res => setServicios(res.data));
      axios.get('/api/profesionales').then(res => setProfesionales(res.data));
    }
  }, [step]);

  const profesionalesFiltrados = profesionales.filter(p =>
    modoSeleccion === 'consulta'
      ? p.categorias?.includes('Consulta')
      : modoSeleccion === 'estudio'
        ? p.categorias?.includes('Estudio')
        : false
  );

  const handleCheckCedula = () => {
    const nuevaCondicion = !sinCedula;
    setSinCedula(nuevaCondicion);
    setDatosPaciente(prev => ({ ...prev, telefono: '', email: '' }));
    setDatosRepresentante(prev => ({ ...prev, nombre: '', apellido: '', numeroHijo: '', telefono: '', email: '' }));
  };

  const fechaMostrada = () => {
    const f = fechaSeleccionada?.fecha ?? fechaSeleccionada;
    if (!f || isNaN(new Date(f).getTime())) return '';
    return new Date(f).toLocaleDateString();
  };

  const horaMostrada = () => {
    if (!fechaSeleccionada || !fechaSeleccionada.hora_inicio) return 'No disponible';
    return `Desde las ${fechaSeleccionada.hora_inicio.slice(0, 5)} hrs`;
  };

  const enviarAgendamiento = async () => {
    const representanteCedula = sinCedula ? `${datosRepresentante.cedula}-${datosRepresentante.numeroHijo}` : null;
    const payload = {
      cedula: datosRepresentante.cedula,
      paciente: {
        nombre: datosPaciente.nombre,
        apellido: datosPaciente.apellido,
        fecha_nacimiento: datosPaciente.fechaNacimiento,
        sexo: datosPaciente.sexo,
        telefono: sinCedula ? datosRepresentante.telefono : datosPaciente.telefono,
        email: sinCedula ? datosRepresentante.email : datosPaciente.email,
        seguro_medico: tieneSeguro,
        representante_cedula: representanteCedula,
        representante_nombre: sinCedula ? datosRepresentante.nombre : null,
        representante_apellido: sinCedula ? datosRepresentante.apellido : null,
        id_empresa: empresaSeleccionada
      },
      profesional_id: profesionalSeleccionado,
      fecha_agendada: fechaSeleccionada?.fecha || fechaSeleccionada,
      tipo_atencion: modoSeleccion,
      detalle: modoSeleccion === 'consulta' ? especialidadSeleccionada : servicioSeleccionado
    };

    try {
      await axios.post('/api/agendamiento', payload);
      setStep(4);
    } catch (err) {
      console.error('Error al crear agendamiento:', err);
      alert('Hubo un error al agendar. Intenta nuevamente.');
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-header">
        <img src={logo} alt="Logo Diagnocentro" className="form-logo" />
      </div>
      <div className="form-body">
        {step === 1 && (
          <form className="form-step" onSubmit={e => { e.preventDefault(); setStep(2); }}>
            <h2 className="form-title">Completa los datos del paciente que asistirá a la cita</h2>

            <label>Empresa con la que tiene convenio</label>
            <select required value={empresaSeleccionada} onChange={e => setEmpresaSeleccionada(e.target.value)}>
              <option value="">Selecciona una empresa</option>
              {empresas.map(e => (
                <option key={e.id_empresa} value={e.id_empresa}>{e.nombre_empresa}</option>
              ))}
            </select>

            <label>Cédula</label>
            <input
              type="text"
              value={datosRepresentante.cedula}
              onChange={e => setDatosRepresentante({ ...datosRepresentante, cedula: e.target.value })}
            />

            <label className="checkbox-line">
              <input type="checkbox" checked={sinCedula} onChange={handleCheckCedula} />
              La persona que se atenderá no tiene cédula
            </label>

            {sinCedula && (
              <div className="section">
                <h4>Datos del representante legal</h4>
                <input placeholder="Número de hijo(a)" value={datosRepresentante.numeroHijo} onChange={e => setDatosRepresentante({ ...datosRepresentante, numeroHijo: e.target.value })} />
                <input placeholder="Nombre" value={datosRepresentante.nombre} onChange={e => setDatosRepresentante({ ...datosRepresentante, nombre: e.target.value })} />
                <input placeholder="Apellidos" value={datosRepresentante.apellido} onChange={e => setDatosRepresentante({ ...datosRepresentante, apellido: e.target.value })} />
                <input placeholder="Teléfono" value={datosRepresentante.telefono} onChange={e => setDatosRepresentante({ ...datosRepresentante, telefono: e.target.value })} />
                <input placeholder="Correo electrónico" value={datosRepresentante.email} onChange={e => setDatosRepresentante({ ...datosRepresentante, email: e.target.value })} />
              </div>
            )}

            <div className="section">
              <h4>Datos del paciente</h4>
              <input placeholder="Nombre" value={datosPaciente.nombre} onChange={e => setDatosPaciente({ ...datosPaciente, nombre: e.target.value })} />
              <input placeholder="Apellidos" value={datosPaciente.apellido} onChange={e => setDatosPaciente({ ...datosPaciente, apellido: e.target.value })} />
              <input type="date" value={datosPaciente.fechaNacimiento} onChange={e => setDatosPaciente({ ...datosPaciente, fechaNacimiento: e.target.value })} />
              <select value={datosPaciente.sexo} onChange={e => setDatosPaciente({ ...datosPaciente, sexo: e.target.value })}>
                <option value="">Sexo</option>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
              </select>
              {!sinCedula && (
                <>
                  <input placeholder="Teléfono" value={datosPaciente.telefono} onChange={e => setDatosPaciente({ ...datosPaciente, telefono: e.target.value })} />
                  <input placeholder="Correo electrónico" value={datosPaciente.email} onChange={e => setDatosPaciente({ ...datosPaciente, email: e.target.value })} />
                </>
              )}
            </div>

            <label className="checkbox-line">
              <input type="checkbox" checked={tieneSeguro} onChange={() => setTieneSeguro(!tieneSeguro)} />
              ¿Tiene seguro médico?
            </label>

            {/* Aquí se integrará más adelante el campo subir archivo */}
            <div className="form-actions">
              <button type="submit" className="boton-principal">Continuar</button>
            </div>
          </form>
        )}

        {/* Paso 2 y siguientes seguirán aquí (puedo seguir escribiéndolos si me lo pides) */}
      </div>
    </div>
  );
};

export default AgendamientoEmpresaForm;
