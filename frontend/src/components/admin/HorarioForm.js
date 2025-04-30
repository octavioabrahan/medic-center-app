import React, { useState, useEffect } from "react";
import axios from "axios";
import "./HorarioForm.css";

function HorarioForm({ onSuccess }) {
  const [form, setForm] = useState({
    profesional_id: "",
    dia_semana: [],
    hora_inicio: "",
    hora_termino: "",
    valido_desde: "",
    valido_hasta: "",
    tipo_atencion_id: "",
    nro_consulta: ""
  });

  const [profesionales, setProfesionales] = useState([]);
  const [tiposAtencion, setTiposAtencion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consultorio, setConsultorio] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [profesionalesRes, tiposRes] = await Promise.all([
          axios.get("/api/profesionales"),
          axios.get("/api/tipo-atencion")
        ]);
        setProfesionales(profesionalesRes.data);
        setTiposAtencion(tiposRes.data);
      } catch (e) {
        console.error("Error cargando datos:", e);
        setError("Error al cargar datos necesarios. Por favor, intenta de nuevo.");
      }
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleMultipleDays = (e) => {
    const checkboxes = e.target.querySelectorAll('input[type="checkbox"]');
    const selectedDays = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.value));
    setForm({ ...form, dia_semana: selectedDays });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.dia_semana.length === 0) {
      setError("Debe seleccionar al menos un día de la semana");
      return;
    }

    if (!form.profesional_id || !form.hora_inicio || !form.hora_termino || !form.tipo_atencion_id) {
      setError("Por favor complete todos los campos obligatorios");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post("/api/horarios", form);
      setForm({
        profesional_id: "",
        dia_semana: [],
        hora_inicio: "",
        hora_termino: "",
        valido_desde: "",
        valido_hasta: "",
        tipo_atencion_id: "",
        nro_consulta: ""
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al crear horario:", error);
      setError("Error al guardar el horario. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const diasSemana = [
    { valor: 1, nombre: "Lunes" },
    { valor: 2, nombre: "Martes" },
    { valor: 3, nombre: "Miércoles" },
    { valor: 4, nombre: "Jueves" },
    { valor: 5, nombre: "Viernes" },
    { valor: 6, nombre: "Sábado" },
    { valor: 7, nombre: "Domingo" }
  ];

  return (
    <form onSubmit={handleSubmit} className="horario-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-instructions">
        <p>Si un profesional atiende varios días a la semana, debes agregar cada día por separado. Ejemplo: si el profesional atiende lunes a las 8:00, miércoles a las 9:00 y viernes a las 10:00, debes crear tres horarios distintos, uno por cada día.</p>
      </div>

      <div className="form-group">
        <label htmlFor="profesional_id">Profesional</label>
        <select 
          id="profesional_id"
          name="profesional_id" 
          value={form.profesional_id} 
          onChange={handleChange}
          required
        >
          <option value="">Selecciona un profesional</option>
          {profesionales.map((p) => (
            <option key={p.profesional_id} value={p.profesional_id}>
              {p.nombre} {p.apellido}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="consultorio">Consultorio</label>
        <input 
          type="text" 
          id="consultorio" 
          name="consultorio" 
          value={consultorio}
          onChange={(e) => setConsultorio(e.target.value)}
          placeholder="Ingrese el número de consultorio"
        />
      </div>

      <div className="form-group">
        <label htmlFor="tipo_atencion_id">Tipo de atención</label>
        <select 
          id="tipo_atencion_id"
          name="tipo_atencion_id" 
          value={form.tipo_atencion_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona una opción</option>
          {tiposAtencion.map((t) => (
            <option key={t.tipo_atencion_id} value={t.tipo_atencion_id}>
              {t.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Día de la semana</label>
        <div className="checkbox-group" onChange={handleMultipleDays}>
          {diasSemana.map((dia) => (
            <div key={dia.valor} className="checkbox-item">
              <input 
                type="checkbox" 
                id={`dia-${dia.valor}`} 
                name="dia_semana" 
                value={dia.valor} 
              />
              <label htmlFor={`dia-${dia.valor}`}>{dia.nombre}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="hora_inicio">Hora de inicio</label>
          <input 
            type="time" 
            id="hora_inicio"
            name="hora_inicio" 
            value={form.hora_inicio}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="hora_termino">Hora de término</label>
          <input 
            type="time" 
            id="hora_termino"
            name="hora_termino" 
            value={form.hora_termino}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="valido_desde">Desde</label>
          <input 
            type="date" 
            id="valido_desde"
            name="valido_desde" 
            value={form.valido_desde}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="valido_hasta">Hasta</label>
          <input 
            type="date" 
            id="valido_hasta"
            name="valido_hasta" 
            value={form.valido_hasta}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="nro_consulta">Número de consulta</label>
        <input 
          type="number" 
          id="nro_consulta"
          name="nro_consulta" 
          min="1"
          value={form.nro_consulta}
          onChange={handleChange} 
          placeholder="Número de consulta"
        />
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="btn-cancelar"
          onClick={onSuccess}
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-guardar"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}

export default HorarioForm;