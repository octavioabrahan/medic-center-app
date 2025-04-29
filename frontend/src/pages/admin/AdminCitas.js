import React, { useEffect, useState } from "react";
import Calendar from "../../components/common/Calendar";
import "./AdminCitas.css";
import axios from "axios";

const AdminCitas = () => {
  const [citas, setCitas] = useState([]);
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [profesionales, setProfesionales] = useState([]);
  const [selectedProfesional, setSelectedProfesional] = useState("todos");
  const [dateRange, setDateRange] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchCitas = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/agendamientos");
        setCitas(response.data);
        setFilteredCitas(response.data);
      } catch (error) {
        console.error("Error fetching citas:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfesionales = async () => {
      try {
        const response = await axios.get("/api/profesionales");
        setProfesionales(response.data);
      } catch (error) {
        console.error("Error fetching profesionales:", error);
      }
    };

    fetchCitas();
    fetchProfesionales();
  }, []);

  useEffect(() => {
    let filtered = [...citas];

    if (searchTerm) {
      filtered = filtered.filter(
        (cita) =>
          cita.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cita.cedula.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter((cita) => cita.estado === statusFilter);
    }

    if (selectedProfesional !== "todos") {
      filtered = filtered.filter(
        (cita) => cita.profesional === selectedProfesional
      );
    }

    if (dateRange) {
      filtered = filtered.filter(
        (cita) =>
          new Date(cita.fecha_cita) >= dateRange.from &&
          new Date(cita.fecha_cita) <= dateRange.to
      );
    }

    setFilteredCitas(filtered);
  }, [searchTerm, statusFilter, selectedProfesional, dateRange, citas]);

  const handleStatusChange = (id, newStatus) => {
    axios
      .patch(`/api/agendamientos/${id}`, { status: newStatus })
      .then(() => {
        setCitas((prev) =>
          prev.map((cita) =>
            cita.id === id ? { ...cita, estado: newStatus } : cita
          )
        );
      })
      .catch((error) => console.error("Error updating status:", error));
  };

  return (
    <div className="admin-citas-container">
      <h1>Citas Agendadas</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nombre o cédula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <div className="calendar-filter">
          <button onClick={() => setShowCalendar(!showCalendar)}>
            {dateRange
              ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
              : "Seleccionar rango de fechas"}
          </button>
          {showCalendar && (
            <Calendar
              onDateRangeChange={(range) => {
                setDateRange(range);
                setShowCalendar(false);
              }}
              title="Seleccionar rango de fechas"
            />
          )}
        </div>
        <select
          value={selectedProfesional}
          onChange={(e) => setSelectedProfesional(e.target.value)}
        >
          <option value="todos">Todos los profesionales</option>
          {profesionales.map((prof) => (
            <option key={prof.profesional_id} value={prof.nombre}>
              {prof.nombre} {prof.apellido}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p>Cargando citas...</p>
      ) : (
        <table className="citas-table">
          <thead>
            <tr>
              <th>Fecha cita</th>
              <th>Paciente</th>
              <th>Cédula</th>
              <th>Categoría</th>
              <th>Profesional</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCitas.map((cita) => (
              <tr key={cita.id}>
                <td>{new Date(cita.fecha_cita).toLocaleString("es-ES")}</td>
                <td>{cita.paciente}</td>
                <td>{cita.cedula}</td>
                <td>{cita.categoria}</td>
                <td>{cita.profesional}</td>
                <td>
                  <span className={`estado ${cita.estado}`}>
                    {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                  </span>
                </td>
                <td>
                  <button
                    className="confirm-btn"
                    onClick={() => handleStatusChange(cita.id, "confirmada")}
                  >
                    ✔
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => handleStatusChange(cita.id, "cancelada")}
                  >
                    ✖
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminCitas;
