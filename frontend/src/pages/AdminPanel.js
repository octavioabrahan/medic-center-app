// pages/AdminPanel.js
import React, { useEffect, useState } from 'react';
import './AdminPanel.css';

const API = process.env.REACT_APP_API_URL;

const AdminPanel = () => {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [nuevoMedico, setNuevoMedico] = useState({ nombre: '', id_especialidad: '', telefono: '', correo_electronico: '' });
  const [nuevoHorario, setNuevoHorario] = useState({ id_medico: '', semana_inicio: '', dia_semana: '', modalidad: '', hora_inicio: '', hora_fin: '', consultorio: '' });

  const fetchMedicos = async () => {
    const res = await fetch(`${API}/medicos`);
    const data = await res.json();
    setMedicos(data);
  };

  const fetchEspecialidades = async () => {
    const res = await fetch(`${API}/especialidades`);
    const data = await res.json();
    setEspecialidades(data);
  };

  const crearMedico = async () => {
    await fetch(`${API}/medicos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoMedico),
    });
    fetchMedicos();
  };

  const crearHorario = async () => {
    await fetch(`${API}/horarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoHorario),
    });
    alert('Horario creado');
  };

  useEffect(() => {
    fetchMedicos();
    fetchEspecialidades();
  }, []);

  return (
    <div className="admin-panel">
      <h2>Panel de Administración</h2>

      <section>
        <h3>Crear Médico</h3>
        <input placeholder="Nombre" onChange={(e) => setNuevoMedico({ ...nuevoMedico, nombre: e.target.value })} />
        <select onChange={(e) => setNuevoMedico({ ...nuevoMedico, id_especialidad: e.target.value })}>
          <option value="">Seleccionar especialidad</option>
          {especialidades.map((e) => (
            <option key={e.id_especialidad} value={e.id_especialidad}>{e.nombre}</option>
          ))}
        </select>
        <input placeholder="Teléfono" onChange={(e) => setNuevoMedico({ ...nuevoMedico, telefono: e.target.value })} />
        <input placeholder="Correo" onChange={(e) => setNuevoMedico({ ...nuevoMedico, correo_electronico: e.target.value })} />
        <button onClick={crearMedico}>Guardar Médico</button>
      </section>

      <section>
        <h3>Crear Horario Semanal</h3>
        <select onChange={(e) => setNuevoHorario({ ...nuevoHorario, id_medico: e.target.value })}>
          <option value="">Seleccionar Médico</option>
          {medicos.map((m) => (
            <option key={m.id_medico} value={m.id_medico}>{m.nombre}</option>
          ))}
        </select>
        <input type="date" onChange={(e) => setNuevoHorario({ ...nuevoHorario, semana_inicio: e.target.value })} />
        <input placeholder="Día (ej: lunes)" onChange={(e) => setNuevoHorario({ ...nuevoHorario, dia_semana: e.target.value })} />
        <select onChange={(e) => setNuevoHorario({ ...nuevoHorario, modalidad: e.target.value })}>
          <option value="">Modalidad</option>
          <option value="presencial">Presencial</option>
          <option value="previa_cita">Previa Cita</option>
        </select>
        <input type="time" onChange={(e) => setNuevoHorario({ ...nuevoHorario, hora_inicio: e.target.value })} />
        <input type="time" onChange={(e) => setNuevoHorario({ ...nuevoHorario, hora_fin: e.target.value })} />
        <input placeholder="Consultorio" onChange={(e) => setNuevoHorario({ ...nuevoHorario, consultorio: e.target.value })} />
        <button onClick={crearHorario}>Guardar Horario</button>
      </section>

      <section>
        <h3>Médicos Registrados</h3>
        <ul>
          {medicos.map((m) => (
            <li key={m.id_medico}>{m.nombre} (Esp. ID {m.id_especialidad})</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminPanel;
