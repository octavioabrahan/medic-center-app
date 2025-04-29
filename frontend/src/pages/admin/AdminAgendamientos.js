import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./CitasAgendadas.css";
import Filters from "../../components/admin/Filters";
import AppointmentsTable from "../../components/admin/AppointmentsTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ModalHistorial from "../../components/admin/ModalHistorial";

const TODOS_LOS_ESTADOS = ["pendiente", "confirmada", "cancelada"];

const AdminAgendamientos = () => {
  const [searchParams, setSearchParams] = useState(new URLSearchParams());
  const [searchTerm, setSearchTerm] = useState("");
  const [profesionales, setProfesionales] = useState([]);
  const [filtroProfesional, setFiltroProfesional] = useState("todos");

  const status = searchParams.get("status")?.trim() || TODOS_LOS_ESTADOS.join(",");
  const desde = searchParams.get("desde") || null;
  const hasta = searchParams.get("hasta") || null;

  const [dateRange, setDateRange] = useState({
    from: desde ? new Date(desde) : new Date(),
    to: hasta ? new Date(hasta) : new Date(),
  });
  const [startDate, setStartDate] = useState(dateRange.from);
  const [endDate, setEndDate] = useState(dateRange.to);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [historialDe, setHistorialDe] = useState(null);

  const [agendamientos, setAgendamientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgendamientos = async () => {
      try {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (desde) params.append("desde", desde);
        if (hasta) params.append("hasta", hasta);

        const url = `${process.env.REACT_APP_API_URL}/api/agendamiento?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Failed to fetch appointments");
        }
        const data = await res.json();
        setAgendamientos(data);

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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/agendamiento/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nuevoEstado }),
      });
      if (!res.ok) {
        throw new Error("Failed to update status");
      }
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

  const cerrarHistorial = () => {
    setMostrarHistorial(false);
    setHistorial([]);
    setHistorialDe(null);
  };

  const agendamientosFiltrados = agendamientos.filter((a) => {
    const matchesSearch =
      searchTerm === "" ||
      `${a.paciente_nombre} ${a.paciente_apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cedula?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProfesional =
      filtroProfesional === "todos" ||
      `${a.profesional_nombre} ${a.profesional_apellido}` === filtroProfesional;

    const fechaCita = new Date(a.fecha_agendada);
    const matchesFecha =
      !startDate ||
      !endDate ||
      (fechaCita >= startDate && fechaCita <= endDate);

    return matchesSearch && matchesProfesional && matchesFecha;
  });

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  useEffect(() => {
    if (dateRange.from) {
      setStartDate(dateRange.from);
    }
    if (dateRange.to) {
      setEndDate(dateRange.to);
    }
  }, [dateRange]);

  return (
    <div className="citas-container">
      <h2 className="page-title">Citas agendadas</h2>

      <Filters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        status={status}
        handleFiltro={handleFiltro}
        dateRange={dateRange}
        toggleDatePicker={toggleDatePicker}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        handleDateRangeChange={setDateRange}
        profesionales={profesionales}
        filtroProfesional={filtroProfesional}
        setFiltroProfesional={setFiltroProfesional}
      />

      {loading ? (
        <LoadingSpinner message="Cargando citas..." />
      ) : (
        <AppointmentsTable
          agendamientos={agendamientosFiltrados}
          actualizarEstado={actualizarEstado}
          setMostrarHistorial={setMostrarHistorial}
          setHistorial={setHistorial}
          setHistorialDe={setHistorialDe}
        />
      )}

      {mostrarHistorial && (
        <ModalHistorial
          historial={historial}
          historialDe={historialDe}
          cerrarHistorial={cerrarHistorial}
        />
      )}
    </div>
  );
};

export default AdminAgendamientos;