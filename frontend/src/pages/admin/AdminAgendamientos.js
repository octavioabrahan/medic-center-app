import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const TODOS_LOS_ESTADOS = ["pendiente", "confirmada", "cancelada"];

const AdminAgendamientos = () => {
  const [agendamientos, setAgendamientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [historialDe, setHistorialDe] = useState(null);

  const status =
    searchParams.get("status")?.trim() || TODOS_LOS_ESTADOS.join(",");
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
      } catch (err) {
        console.error("Error al obtener agendamientos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamientos();
  }, [status, desde, hasta]);

  const actualizarEstado = async (id, nuevoEstado) => {
    const confirmar = window.confirm(
      `¿Confirmar cambio de estado a "${nuevoEstado}"?`
    );
    if (!confirmar) return;

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

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Administración de Agendamientos</h2>

      {/* Filtros */}
      <div style={{ margin: "1rem 0" }}>
        <label>
          Estado:
          <select name="status" value={status || ""} onChange={handleFiltro}>
            <option value="">Todos</option>
            {TODOS_LOS_ESTADOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: "1rem" }}>
          Desde:
          <input
            type="date"
            name="desde"
            value={desde || ""}
            onChange={handleFiltro}
          />
        </label>
        <label style={{ marginLeft: "1rem" }}>
          Hasta:
          <input
            type="date"
            name="hasta"
            value={hasta || ""}
            onChange={handleFiltro}
          />
        </label>
      </div>

      {/* Tabla */}
      {loading ? (
        <p>Cargando agendamientos...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Profesional</th>
              <th>Fecha</th>
              <th>Tipo Atención</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {agendamientos.map((a) => (
              <tr key={a.agendamiento_id}>
                <td>
                  {a.paciente_nombre} {a.paciente_apellido}
                </td>
                <td>{a.paciente_email || "-"}</td>
                <td>{a.paciente_telefono || "-"}</td>
                <td>
                  {a.profesional_nombre} {a.profesional_apellido}
                </td>
                <td>{a.fecha_agendada?.split("T")[0]}</td>
                <td>{a.tipo_atencion}</td>
                <td>{a.status}</td>
                <td>
                  {a.status === "pendiente" && (
                    <>
                      <button
                        onClick={() =>
                          actualizarEstado(a.agendamiento_id, "confirmada")
                        }
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() =>
                          actualizarEstado(a.agendamiento_id, "cancelada")
                        }
                        style={{ marginLeft: "0.5rem" }}
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  {a.status === "cancelada" && (
                    <button
                      onClick={() =>
                        actualizarEstado(a.agendamiento_id, "pendiente")
                      }
                    >
                      Volver a activar
                    </button>
                  )}
                  <br />
                  <button
                    onClick={() => abrirHistorial(a.agendamiento_id)}
                    style={{ marginTop: "0.5rem" }}
                  >
                    Historial
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal historial */}
      {mostrarHistorial && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: "8px",
              width: "600px",
              maxHeight: "80vh",
              overflowY: "auto"
            }}
          >
            <h3>Historial de Agendamiento #{historialDe}</h3>
            <table border="1" cellPadding="6" style={{ width: "100%" }}>
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
                    <td>{new Date(h.fecha_cambio).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: "1rem", textAlign: "right" }}>
              <button onClick={cerrarHistorial}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgendamientos;
