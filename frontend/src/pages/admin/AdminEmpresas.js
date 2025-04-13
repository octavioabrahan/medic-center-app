import React, { useEffect, useState } from "react";

const AdminEmpresas = () => {
  const [nombre, setNombre] = useState("");
  const [rif, setRif] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [cambios, setCambios] = useState({});

  const cargarEmpresas = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/empresas`);
      const data = await res.json();
      setEmpresas(data);
    } catch (err) {
      console.error("Error al cargar empresas", err);
    }
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al registrar la empresa");
      }

      setNombre("");
      setRif("");
      setMensaje("Empresa registrada correctamente.");
      cargarEmpresas();
    } catch (err) {
      setError(err.message || "Error inesperado.");
    }
  };

  const iniciarEdicion = (empresa) => {
    setEditando(empresa.id_empresa);
    setCambios({
      nombre_empresa: empresa.nombre_empresa,
      rif: empresa.rif
    });
  };

  const guardarCambios = async (id_empresa) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/empresas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_empresa,
          nombre_empresa: cambios.nombre_empresa,
          rif: cambios.rif
        })
      });

      if (!res.ok) throw new Error("Error al actualizar");

      setEditando(null);
      setCambios({});
      cargarEmpresas();
    } catch (err) {
      alert("No se pudo guardar los cambios.");
    }
  };

  const desactivarEmpresa = async (id_empresa) => {
    const confirmar = window.confirm("¿Desactivar esta empresa?");
    if (!confirmar) return;

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/empresas/${id_empresa}`, {
        method: "DELETE"
      });
      cargarEmpresas();
    } catch (err) {
      alert("Error al desactivar empresa.");
    }
  };

  const activarEmpresa = async (id_empresa) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/empresas/${id_empresa}/activar`, {
        method: "PATCH"
      });
      cargarEmpresas();
    } catch (err) {
      alert("Error al activar empresa.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Registro de Empresas</h2>

      {/* Formulario */}
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

      {/* Tabla de empresas */}
      <h3 style={{ marginTop: "3rem" }}>Empresas registradas</h3>
      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>RIF</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map((e) => (
            <tr key={e.id_empresa}>
              <td>
                {editando === e.id_empresa ? (
                  <input
                    value={cambios.nombre_empresa}
                    onChange={(ev) =>
                      setCambios({ ...cambios, nombre_empresa: ev.target.value })
                    }
                  />
                ) : (
                  e.nombre_empresa
                )}
              </td>
              <td>
                {editando === e.id_empresa ? (
                  <input
                    value={cambios.rif}
                    onChange={(ev) =>
                      setCambios({ ...cambios, rif: ev.target.value })
                    }
                  />
                ) : (
                  e.rif
                )}
              </td>
              <td>{e.activa ? "Activa" : "Desactivada"}</td>
              <td>
                {editando === e.id_empresa ? (
                  <>
                    <button onClick={() => guardarCambios(e.id_empresa)}>
                      Guardar
                    </button>
                    <button onClick={() => setEditando(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => iniciarEdicion(e)}>Editar</button>
                    {e.activa ? (
                      <button
                        onClick={() => desactivarEmpresa(e.id_empresa)}
                        style={{ marginLeft: "0.5rem" }}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => activarEmpresa(e.id_empresa)}
                        style={{ marginLeft: "0.5rem" }}
                      >
                        Activar
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminEmpresas;
