import React, { useEffect, useState } from "react";
import axios from "axios";

const ProfesionalAsignarServicios = ({ profesionalId }) => {
  const [categorias, setCategorias] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [seleccionadasCat, setSeleccionadasCat] = useState([]);
  const [seleccionadasServ, setSeleccionadasServ] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const [cats, servs, actuales] = await Promise.all([
        axios.get("/api/categorias"),
        axios.get("/api/servicios"),
        axios.get(`/api/profesionales/relaciones/${profesionalId}`)
      ]);

      setCategorias(cats.data);
      setServicios(servs.data);
      setSeleccionadasCat(actuales.data.categorias);
      setSeleccionadasServ(actuales.data.servicios);
    };

    cargarDatos();
  }, [profesionalId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/profesionales/asignar-categorias", {
      profesional_id: profesionalId,
      categorias: seleccionadasCat
    });
    await axios.post("/api/profesionales/asignar-servicios", {
      profesional_id: profesionalId,
      servicios: seleccionadasServ
    });
    alert("Actualizado correctamente");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Categorías</h2>
      <select multiple value={seleccionadasCat} onChange={(e) =>
        setSeleccionadasCat([...e.target.selectedOptions].map(o => Number(o.value)))
      }>
        {categorias.map(c => (
          <option key={c.id_categoria} value={c.id_categoria}>
            {c.nombre_categoria}
          </option>
        ))}
      </select>

      <h2>Servicios</h2>
      <select multiple value={seleccionadasServ} onChange={(e) =>
        setSeleccionadasServ([...e.target.selectedOptions].map(o => Number(o.value)))
      }>
        {servicios.map(s => (
          <option key={s.id_servicio} value={s.id_servicio}>
            {s.nombre_servicio}
          </option>
        ))}
      </select>

      <button type="submit">Guardar</button>
    </form>
  );
};

export default ProfesionalAsignarServicios;
