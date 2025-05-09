import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { startOfDay } from "date-fns";
import Calendar from "../../../components/common/Calendar";
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
  
  // Estados para el calendario de rango
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const dateRangePickerRef = useRef(null);
  
  // Estado para el rango de fechas
  const [dateRange, setDateRange] = useState({
    from: form.valido_desde ? new Date(form.valido_desde) : new Date(),
    to: form.valido_hasta ? new Date(form.valido_hasta) : new Date()
  });

  // Detectar clics fuera del selector de fechas para cerrarlo
  useEffect(() => {
    function handleClickOutside(event) {
      if (showDateRangePicker && dateRangePickerRef.current && !dateRangePickerRef.current.contains(event.target)) {
        setShowDateRangePicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDateRangePicker]);

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
      // Si el horario tiene dia_semana como array, usarlo directamente
      // Si es un valor único, convertirlo a array
      let diasSemanaArray = [];
      if (horario.dia_semana) {
        diasSemanaArray = Array.isArray(horario.dia_semana) 
          ? horario.dia_semana 
          : [horario.dia_semana];
      }
      // Si tiene días_semana (formato agrupado del frontend), usarlo
      if (horario.dias_semana) {
        diasSemanaArray = horario.dias_semana;
      }
      
      // Asegurarse de que hora_inicio y hora_termino tienen el formato correcto HH:MM
      let horaInicio = horario.hora_inicio || "";
      let horaTermino = horario.hora_termino || "";
      
      // Si las horas vienen con segundos (HH:MM:SS), eliminar los segundos
      if (horaInicio && horaInicio.length > 5) {
        horaInicio = horaInicio.substring(0, 5);
      }
      if (horaTermino && horaTermino.length > 5) {
        horaTermino = horaTermino.substring(0, 5);
      }
      
      console.log("Cargando horario para editar:", {
        hora_inicio: horaInicio,
        hora_termino: horaTermino
      });
      
      setForm({
        profesional_id: horario.profesional_id || "",
        dia_semana: diasSemanaArray,
        hora_inicio: horaInicio,
        hora_termino: horaTermino,
        valido_desde: horario.valido_desde || "",
        valido_hasta: horario.valido_hasta || "",
        tipo_atencion_id: horario.tipo_atencion_id || "",
        horario_id: horario.horario_id // Usamos horario_id, que es el nombre correcto en la BD
      });
      
      // Inicializar el rango de fechas si tenemos fechas en el horario
      if (horario.valido_desde || horario.valido_hasta) {
        setDateRange({
          from: horario.valido_desde ? new Date(horario.valido_desde) : new Date(),
          to: horario.valido_hasta ? new Date(horario.valido_hasta) : new Date()
        });
      }
    }
  }, [horario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if ((name === 'hora_inicio' || name === 'hora_termino') && error) {
      // Limpiar el error relacionado con las horas al cambiar cualquiera de ellas
      setError(null);
    }
    
    setForm({ ...form, [name]: value });
    
    // Validación inmediata de horas al cambiar cualquiera de ellas
    if (name === 'hora_inicio' && form.hora_termino && value >= form.hora_termino) {
      setError("La hora de inicio debe ser anterior a la hora de término");
    }
    else if (name === 'hora_termino' && form.hora_inicio && form.hora_inicio >= value) {
      setError("La hora de término debe ser posterior a la hora de inicio");
    }
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

    setLoading(true);
    setError(null);

    try {
      if (form.horario_id) {
        // Estamos editando un horario existente
        await axios.put(`/api/horarios/${form.horario_id}`, form);
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
  
  const formatDateRange = () => {
    if (!dateRange.from && !dateRange.to) return "";
    
    const formatDate = (date) => {
      if (!date) return "";
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };
    
    return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
  };
  
  const handleDateRangeChange = (newDateRange) => {
    // Evitar actualizaciones infinitas comparando si el rango realmente cambió
    if (!dateRange.from || !dateRange.to || 
        dateRange.from.getTime() !== newDateRange.from.getTime() ||
        dateRange.to.getTime() !== newDateRange.to.getTime()) {
      
      // Usamos startOfDay para ambas fechas para mantener consistencia
      const fromDate = startOfDay(newDateRange.from);
      const toDate = startOfDay(newDateRange.to);
      
      const updatedRange = {
        from: fromDate,
        to: toDate
      };
      
      setDateRange(updatedRange);
      
      // Para el formulario, enviamos las fechas en formato ISO (YYYY-MM-DD)
      setForm({
        ...form,
        valido_desde: fromDate.toISOString().split('T')[0],
        valido_hasta: toDate.toISOString().split('T')[0]
      });
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

      {/* Reemplazar los dos selectores de fecha por uno solo de rango */}
      <div className="form-group" ref={dateRangePickerRef}>
        <label htmlFor="rango_validez">Validez del horario</label>
        <div className="select-wrapper">
          <input 
            type="text" 
            id="rango_validez"
            name="rango_validez" 
            placeholder="Seleccione rango de fechas"
            value={formatDateRange()}
            onClick={() => setShowDateRangePicker(!showDateRangePicker)}
            readOnly
          />
          {showDateRangePicker && (
            <div className="calendar-dropdown modal-calendar">
              <Calendar
                initialDateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onClose={() => setShowDateRangePicker(false)}
                showPresets={false}
                singleDateMode={false}
              />
              <div className="calendar-actions">
                <button 
                  type="button"
                  className="btn-apply"
                  onClick={() => setShowDateRangePicker(false)}
                >
                  Aceptar
                </button>
              </div>
            </div>
          )}
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