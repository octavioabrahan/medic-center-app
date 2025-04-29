import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminCitas.css";

const AdminCitas = () => {
  const [citas, setCitas] = useState([]);
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [profesionales, setProfesionales] = useState([]);
  const [selectedProfesional, setSelectedProfesional] = useState("todos");
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  useEffect(() => {
    fetchCitas();
    fetchProfesionales();
  }, []);

  useEffect(() => {
    filterCitas();
  }, [searchTerm, statusFilter, selectedProfesional, dateRange, citas]);

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

  const filterCitas = () => {
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
        (cita) => cita.profesional_id === parseInt(selectedProfesional)
      );
    }

    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(
        (cita) =>
          new Date(cita.fecha_cita) >= new Date(dateRange.from) &&
          new Date(cita.fecha_cita) <= new Date(dateRange.to)
      );
    }

    setFilteredCitas(filtered);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`/api/agendamientos/${id}`, { status: newStatus });
      setCitas((prev) =>
        prev.map((cita) =>
          cita.id === id ? { ...cita, estado: newStatus } : cita
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-citas-container">
      <h1>Administración de Citas</h1>
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Buscar por paciente o cédula..."
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
        <select
          value={selectedProfesional}
          onChange={(e) => setSelectedProfesional(e.target.value)}
        >
          <option value="todos">Todos los profesionales</option>
          {profesionales.map((prof) => (
            <option key={prof.profesional_id} value={prof.profesional_id}>
              {prof.nombre} {prof.apellido}
            </option>
          ))}
        </select>
        <div className="date-range">
          <label>Desde:</label>
          <input
            type="date"
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
          />
          <label>Hasta:</label>
          <input
            type="date"
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
          />
        </div>
      </div>
      {loading ? (
        <p>Cargando citas...</p>
      ) : (
        <table className="citas-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Cédula</th>
              <th>Profesional</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCitas.map((cita) => (
              <tr key={cita.id}>
                <td>{formatDate(cita.fecha_cita)}</td>
                <td>{cita.paciente}</td>
                <td>{cita.cedula}</td>
                <td>{cita.profesional}</td>
                <td>
                  <span className={`status-badge ${cita.estado}`}>
                    {cita.estado}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-confirm"
                    onClick={() => handleStatusChange(cita.id, "confirmada")}
                  >
                    Confirmar
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => handleStatusChange(cita.id, "cancelada")}
                  >
                    Cancelar
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
