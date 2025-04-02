import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import './AgendamientoWeb.css';

const API = process.env.REACT_APP_API_URL;

const AgendamientoWeb = () => {
  const isDesktop = useMediaQuery({ minWidth: 1224 });

  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [citas, setCitas] = useState([]);

  const [formData, setFormData] = useState({
    id_especialidad: '',
    id_medico: '',
    fecha: '',
    hora: '',
    nombre: '',
    rut: '',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    fetch(`${API}/especialidades`)
      .then(res => res.json())
      .then(data => setEspecialidades(data));

    fetch(`${API}/medicos`)
      .then(res => res.json())
      .then(data => setMedicos(data));

    fetch(`${API}/citas`)
      .then(res => res.json())
      .then(data => setCitas(data));
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Paso 1: Registrar o buscar cliente
      const clienteRes = await fetch(`${API}/clientes/register-or-find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          rut: formData.rut,
          email: formData.email,
          telefono: formData.telefono
        })
      });

      const clienteData = await clienteRes.json();
      const id_cliente = clienteData.id_cliente;

      // Paso 2: Crear cita con id_cliente
      const citaBody = {
        id_cliente,
        id_medico: parseInt(formData.id_medico),
        fecha_hora: `${formData.fecha}T${formData.hora}:00`,
        estado: 'programada',
        notas: ''
      };

      const citaRes = await fetch(`${API}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(citaBody)
      });

      const citaData = await citaRes.json();
      alert('Cita agendada con éxito');
      setCitas(prev => [...prev, citaData]);

    } catch (err) {
      console.error(err);
      alert('Error al registrar cliente o agendar la cita');
    }
  };

  return (
    <div className={isDesktop ? 'agendamiento-container desktop' : 'agendamiento-container mobile'}>
      <h2>Agendar una Cita</h2>
      <form onSubmit={handleSubmit}>
        <h4>Datos del Paciente</h4>
        <input type="text" name="nombre" placeholder="Nombre completo" value={formData.nombre} onChange={handleChange} required />
        <input type="text" name="rut" placeholder="RUT o cédula" value={formData.rut} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} required />
        <input type="text" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />

        <h4>Datos de la Cita</h4>
        <label>Especialidad:</label>
        <select name="id_especialidad" value={formData.id_especialidad} onChange={handleChange} required>
          <option value="">Seleccione una especialidad</option>
          {especialidades.map((esp) => (
            <option key={esp.id_especialidad} value={esp.id_especialidad}>{esp.nombre}</option>
          ))}
        </select>

        <label>Médico:</label>
        <select name="id_medico" value={formData.id_medico} onChange={handleChange} required>
          <option value="">Seleccione un médico</option>
          {medicos
            .filter(m => m.id_especialidad.toString() === formData.id_especialidad)
            .map((med) => (
              <option key={med.id_medico} value={med.id_medico}>{med.nombre}</option>
            ))}
        </select>

        <label>Fecha:</label>
        <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />

        <label>Hora:</label>
        <input type="time" name="hora" value={formData.hora} onChange={handleChange} required />

        <button type="submit">Agendar Cita</button>
      </form>

      <h3>Citas Agendadas</h3>
      <ul>
        {citas.map((cita, index) => (
          <li key={index}>
            {new Date(cita.fecha_hora).toLocaleString()} - Médico ID {cita.id_medico}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AgendamientoWeb;
