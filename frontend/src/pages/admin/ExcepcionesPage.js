import React, { useEffect, useState, useRef, useCallback } from "react";
import apiClient, { fetchWithCache } from "../../api"; // Importando nuestro cliente API mejorado
import "./HorariosPage.css";
import "../../components/admin/AdminCommon.css"; // Importamos los estilos comunes
import { format } from "date-fns";
import { es } from "date-fns/locale";

function ExcepcionesPage() {
  // Estados para datos
  const [profesionales, setProfesionales] = useState([]);
  const [excepciones, setExcepciones] = useState([]);
  const [filteredExcepciones, setFilteredExcepciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para modales
  const [showAgregarModal, setShowAgregarModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  
  // Estado para el formulario de nueva excepción
  const [nuevaExcepcion, setNuevaExcepcion] = useState({
    profesional_id: "",
    fecha: new Date(),
    hora_inicio: "",
    hora_termino: "",
    estado: "manual",
    motivo: ""
  });

  // Estado para el formulario de cancelar día
  const [cancelacion, setCancelacion] = useState({
    profesional_id: "",
    fecha: new Date(),
    motivo: "",
    estado: "cancelado"
  });
  
  // Estados para el calendario
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [daysInMonth, setDaysInMonth] = useState([]);
  
  // Estado para días disponibles del profesional
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [fechasCanceladas, setFechasCanceladas] = useState(new Set());
  
  // Referencias para detección de clics fuera de los selectores
  const mesAgregarRef = useRef(null);
  const mesCancelarRef = useRef(null);
  const yearAgregarRef = useRef(null);
  const yearCancelarRef = useRef(null);
  const [showMesSelector, setShowMesSelector] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showMesCancelarSelector, setShowMesCancelarSelector] = useState(false);
  const [showYearCancelarSelector, setShowYearCancelarSelector] = useState(false);
  
  // Formatear y parsear fechas
  const parseFechaLocal = useCallback((fechaStr) => {
    const [y, m, d] = fechaStr.split('-').map(Number);
    return new Date(y, m - 1, d); // mes 0-indexed
  }, []);

  const formatDate = useCallback((input) => {
    const date = typeof input === 'string' ? parseFechaLocal(input) : input;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [parseFechaLocal]); 
  
  // Crear calendario para el mes y año seleccionados
  useEffect(() => {
    const days = [];
    const date = new Date(selectedYear, selectedMonth, 1);
    
    // Obtener el día de la semana del primer día del mes (0 = domingo, 1 = lunes, etc.)
    let firstDayOfMonth = date.getDay();
    // Ajustar para que la semana comience en lunes (0 = lunes, 6 = domingo)
    firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    // Agregar días del mes anterior para completar la primera semana
    const prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: selectedMonth - 1,
        year: selectedMonth === 0 ? selectedYear - 1 : selectedYear,
        isCurrentMonth: false
      });
    }
    
    // Agregar días del mes actual
    const daysInCurrentMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({
        day: i,
        month: selectedMonth,
        year: selectedYear,
        isCurrentMonth: true
      });
    }
    
    // Calcular cuántos días necesitamos del mes siguiente
    const remainingDays = 42 - days.length; // 6 semanas * 7 días = 42
    
    // Agregar días del mes siguiente
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: selectedMonth + 1 === 12 ? 0 : selectedMonth + 1,
        year: selectedMonth + 1 === 12 ? selectedYear + 1 : selectedYear,
        isCurrentMonth: false
      });
    }
    
    setDaysInMonth(days);
  }, [selectedMonth, selectedYear]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchProfesionales();
    fetchExcepciones();
  }, []);

  // Cargar fechas disponibles cuando cambia el profesional seleccionado o el mes/año
  useEffect(() => {
    if (cancelacion.profesional_id) {
      cargarFechasDisponibles(cancelacion.profesional_id);
    }
  }, [cancelacion.profesional_id, selectedMonth, selectedYear]); 
  
  // Filtrar excepciones cuando cambia el término de búsqueda
  useEffect(() => {
    if (excepciones.length > 0) {
      if (searchTerm.trim() === "") {
        setFilteredExcepciones(excepciones);
      } else {
        const term = searchTerm.toLowerCase();
        const filtered = excepciones.filter(excepcion => 
          `${excepcion.profesional_nombre} ${excepcion.profesional_apellido}`.toLowerCase().includes(term)
        );
        setFilteredExcepciones(filtered);
      }
    }
  }, [searchTerm, excepciones]);

  // Detectar clics fuera de los selectores
  useEffect(() => {
    function handleClickOutside(event) {
      if (mesAgregarRef.current && !mesAgregarRef.current.contains(event.target)) {
        setShowMesSelector(false);
      }
      if (yearAgregarRef.current && !yearAgregarRef.current.contains(event.target)) {
        setShowYearSelector(false);
      }
      if (mesCancelarRef.current && !mesCancelarRef.current.contains(event.target)) {
        setShowMesCancelarSelector(false);
      }
      if (yearCancelarRef.current && !yearCancelarRef.current.contains(event.target)) {
        setShowYearCancelarSelector(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch de profesionales con sistema de caché
  const fetchProfesionales = async () => {
    try {
      // Usar fetchWithCache en lugar de axios.get
      const response = await fetchWithCache("/api/profesionales");
      setProfesionales(response.data);
    } catch (err) {
      console.error("Error cargando profesionales:", err);
      setError("Error al cargar los profesionales. Por favor, recarga la página.");
    }
  };

  // Fetch de excepciones con sistema de caché
  const fetchExcepciones = async () => {
    setLoading(true);
    try {
      // Usar fetchWithCache en lugar de axios.get
      const response = await fetchWithCache("/api/excepciones");
      setExcepciones(response.data);
      setFilteredExcepciones(response.data);
    } catch (err) {
      console.error("Error al cargar excepciones:", err);
      setError("Error al cargar las excepciones. Por favor, recarga la página.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar fechas disponibles para un profesional específico
  const cargarFechasDisponibles = async (profesionalId) => {
    try {
      // Usar Promise.all con fetchWithCache
      const [resHorarios, resExcepciones] = await Promise.all([
        fetchWithCache(`/api/horarios/fechas/${profesionalId}`),
        fetchWithCache(`/api/excepciones/profesional/${profesionalId}`)
      ]);

      const horarios = resHorarios.data;
      const excepciones = resExcepciones.data;

      // Crear un conjunto de fechas canceladas
      const canceladas = new Set(
        excepciones
          .filter(e => e.estado === 'cancelado')
          .map(e => formatDate(e.fecha))
      );
      
      setFechasCanceladas(canceladas);

      // Filtrar horarios que no están cancelados
      const validas = horarios
        .filter(h => !canceladas.has(formatDate(h.fecha)))
        .map(h => ({
          fecha: formatDate(h.fecha),
          hora_inicio: h.hora_inicio,
          hora_termino: h.hora_termino,
          nro_consulta: h.nro_consulta,
          dateObj: parseFechaLocal(formatDate(h.fecha))
        }));
        
      // Agregar fechas manuales
      const agregadas = excepciones
        .filter(e => e.estado === 'manual')
        .map(e => ({
          fecha: formatDate(e.fecha),
          hora_inicio: e.hora_inicio,
          hora_termino: e.hora_termino,
          nro_consulta: e.nro_consulta,
          dateObj: parseFechaLocal(formatDate(e.fecha))
        }));

      // Combinar todas las fechas disponibles
      const combinadas = [...validas, ...agregadas];
      
      // Filtrar solo las fechas que corresponden al mes y año seleccionados
      const fechasFiltradas = combinadas.filter(fecha => 
        fecha.dateObj.getMonth() === selectedMonth && 
        fecha.dateObj.getFullYear() === selectedYear
      );

      setFechasDisponibles(fechasFiltradas);
      
    } catch (err) {
      console.error("Error al cargar fechas disponibles:", err);
      setError("Error al cargar las fechas disponibles.");
      setFechasDisponibles([]);
      setFechasCanceladas(new Set());
    }
  };

  // Verificar si una fecha específica está disponible
  const isFechaDisponible = useCallback((day, month, year) => {
    if (!cancelacion.profesional_id || fechasDisponibles.length === 0) {
      return false;
    }
    
    return fechasDisponibles.some(fecha => 
      fecha.dateObj.getDate() === day &&
      fecha.dateObj.getMonth() === month &&
      fecha.dateObj.getFullYear() === year
    );
  }, [fechasDisponibles, cancelacion.profesional_id]);
  
  // Verificar si una fecha específica ya está cancelada
  const isFechaCancelada = useCallback((day, month, year) => {
    const fechaFormateada = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return fechasCanceladas.has(fechaFormateada);
  }, [fechasCanceladas]);

  // Guardar excepción (día agregado)
  const guardarExcepcion = async (e) => {
    e.preventDefault();
    
    if (!nuevaExcepcion.profesional_id || !nuevaExcepcion.hora_inicio || 
        !nuevaExcepcion.hora_termino || !nuevaExcepcion.motivo) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }
    
    try {
      // Formatear la fecha seleccionada
      const fechaFormateada = formatDate(nuevaExcepcion.fecha);
      
      await axios.post("/api/excepciones", {
        ...nuevaExcepcion,
        fecha: fechaFormateada
      });
      
      await fetchExcepciones();
      setShowAgregarModal(false);
      resetNuevaExcepcion();
    } catch (err) {
      alert("Error al guardar la excepción");
      console.error(err);
    }
  };

  // Cancelar día
  const cancelarDia = async (e) => {
    e.preventDefault();
    
    if (!cancelacion.profesional_id || !cancelacion.motivo) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }
    
    try {
      // Formatear la fecha seleccionada
      const fechaFormateada = formatDate(cancelacion.fecha);
      
      await axios.post("/api/excepciones", {
        ...cancelacion,
        fecha: fechaFormateada
      });
      
      await fetchExcepciones();
      // Recargar las fechas disponibles después de cancelar un día
      await cargarFechasDisponibles(cancelacion.profesional_id);
      setShowCancelarModal(false);
      resetCancelacion();
    } catch (err) {
      alert("Error al cancelar el día");
      console.error(err);
    }
  };

  // Reset formularios
  const resetNuevaExcepcion = () => {
    setNuevaExcepcion({
      profesional_id: "",
      fecha: new Date(),
      hora_inicio: "",
      hora_termino: "",
      estado: "manual",
      motivo: ""
    });
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
  };

  const resetCancelacion = () => {
    setCancelacion({
      profesional_id: "",
      fecha: new Date(),
      motivo: "",
      estado: "cancelado"
    });
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
    setFechasDisponibles([]);
    setFechasCanceladas(new Set());
  };

  // Selección de día en el calendario
  const selectDay = (day, month, year, isAgregar = true) => {
    const selectedDate = new Date(year, month, day);
    
    if (isAgregar) {
      setNuevaExcepcion({
        ...nuevaExcepcion,
        fecha: selectedDate
      });
    } else {
      // Solo permitir seleccionar días disponibles que no están cancelados
      if (isFechaDisponible(day, month, year) && !isFechaCancelada(day, month, year)) {
        setCancelacion({
          ...cancelacion,
          fecha: selectedDate
        });
      }
    }
  };

  // Funciones para los selectores de mes y año
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const getMesNombre = (mes) => meses[mes];
  
  const handleMesChange = (index) => {
    setSelectedMonth(index);
    setShowMesSelector(false);
    setShowMesCancelarSelector(false);
  };
  
  const handleYearChange = (year) => {
    setSelectedYear(year);
    setShowYearSelector(false);
    setShowYearCancelarSelector(false);
  };
  
  // Generar años para el selector (año actual +/- 10 años)
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(i);
  }

  // Formato para la fecha mostrada en las tablas
  const formatFecha = (fecha) => {
    try {
      const date = new Date(fecha);
      return format(date, "d 'de' MMMM yyyy", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Renderizado de la tabla de excepciones
  const renderExcepcionesTable = () => {
    if (loading) return <div className="loading-container">Cargando excepciones...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredExcepciones.length === 0) return <div className="no-results">No se encontraron excepciones configuradas</div>;

    return (
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Profesional</th>
              <th>Estado</th>
              <th>Motivo</th>
              <th>Fecha</th>
              <th>Hora de inicio</th>
              <th>Hora de término</th>
            </tr>
          </thead>
          <tbody>
            {filteredExcepciones.map((excepcion) => (
              <tr key={excepcion.excepcion_id}>
                <td>{excepcion.profesional_nombre} {excepcion.profesional_apellido}</td>
                <td>
                  <span className={`status-badge ${excepcion.estado === "cancelado" ? "status-inactive" : "status-active"}`}>
                    {excepcion.estado === "cancelado" ? "Cancelado" : "Excepción"}
                  </span>
                </td>
                <td>{excepcion.motivo}</td>
                <td>{formatFecha(excepcion.fecha)}</td>
                <td>{excepcion.hora_inicio ? excepcion.hora_inicio.slice(0, 5) : "-"}</td>
                <td>{excepcion.hora_termino ? excepcion.hora_termino.slice(0, 5) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Días de la semana para el calendario
  const diasSemana = ["L", "M", "M", "J", "V", "S", "D"];

  // Estructura principal del componente
  return (
    <div className="admin-page-container">
      <div className="admin-filters-bar">
        <div className="admin-search">
          <input
            type="text"
            placeholder="Buscar por nombre de profesional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="admin-actions">
          <button className="btn-secondary" onClick={() => {
            resetCancelacion();
            setShowCancelarModal(true);
          }}>
            Cancelar día
          </button>
          <button className="btn-add" onClick={() => {
            resetNuevaExcepcion();
            setShowAgregarModal(true);
          }}>
            Agregar día
          </button>
        </div>
      </div>
      
      {renderExcepcionesTable()}
      
      {/* Modal para agregar día */}
      {showAgregarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Agregar día en la atención de un profesional</h2>
              <button className="close-btn" onClick={() => setShowAgregarModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="form-instructions">
                Usa este formulario para agregar un día específico que un profesional atenderá.
              </p>
              
              <form onSubmit={guardarExcepcion} className="horario-form">
                <div className="form-group">
                  <label htmlFor="profesional_id">Profesional</label>
                  <select
                    id="profesional_id"
                    name="profesional_id"
                    value={nuevaExcepcion.profesional_id}
                    onChange={(e) => setNuevaExcepcion({...nuevaExcepcion, profesional_id: e.target.value})}
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
                
                {/* Selector de mes y año */}
                <div className="form-row">
                  <div className="form-group" ref={mesAgregarRef}>
                    <label>Mes</label>
                    <div className="select-wrapper">
                      <input
                        type="text"
                        value={getMesNombre(selectedMonth)}
                        onClick={() => setShowMesSelector(!showMesSelector)}
                        readOnly
                        style={{cursor: 'pointer'}}
                      />
                      {showMesSelector && (
                        <div className="dropdown-menu">
                          {meses.map((mes, index) => (
                            <div 
                              key={mes} 
                              className="dropdown-item"
                              onClick={() => handleMesChange(index)}
                            >
                              {mes}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group" ref={yearAgregarRef}>
                    <label>Año</label>
                    <div className="select-wrapper">
                      <input
                        type="text"
                        value={selectedYear}
                        onClick={() => setShowYearSelector(!showYearSelector)}
                        readOnly
                        style={{cursor: 'pointer'}}
                      />
                      {showYearSelector && (
                        <div className="dropdown-menu">
                          {years.map(year => (
                            <div 
                              key={year} 
                              className="dropdown-item"
                              onClick={() => handleYearChange(year)}
                            >
                              {year}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Calendario */}
                <div className="calendario-grid">
                  {diasSemana.map((dia, index) => (
                    <div key={`header-${index}`} className="calendario-header">{dia}</div>
                  ))}
                  
                  {daysInMonth.map((day, index) => {
                    const isSelected = 
                      nuevaExcepcion.fecha && 
                      nuevaExcepcion.fecha.getDate() === day.day && 
                      nuevaExcepcion.fecha.getMonth() === day.month && 
                      nuevaExcepcion.fecha.getFullYear() === day.year;
                    
                    return (
                      <div 
                        key={`day-${index}`} 
                        className={`calendario-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => selectDay(day.day, day.month, day.year, true)}
                      >
                        {day.day}
                      </div>
                    );
                  })}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="hora_inicio">Hora de inicio</label>
                    <select 
                      id="hora_inicio"
                      name="hora_inicio" 
                      value={nuevaExcepcion.hora_inicio}
                      onChange={(e) => setNuevaExcepcion({...nuevaExcepcion, hora_inicio: e.target.value})}
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

                  <div className="form-group">
                    <label htmlFor="hora_termino">Hora de término</label>
                    <select 
                      id="hora_termino"
                      name="hora_termino" 
                      value={nuevaExcepcion.hora_termino}
                      onChange={(e) => setNuevaExcepcion({...nuevaExcepcion, hora_termino: e.target.value})}
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
                
                <div className="form-group">
                  <label htmlFor="motivo">Motivo</label>
                  <input
                    type="text"
                    id="motivo"
                    name="motivo"
                    placeholder="Ingrese el motivo"
                    value={nuevaExcepcion.motivo}
                    onChange={(e) => setNuevaExcepcion({...nuevaExcepcion, motivo: e.target.value})}
                    required
                  />
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowAgregarModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para cancelar día */}
      {showCancelarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Cancelar día en la atención de un profesional</h2>
              <button className="close-btn" onClick={() => setShowCancelarModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="form-instructions">
                Usa este formulario para cancelar un día específico que un profesional no atenderá.
              </p>
              
              <form onSubmit={cancelarDia} className="horario-form">
                <div className="form-group">
                  <label htmlFor="profesional_id_cancelar">Profesional</label>
                  <select
                    id="profesional_id_cancelar"
                    name="profesional_id"
                    value={cancelacion.profesional_id}
                    onChange={(e) => setCancelacion({...cancelacion, profesional_id: e.target.value})}
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
                
                {/* Selector de mes y año para cancelar */}
                <div className="form-row">
                  <div className="form-group" ref={mesCancelarRef}>
                    <label>Mes</label>
                    <div className="select-wrapper">
                      <input
                        type="text"
                        value={getMesNombre(selectedMonth)}
                        onClick={() => setShowMesCancelarSelector(!showMesCancelarSelector)}
                        readOnly
                        style={{cursor: 'pointer'}}
                      />
                      {showMesCancelarSelector && (
                        <div className="dropdown-menu">
                          {meses.map((mes, index) => (
                            <div 
                              key={mes} 
                              className="dropdown-item"
                              onClick={() => handleMesChange(index)}
                            >
                              {mes}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group" ref={yearCancelarRef}>
                    <label>Año</label>
                    <div className="select-wrapper">
                      <input
                        type="text"
                        value={selectedYear}
                        onClick={() => setShowYearCancelarSelector(!showYearCancelarSelector)}
                        readOnly
                        style={{cursor: 'pointer'}}
                      />
                      {showYearCancelarSelector && (
                        <div className="dropdown-menu">
                          {years.map(year => (
                            <div 
                              key={year} 
                              className="dropdown-item"
                              onClick={() => handleYearChange(year)}
                            >
                              {year}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Calendario para cancelar - ahora mostrando solo días específicos disponibles */}
                <div className="calendario-grid">
                  {diasSemana.map((dia, index) => (
                    <div key={`header-cancel-${index}`} className="calendario-header">{dia}</div>
                  ))}
                  
                  {daysInMonth.map((day, index) => {
                    const isSelected = 
                      cancelacion.fecha && 
                      cancelacion.fecha.getDate() === day.day && 
                      cancelacion.fecha.getMonth() === day.month && 
                      cancelacion.fecha.getFullYear() === day.year;
                    
                    const isDisponible = isFechaDisponible(day.day, day.month, day.year);
                    const isCancelada = isFechaCancelada(day.day, day.month, day.year);
                    
                    return (
                      <div 
                        key={`day-cancel-${index}`} 
                        className={`calendario-day 
                          ${!day.isCurrentMonth ? 'other-month' : ''} 
                          ${isSelected ? 'selected' : ''} 
                          ${isDisponible ? 'disponible' : 'disabled'}
                          ${isCancelada ? 'cancelled' : ''}
                        `}
                        onClick={() => selectDay(day.day, day.month, day.year, false)}
                        style={{
                          cursor: isDisponible && !isCancelada ? 'pointer' : 'default',
                          color: !day.isCurrentMonth ? '#adb5bd' : 
                                 isCancelada ? '#a94442' :
                                 isDisponible ? '#000' : '#adb5bd',
                          backgroundColor: isSelected ? '#0d47a1' : 
                                           isCancelada ? '#f8d7da' : 
                                           isDisponible ? '#d4edda' : 'transparent'
                        }}
                      >
                        {day.day}
                      </div>
                    );
                  })}
                </div>
                
                <div className="form-group">
                  <label htmlFor="motivo_cancelar">Motivo</label>
                  <input
                    type="text"
                    id="motivo_cancelar"
                    name="motivo"
                    placeholder="Ingrese el motivo"
                    value={cancelacion.motivo}
                    onChange={(e) => setCancelacion({...cancelacion, motivo: e.target.value})}
                    required
                  />
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowCancelarModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                  >
                    Cancelar día
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExcepcionesPage;