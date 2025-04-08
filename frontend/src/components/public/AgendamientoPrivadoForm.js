import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AgendamientoPrivadoForm = () => {
  const [formData, setFormData] = useState({
    cedula: '',
    sinCedula: false,
    numeroHijo: '',
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    sexo: '',
    telefono: '',
    email: '',
    seguro_medico: false,
    profesional_id: '',
    observaciones: '',
    representante_nombre: '',
    representante_apellido: ''
  });

  const [profesionales, setProfesionales] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [fechaAgendada, setFechaAgendada] = useState(null);

  useEffect(() => {
    const fetchProfesionales = async () => {
      try {
        const response = await axios.get('/api/profesionales');
        setProfesionales(response.data);
      } catch (error) {
        console.error('Error al cargar profesionales:', error);
      }
    };
    fetchProfesionales();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfesionalChange = async (e) => {
    const profesionalId = e.target.value;
    setFormData({ ...formData, profesional_id: profesionalId });
    try {
      const res = await axios.get(`/api/horarios/fechas/${profesionalId}`);
      setFechasDisponibles(res.data);
    } catch (error) {
      console.error("Error cargando fechas:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/agendamiento', {
        ...formData,
        representante_cedula: formData.sinCedula ? formData.cedula : null,
        fecha_agendada: fechaAgendada
      });
      alert('Agendamiento exitoso');
    } catch (error) {
      console.error('Error al agendar:', error);
      alert('Hubo un error al agendar.');
    }
  };

  return (
    <div>
      <h2>Agendamiento Particular</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Cédula:</label>
          <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} />
          <label>
            <input type="checkbox" name="sinCedula" checked={formData.sinCedula} onChange={handleChange} />
            La persona que se atenderá no tiene cédula
          </label>
        </div>

        {formData.sinCedula && (
          <fieldset>
            <legend>Datos del representante legal</legend>
            <div>
              <label>¿Qué número de hijo(a) es este menor?</label>
              <input type="text" name="numeroHijo" value={formData.numeroHijo} onChange={handleChange} />
            </div>
            <div>
              <label>Nombre:</label>
              <input type="text" name="representante_nombre" value={formData.representante_nombre} onChange={handleChange} />
            </div>
            <div>
              <label>Apellidos:</label>
              <input type="text" name="representante_apellido" value={formData.representante_apellido} onChange={handleChange} />
            </div>
            <div>
              <label>Sexo:</label>
              <select name="sexo" value={formData.sexo} onChange={handleChange}>
                <option value="">Selecciona</option>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
              </select>
            </div>
            <div>
              <label>Teléfono:</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
            </div>
            <div>
              <label>Correo electrónico:</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend>Datos Paciente</legend>
          <div>
            <label>Nombre:</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} />
          </div>
          <div>
            <label>Apellido:</label>
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} />
          </div>
          <div>
            <label>Fecha nacimiento:</label>
            <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
          </div>
          <div>
            <label>Sexo:</label>
            <select name="sexo" value={formData.sexo} onChange={handleChange}>
              <option value="">Selecciona</option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
            </select>
          </div>
        </fieldset>

        <div>
          <label>¿Tiene seguro médico?</label>
          <input type="checkbox" name="seguro_medico" checked={formData.seguro_medico} onChange={handleChange} />
        </div>

        <div>
          <label>Profesional:</label>
          <select name="profesional_id" value={formData.profesional_id} onChange={handleProfesionalChange}>
            <option value="">Selecciona un médico</option>
            {profesionales.map((prof) => (
              <option key={prof.profesional_id} value={prof.profesional_id}>
                {prof.nombre} {prof.apellido}
              </option>
            ))}
          </select>
        </div>

        {formData.profesional_id && (
          <div>
            <label>Seleccione fecha y hora disponible:</label>
            <DatePicker
              selected={fechaAgendada}
              onChange={date => setFechaAgendada(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={30}
              dateFormat="dd/MM/yyyy HH:mm"
              includeDates={fechasDisponibles.map(fd => new Date(fd))}
              placeholderText="Seleccione fecha y hora"
            />
          </div>
        )}

        <div>
          <label>Observaciones:</label>
          <input type="text" name="observaciones" value={formData.observaciones} onChange={handleChange} />
        </div>

        <button type="submit">Agendar</button>
      </form>
    </div>
  );
};

export default AgendamientoPrivadoForm;