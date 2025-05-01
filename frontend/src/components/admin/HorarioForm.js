import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import "./HorarioForm.css";

function HorarioForm({ onSuccess, horario }) {
  const [form, setForm] = useState({
    profesional_id: "",
    dia_semana: [],
    hora_inicio: "",
    hora_termino: "",
    valido_desde: "",
    valido_hasta: "",
    tipo_atencion_id: ""
  });

  const [profesionales, setProfesionales] = useState([]);
  const [tiposAtencion, setTiposAtencion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCalendarDesde, setShowCalendarDesde] = useState(false);
  const [showCalendarHasta, setShowCalendarHasta] = useState(false);
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

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

  // Cargar datos cuando se está editando un horario existente
  useEffect(() => {
    if (horario) {
      // Convertir las fechas de string a objetos Date si existen
      let fechaDesdeObj = null;
      let fechaHastaObj = null;
      
      if (horario.valido_desde) {
        fechaDesdeObj = new Date(horario.valido_desde);
        setFechaDesde(fechaDesdeObj);
      }
      
      if (horario.valido_hasta) {
        fechaHastaObj = new Date(horario.valido_hasta);
        setFechaHasta(fechaHastaObj);
      }
      
      setForm({
        profesional_id: horario.profesional_id || "",
        dia_semana: [horario.dia_semana] || [],
        hora_inicio: horario.hora_inicio || "",
        hora_termino: horario.hora_termino || "",
        valido_desde: horario.valido_desde || "",
        valido_hasta: horario.valido_hasta || "",
        tipo_atencion_id: horario.tipo_atencion_id || "",
        id_horario: horario.id_horario // Añadimos el ID para actualizar el registro correcto
      });
    }
  }, [horario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para hora_termino
    if (name === "hora_termino" && form.hora_inicio && value) {
      if (value <= form.hora_inicio) {
        setError("La hora de término debe ser posterior a la hora de inicio");
        return;
      } else {
        setError(null); // Limpiar mensaje de error si la validación es correcta
      }
    }

    // Validación especial para hora_inicio
    if (name === "hora_inicio" && form.hora_termino && value) {
      if (value >= form.hora_termino) {
        setError("La hora de inicio debe ser anterior a la hora de término");
        return;
      } else {
        setError(null); // Limpiar mensaje de error si la validación es correcta
      }
    }
    
    setForm({ ...form, [name]: value });
  };

  const handleDayCheck = (e) => {
    const { checked, value } = e.target;
    const dayValue = parseInt(value);
    
    if (checked) {
      setForm({
        ...form,
        dia_semana: [...form.dia_semana, dayValue]
      });
    } else {
      setForm({
        ...form,
        dia_semana: form.dia_semana.filter(day => day !== dayValue)
      });
    }
  };

  const handleFechaDesdeChange = (fecha) => {
    setFechaDesde(fecha);
    
    // Validar que la fecha desde no sea posterior a la fecha hasta
    if (fechaHasta && fecha > fechaHasta) {
      setError("La fecha desde no puede ser posterior a la fecha hasta");
      return;
    }
    
    // Actualizar el formulario con el formato adecuado para el backend
    setForm({
      ...form,
      valido_desde: fecha ? format(fecha, 'yyyy-MM-dd') : ""
    });
    
    setShowCalendarDesde(false);
  };

  const handleFechaHastaChange = (fecha) => {
    setFechaHasta(fecha);
    
    // Validar que la fecha hasta no sea anterior a la fecha desde
    if (fechaDesde && fecha < fechaDesde) {
      setError("La fecha hasta no puede ser anterior a la fecha desde");
      return;
    }
    
    // Actualizar el formulario con el formato adecuado para el backend
    setForm({
      ...form,
      valido_hasta: fecha ? format(fecha, 'yyyy-MM-dd') : ""
    });
    
    setShowCalendarHasta(false);
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

    // Validar que la hora de término sea posterior a la de inicio
    if (form.hora_inicio >= form.hora_termino) {
      setError("La hora de término debe ser posterior a la hora de inicio");
      return;
    }
    
    // Validar que las fechas sean coherentes
    if (form.valido_desde && form.valido_hasta && form.valido_desde > form.valido_hasta) {
      setError("La fecha desde no puede ser posterior a la fecha hasta");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (form.id_horario) {
        // Estamos editando un horario existente
        await axios.put(`/api/horarios/${form.id_horario}`, form);
      } else {
        // Estamos creando un nuevo horario
        await axios.post("/api/horarios", form);
      }

      setForm({
        profesional_id: "",
        dia_semana: [],
        hora_inicio: "",
        hora_termino: "",
        valido_desde: "",
        valido_hasta: "",
        tipo_atencion_id: ""
      });
      setFechaDesde(null);
      setFechaHasta(null);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al guardar horario:", error);
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

  const formatFechaDisplay = (fecha) => {
    if (!fecha) return '';
    return format(new Date(fecha), 'dd/MM/yyyy', { locale: es });
  };

  return (
    <form onSubmit={handleSubmit} className="horario-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-instructions">
        <p>Si un profesional atiende varios días a la semana, debes agregar cada día por separado. Ejemplo: si el profesional atiende lunes a las 8:00, miércoles a las 9:00 y viernes a las 10:00, debes crear tres horarios distintos, uno por cada día.</p>
      </div>

      <div className="form-group">
        <label htmlFor="profesional_id">Profesional</label>
        <div className="select-wrapper">
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
      </div>

      <div className="form-group">
        <label>Día de la semana</label>
        <div className="checkbox-group">
          {diasSemana.map((dia) => (
            <div key={dia.valor} className="checkbox-item">
              <input 
                type="checkbox" 
                id={`dia-${dia.valor}`} 
                name="dia_semana" 
                value={dia.valor}
                checked={form.dia_semana.includes(dia.valor)}
                onChange={handleDayCheck}
              />
              <label htmlFor={`dia-${dia.valor}`}>{dia.nombre}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="hora_inicio">Hora de inicio</label>
          <div className="select-wrapper">
            <select 
              id="hora_inicio"
              name="hora_inicio" 
              value={form.hora_inicio}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione</option>
              <option value="07:00">07:00 AM</option>
              <option value="07:30">07:30 AM</option>
              <option value="08:00">08:00 AM</option>
              <option value="08:30">08:30 AM</option>
              <option value="09:00">09:00 AM</option>
              <option value="09:30">09:30 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="10:30">10:30 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="11:30">11:30 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="12:30">12:30 PM</option>
              <option value="13:00">01:00 PM</option>
              <option value="13:30">01:30 PM</option>
              <option value="14:00">02:00 PM</option>
              <option value="14:30">02:30 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="15:30">03:30 PM</option>
              <option value="16:00">04:00 PM</option>
              <option value="16:30">04:30 PM</option>
              <option value="17:00">05:00 PM</option>
              <option value="17:30">05:30 PM</option>
              <option value="18:00">06:00 PM</option>
              <option value="18:30">06:30 PM</option>
              <option value="19:00">07:00 PM</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="hora_termino">Hora de término</label>
          <div className="select-wrapper">
            <select 
              id="hora_termino"
              name="hora_termino" 
              value={form.hora_termino}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione</option>
              <option value="08:00">08:00 AM</option>
              <option value="08:30">08:30 AM</option>
              <option value="09:00">09:00 AM</option>
              <option value="09:30">09:30 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="10:30">10:30 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="11:30">11:30 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="12:30">12:30 PM</option>
              <option value="13:00">01:00 PM</option>
              <option value="13:30">01:30 PM</option>
              <option value="14:00">02:00 PM</option>
              <option value="14:30">02:30 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="15:30">03:30 PM</option>
              <option value="16:00">04:00 PM</option>
              <option value="16:30">04:30 PM</option>
              <option value="17:00">05:00 PM</option>
              <option value="17:30">05:30 PM</option>
              <option value="18:00">06:00 PM</option>
              <option value="18:30">06:30 PM</option>
              <option value="19:00">07:00 PM</option>
              <option value="19:30">07:30 PM</option>
              <option value="20:00">08:00 PM</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="valido_desde">Desde</label>
          <div className="date-picker-container">
            <div 
              className="date-input-wrapper" 
              onClick={() => setShowCalendarDesde(!showCalendarDesde)}
            >
              <span className="calendar-icon">📅</span>
              <input 
                type="text" 
                id="valido_desde"
                name="valido_desde" 
                className="date-input"
                placeholder="01/04/2023"
                value={fechaDesde ? formatFechaDisplay(fechaDesde) : ""}
                readOnly
              />
            </div>
            {showCalendarDesde && (
              <div className="calendar-dropdown">
                <DatePicker
                  selected={fechaDesde}
                  onChange={handleFechaDesdeChange}
                  locale={es}
                  inline
                  dateFormat="dd/MM/yyyy"
                />
                <div className="calendar-actions">
                  <button 
                    type="button"
                    className="btn-cancel" 
                    onClick={() => setShowCalendarDesde(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button" 
                    className="btn-apply"
                    onClick={() => setShowCalendarDesde(false)}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="valido_hasta">Hasta</label>
          <div className="date-picker-container">
            <div 
              className="date-input-wrapper" 
              onClick={() => setShowCalendarHasta(!showCalendarHasta)}
            >
              <span className="calendar-icon">📅</span>
              <input 
                type="text" 
                id="valido_hasta"
                name="valido_hasta" 
                className="date-input"
                placeholder="30/04/2025"
                value={fechaHasta ? formatFechaDisplay(fechaHasta) : ""}
                readOnly
              />
            </div>
            {showCalendarHasta && (
              <div className="calendar-dropdown">
                <DatePicker
                  selected={fechaHasta}
                  onChange={handleFechaHastaChange}
                  locale={es}
                  inline
                  dateFormat="dd/MM/yyyy"
                />
                <div className="calendar-actions">
                  <button 
                    type="button"
                    className="btn-cancel" 
                    onClick={() => setShowCalendarHasta(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button"
                    className="btn-apply"
                    onClick={() => setShowCalendarHasta(false)}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="tipo_atencion_id">Tipo de atención</label>
        <div className="select-wrapper">
          <select 
            id="tipo_atencion_id"
            name="tipo_atencion_id" 
            value={form.tipo_atencion_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {tiposAtencion.map((t) => (
              <option key={t.tipo_atencion_id} value={t.tipo_atencion_id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
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