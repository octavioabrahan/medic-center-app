import React, { useState } from "react";

const AdminEmpresas = () => {
  const [nombre, setNombre] = useState("");
  const [rif, setRif] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    if (!nombre || !rif) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/empresas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_empresa: nombre, rif })
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Error al registrar la empresa");
      }

      setNombre("");
      setRif("");
      setMensaje("Empresa registrada correctamente.");
    } catch (err) {
      setError(err.message || "Error inesperado.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Registro de Empresas</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Nombre de la empresa:{" "}
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            RIF:{" "}
            <input
              type="text"
              value={rif}
              onChange={(e) => setRif(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <button type="submit">Registrar Empresa</button>
      </form>

      {mensaje && <p style={{ color: "green", marginTop: "1rem" }}>{mensaje}</p>}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
};

export default AdminEmpresas;
