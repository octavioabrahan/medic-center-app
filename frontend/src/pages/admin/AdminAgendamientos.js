// frontend/src/pages/admin/AdminAgendamientosModificado.js
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./CitasAgendadas.css";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { es } from "date-fns/locale";

const TODOS_LOS_ESTADOS = ["pendiente", "confirmada", "cancelada"];

const CitasAgendadas = () => {
  const [agendamientos, setAgendamientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [profesionales, setProfesionales] = useState([]);
  const [filtroProfesional, setFiltroProfesional] = useState("todos");
  const [dateRange, setDateRange] = useState([startOfWeek(new Date()), endOfWeek(new Date())]);
  const [startDate, endDate] = dateRange;
  const [showDatePicker, setShowDatePicker] = useState(false); // Toggle for DayPicker visibility

  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [historialDe, setHistorialDe] = useState(null);

  const [filterStatus, setFilterStatus] = useState("todos");
  const [filteredAgendamientos, setFilteredAgendamientos] = useState([]);

  const status = searchParams.get("status")?.trim() || TODOS_LOS_ESTADOS.join(",");
  const desde = searchParams.get("desde") || null;
  const hasta = searchParams.get("hasta") || null;

  useEffect(() => {
    const fetchAgendamientos = async () => {
      try {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (desde) params.append("desde", desde);
        if (hasta) params.append("hasta", hasta);

        const url = `${process.env.REACT_APP_API_URL}/api/agendamiento?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        setAgendamientos(data);
        
        // Extraer lista de profesionales únicos
        const uniqueProfesionales = [...new Set(data.map(a => `${a.profesional_nombre} ${a.profesional_apellido}`))];
        setProfesionales(uniqueProfesionales);
      } catch (err) {
        console.error("Error al obtener agendamientos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamientos();
  }, [status, desde, hasta]);

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/agendamiento/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nuevoEstado }),
      });
      setAgendamientos((prev) =>
        prev.map((a) =>
          a.agendamiento_id === id ? { ...a, status: nuevoEstado } : a
        )
      );
    } catch (err) {
      alert("Error al actualizar estado");
    }
  };

  const handleFiltro = (e) => {
    const newParams = new URLSearchParams(searchParams);

    if (e.target.name === "status" && e.target.value === "") {
      newParams.set("status", TODOS_LOS_ESTADOS.join(","));
    } else {
      newParams.set(e.target.name, e.target.value);
    }

    setSearchParams(newParams);
  };

  const abrirHistorial = async (id) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/agendamiento/${id}/historial`
      );
      const data = await res.json();
      setHistorial(data);
      setHistorialDe(id);
      setMostrarHistorial(true);
    } catch (err) {
      alert("Error al obtener historial");
    }
  };

  const cerrarHistorial = () => {
    setMostrarHistorial(false);
    setHistorial([]);
    setHistorialDe(null);
  };

  // Filtrar agendamientos según el término de búsqueda y profesional seleccionado
  const agendamientosFiltrados = agendamientos.filter(a => {
    const matchesSearch = searchTerm === "" || 
      `${a.paciente_nombre} ${a.paciente_apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cedula?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesProfesional = filtroProfesional === "todos" || 
      `${a.profesional_nombre} ${a.profesional_apellido}` === filtroProfesional;
      
    return matchesSearch && matchesProfesional;
  });

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const formatDateRange = () => {
    if (!startDate || !endDate) return "Seleccionar fechas";
    return `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;
  };

  return (
    <div className="citas-container">
      <h2 className="page-title">Citas agendadas</h2>
      
      <div className="citas-filters">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="filter-group">
          <select 
            name="status"
            value={status || ""}
            onChange={handleFiltro}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            {TODOS_LOS_ESTADOS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          
          <div className="date-picker-wrapper">
            <button className="date-picker-toggle" onClick={toggleDatePicker}>
              {formatDateRange()}
            </button>
            {showDatePicker && (
              <div className="date-picker-dropdown">
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  locale={es}
                />
              </div>
            )}
          </div>
          
          <select 
            value={filtroProfesional} 
            onChange={(e) => setFiltroProfesional(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos los profesionales</option>
            {profesionales.map((prof, index) => (
              <option key={index} value={prof}>{prof}</option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">Cargando citas...</div>
      ) : (
        <div className="citas-table-container">
          <table className="citas-table">
            <thead>
              <tr>
                <th>Fecha cita</th>
                <th>Paciente</th>
                <th>Cédula</th>
                <th>Categoría</th>
                <th>Profesional</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {agendamientosFiltrados.map((a) => {
                const formatoFecha = formatearFecha(a.fecha_agendada);
                
                return (
                  <tr key={a.agendamiento_id} className={`cita-row ${a.status}`}>
                    <td className="fecha-cell">
                      <div className="calendar-icon">📅</div>
                      <div>
                        <div>{formatoFecha.fecha}</div>
                        <div className="hora">{formatoFecha.hora}</div>
                      </div>
                    </td>
                    <td>{a.paciente_nombre} {a.paciente_apellido}</td>
                    <td>{a.cedula}</td>
                    <td>{a.tipo_atencion}</td>
                    <td>{a.profesional_nombre} {a.profesional_apellido}</td>
                    <td>
                      <span className={`estado-badge ${a.status}`}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => actualizarEstado(a.agendamiento_id, "confirmada")}
                        className="action-btn confirm-btn"
                        title="Confirmar"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => actualizarEstado(a.agendamiento_id, "cancelada")}
                        className="action-btn cancel-btn"
                        title="Cancelar"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal historial */}
      {mostrarHistorial && (
        <div className="historial-modal">
          <div className="historial-content">
            <h3>Historial de Agendamiento #{historialDe}</h3>
            <table className="historial-table">
              <thead>
                <tr>
                  <th>Anterior</th>
                  <th>Nuevo</th>
                  <th>Quién</th>
                  <th>Cuándo</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h) => (
                  <tr key={h.historial_id}>
                    <td>{h.estado_anterior}</td>
                    <td>{h.estado_nuevo}</td>
                    <td>{h.cambiado_por}</td>
                    <td>{new Date(h.fecha).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="historial-actions">
              <button onClick={cerrarHistorial} className="close-btn">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitasAgendadas;