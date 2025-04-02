import React, { useEffect, useState } from 'react';
import './AdminPanel.css';

const API = `${process.env.REACT_APP_API_URL}/api`;

const AdminPanel = () => {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);

  const [nuevoMedico, setNuevoMedico] = useState({
    nombre: '',
    id_especialidad: '',
    telefono: '',
    correo_electronico: ''
  });

  const [nuevoHorario, setNuevoHorario] = useState({
    id_medico: '',
    semana_inicio: '',
    dia_semana: '',
    modalidad: '',
    hora_inicio: '',
    hora_fin: '',
    consultorio: ''
  });

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
    setNuevoMedico({ nombre: '', id_especialidad: '', telefono: '', correo_electronico: '' });
    fetchMedicos();
  };

  const crearHorario = async () => {
    await fetch(`${API}/horarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoHorario),
    });
    alert('Horario creado');
    setNuevoHorario({ id_medico: '', semana_inicio: '', dia_semana: '', modalidad: '', hora_inicio: '', hora_fin: '', consultorio: '' });
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
        <input placeholder="Nombre" value={nuevoMedico.nombre} onChange={(e) => setNuevoMedico({ ...nuevoMedico, nombre: e.target.value })} />
        <select value={nuevoMedico.id_especialidad} onChange={(e) => setNuevoMedico({ ...nuevoMedico, id_especialidad: e.target.value })}>
          <option value="">Seleccionar especialidad</option>
          {especialidades.map((e) => (
            <option key={e.id_especialidad} value={e.id_especialidad}>{e.nombre}</option>
          ))}
        </select>
        <input placeholder="Teléfono" value={nuevoMedico.telefono} onChange={(e) => setNuevoMedico({ ...nuevoMedico, telefono: e.target.value })} />
        <input placeholder="Correo" value={nuevoMedico.correo_electronico} onChange={(e) => setNuevoMedico({ ...nuevoMedico, correo_electronico: e.target.value })} />
        <button onClick={crearMedico}>Guardar Médico</button>
      </section>

      <section>
        <h3>Crear Horario Semanal</h3>
        <select value={nuevoHorario.id_medico} onChange={(e) => setNuevoHorario({ ...nuevoHorario, id_medico: e.target.value })}>
          <option value="">Seleccionar Médico</option>
          {medicos.map((m) => (
            <option key={m.id_medico} value={m.id_medico}>{m.nombre}</option>
          ))}
        </select>
        <input type="date" value={nuevoHorario.semana_inicio} onChange={(e) => setNuevoHorario({ ...nuevoHorario, semana_inicio: e.target.value })} />
        <input placeholder="Día (ej: lunes)" value={nuevoHorario.dia_semana} onChange={(e) => setNuevoHorario({ ...nuevoHorario, dia_semana: e.target.value })} />
        <select value={nuevoHorario.modalidad} onChange={(e) => setNuevoHorario({ ...nuevoHorario, modalidad: e.target.value })}>
          <option value="">Modalidad</option>
          <option value="presencial">Presencial</option>
          <option value="previa_cita">Previa Cita</option>
        </select>
        <input type="time" value={nuevoHorario.hora_inicio} onChange={(e) => setNuevoHorario({ ...nuevoHorario, hora_inicio: e.target.value })} />
        <input type="time" value={nuevoHorario.hora_fin} onChange={(e) => setNuevoHorario({ ...nuevoHorario, hora_fin: e.target.value })} />
        <input placeholder="Consultorio" value={nuevoHorario.consultorio} onChange={(e) => setNuevoHorario({ ...nuevoHorario, consultorio: e.target.value })} />
        <button onClick={crearHorario}>Guardar Horario</button>
      </section>

      <section>
        <h3>Médicos Registrados</h3>
        <ul>
          {medicos.map((m) => (
            <li key={m.id_medico}>
              {m.nombre} (Especialidad ID: {m.id_especialidad})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminPanel;
