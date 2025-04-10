import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const ProfesionalAsignarServicios = () => {
  const { id } = useParams(); // profesionalId desde URL
  const [categorias, setCategorias] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [seleccionadasCat, setSeleccionadasCat] = useState([]);
  const [seleccionadasServ, setSeleccionadasServ] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resCats, resServs, resActuales] = await Promise.all([
          axios.get("/api/categorias"),
          axios.get("/api/servicios"),
          axios.get(`/api/profesionales/relaciones/${id}`)
        ]);

        setCategorias(resCats.data);
        setServicios(resServs.data);
        setSeleccionadasCat(resActuales.data.categorias);
        setSeleccionadasServ(resActuales.data.servicios);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };

    cargarDatos();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/profesionales/asignar-categorias", {
        profesional_id: id,
        categorias: seleccionadasCat
      });

      await axios.post("/api/profesionales/asignar-servicios", {
        profesional_id: id,
        servicios: seleccionadasServ
      });

      alert("Relaciones actualizadas correctamente.");
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error al guardar los cambios.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Asignar Categorías</h2>
      <select
        multiple
        value={seleccionadasCat}
        onChange={(e) =>
          setSeleccionadasCat([...e.target.selectedOptions].map(o => Number(o.value)))
        }
      >
        {categorias.map(cat => (
          <option key={cat.id_categoria} value={cat.id_categoria}>
            {cat.nombre_categoria}
          </option>
        ))}
      </select>

      <h2>Asignar Servicios</h2>
      <select
        multiple
        value={seleccionadasServ}
        onChange={(e) =>
          setSeleccionadasServ([...e.target.selectedOptions].map(o => Number(o.value)))
        }
      >
        {servicios.map(serv => (
          <option key={serv.id_servicio} value={serv.id_servicio}>
            {serv.nombre_servicio}
          </option>
        ))}
      </select>

      <button type="submit">Guardar</button>
    </form>
  );
};

export default ProfesionalAsignarServicios;
