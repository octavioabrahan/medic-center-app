import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import './AgendamientoWeb.css';

const AgendamientoWeb = () => {
  const isDesktop = useMediaQuery({ minWidth: 1224 });
  const [especialidades, setEspecialidades] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [citas, setCitas] = useState([]);
  const [formData, setFormData] = useState({
    especialidad: '',
    doctor: '',
    fecha: '',
    hora: ''
  });

  useEffect(() => {
    // Cargar especialidades desde el backend
    fetch('/api/especialidades')
      .then(response => response.json())
      .then(data => setEspecialidades(data));

    // Cargar doctores desde el backend
    fetch('/api/doctores')
      .then(response => response.json())
      .then(data => setDoctores(data));

    // Cargar citas existentes desde el backend
    fetch('/api/citas')
      .then(response => response.json())
      .then(data => setCitas(data));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Enviar la nueva cita al backend
    fetch('/api/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      alert('Cita agendada con éxito');
      setCitas([...citas, data]);
    })
    .catch(error => alert('Error al agendar la cita'));
  };

  return (
    <div className={isDesktop ? 'agendamiento-container desktop' : 'agendamiento-container mobile'}>
      <h2>Agendar una Cita</h2>
      <form onSubmit={handleSubmit}>
        <label>Especialidad:</label>
        <select name="especialidad" value={formData.especialidad} onChange={handleChange} required>
          <option value="">Seleccione una especialidad</option>
          {especialidades.map((esp) => (
            <option key={esp.id} value={esp.nombre}>{esp.nombre}</option>
          ))}
        </select>

        <label>Doctor:</label>
        <select name="doctor" value={formData.doctor} onChange={handleChange} required>
          <option value="">Seleccione un doctor</option>
          {doctores
            .filter(doc => doc.especialidad === formData.especialidad)
            .map((doc) => (
              <option key={doc.id} value={doc.nombre}>{doc.nombre}</option>
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
          <li key={index}>{`${cita.fecha} ${cita.hora} - ${cita.doctor} (${cita.especialidad})`}</li>
        ))}
      </ul>
    </div>
  );
};

export default AgendamientoWeb;
