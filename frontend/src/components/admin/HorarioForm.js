import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Calendar from "../../components/common/Calendar";
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
  
  // Estados para calendarios
  const [showDesdePicker, setShowDesdePicker] = useState(false);
  const [showHastaPicker, setShowHastaPicker] = useState(false);
  const desdeDatePickerRef = useRef(null);
  const hastaDatePickerRef = useRef(null);
  
  const [desdeDateRange, setDesdeDateRange] = useState({
    from: form.valido_desde ? new Date(form.valido_desde) : new Date(),
    to: form.valido_desde ? new Date(form.valido_desde) : new Date()
  });
  
  const [hastaDateRange, setHastaDateRange] = useState({
    from: form.valido_hasta ? new Date(form.valido_hasta) : new Date(),
    to: form.valido_hasta ? new Date(form.valido_hasta) : new Date()
  });

  // Detectar clics fuera del selector de fechas para cerrarlo
  useEffect(() => {
    function handleClickOutside(event) {
      if (showDesdePicker && desdeDatePickerRef.current && !desdeDatePickerRef.current.contains(event.target)) {
        setShowDesdePicker(false);
      }
      if (showHastaPicker && hastaDatePickerRef.current && !hastaDatePickerRef.current.contains(event.target)) {
        setShowHastaPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDesdePicker, showHastaPicker]);

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
      
      if (horario.valido_desde) {
        setDesdeDateRange({
          from: new Date(horario.valido_desde),
          to: new Date(horario.valido_desde)
        });
      }
      
      if (horario.valido_hasta) {
        setHastaDateRange({
          from: new Date(horario.valido_hasta),
          to: new Date(horario.valido_hasta)
        });
      }
    }
  }, [horario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

    // Validar que la hora de inicio no sea después que la hora de término
    if (form.hora_inicio >= form.hora_termino) {
      setError("La hora de inicio no puede ser igual o posterior a la hora de término");
      return;
    }
    
    // Validar que la fecha "desde" no sea después que "hasta"
    if (form.valido_desde && form.valido_hasta) {
      const desde = new Date(form.valido_desde);
      const hasta = new Date(form.valido_hasta);
      if (desde > hasta) {
        setError("La fecha 'desde' no puede ser posterior a la fecha 'hasta'");
        return;
      }
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
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al guardar horario:", error);
      setError("Error al guardar el horario. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const handleDesdeCalendarChange = (dateRange) => {
    setDesdeDateRange(dateRange);
    setForm({
      ...form,
      valido_desde: dateRange.from.toISOString().split('T')[0]
    });
  };
  
  const handleHastaCalendarChange = (dateRange) => {
    setHastaDateRange(dateRange);
    setForm({
      ...form,
      valido_hasta: dateRange.from.toISOString().split('T')[0]
    });
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
        <div className="form-group" ref={desdeDatePickerRef}>
          <label htmlFor="valido_desde">Desde</label>
          <div className="select-wrapper">
            <input 
              type="text" 
              id="valido_desde"
              name="valido_desde" 
              placeholder="01/04/2025"
              value={form.valido_desde ? formatDate(form.valido_desde) : ""}
              onClick={() => setShowDesdePicker(!showDesdePicker)}
              readOnly
            />
            {showDesdePicker && (
              <div className="calendar-dropdown">
                <Calendar
                  initialDateRange={desdeDateRange}
                  onDateRangeChange={handleDesdeCalendarChange}
                  onClose={() => setShowDesdePicker(false)}
                  showPresets={false}
                  singleDateMode={true}
                />
                <div className="calendar-actions">
                  <button 
                    type="button"
                    className="btn-apply"
                    onClick={() => setShowDesdePicker(false)}
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-group" ref={hastaDatePickerRef}>
          <label htmlFor="valido_hasta">Hasta</label>
          <div className="select-wrapper">
            <input 
              type="text" 
              id="valido_hasta"
              name="valido_hasta"
              placeholder="30/04/2025" 
              value={form.valido_hasta ? formatDate(form.valido_hasta) : ""}
              onClick={() => setShowHastaPicker(!showHastaPicker)}
              readOnly
            />
            {showHastaPicker && (
              <div className="calendar-dropdown">
                <Calendar
                  initialDateRange={hastaDateRange}
                  onDateRangeChange={handleHastaCalendarChange}
                  onClose={() => setShowHastaPicker(false)}
                  showPresets={false}
                  singleDateMode={true}
                />
                <div className="calendar-actions">
                  <button 
                    type="button"
                    className="btn-apply"
                    onClick={() => setShowHastaPicker(false)}
                  >
                    Aceptar
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