const db = require("../models/db");
const Model = require("../models/profesionalesModel");

const ProfesionalesController = {
  crear: async (req, res) => {
    try {
      const id = await Model.crear(req.body);
      res.status(201).json({ profesional_id: id });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: "Ya existe un profesional con esta cédula." });
      }
      console.error("Error al crear profesional:", err);
      res.status(500).json({ error: "Error al crear profesional" });
    }
  },  

  listar: async (req, res) => {
    try {
      const soloActivos = req.query.soloActivos !== 'false';
      const profesionales = await Model.listar(soloActivos);
      res.json(profesionales);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener profesionales" });
    }
  },

  cambiarEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { activo } = req.body;
      
      if (typeof activo !== 'boolean') {
        return res.status(400).json({ error: "El parámetro 'activo' debe ser un valor booleano" });
      }
      
      const profesional = await Model.cambiarEstado(id, activo);
      
      if (!profesional) {
        return res.status(404).json({ error: "Profesional no encontrado" });
      }
      
      res.json({ 
        mensaje: `Profesional ${activo ? 'activado' : 'archivado'} correctamente`,
        profesional
      });
    } catch (err) {
      console.error("Error al cambiar estado del profesional:", err);
      res.status(500).json({ error: "Error al cambiar estado del profesional" });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { cedula, nombre, apellido, especialidad_id, telefono, correo } = req.body;
      
      // Con PATCH, solo validamos que al menos un campo esté presente
      const camposActualizar = { cedula, nombre, apellido, especialidad_id, telefono, correo };
      const camposConValor = Object.entries(camposActualizar).filter(([key, value]) => value !== undefined && value !== null && value !== '');
      
      if (camposConValor.length === 0) {
        return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar" });
      }
      
      // Validaciones de campos críticos si están presentes
      if (cedula !== undefined && !cedula) {
        return res.status(400).json({ error: "La cédula no puede estar vacía" });
      }
      if (nombre !== undefined && !nombre) {
        return res.status(400).json({ error: "El nombre no puede estar vacío" });
      }
      if (apellido !== undefined && !apellido) {
        return res.status(400).json({ error: "El apellido no puede estar vacío" });
      }
      
      const profesional = await Model.actualizar(id, {
        cedula,
        nombre,
        apellido,
        especialidad_id,
        telefono,
        correo
      });
      
      if (!profesional) {
        return res.status(404).json({ error: "Profesional no encontrado" });
      }
      
      res.json({ 
        mensaje: "Profesional actualizado correctamente",
        profesional
      });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: "Ya existe un profesional con esta cédula." });
      }
      console.error("Error al actualizar profesional:", err);
      res.status(500).json({ error: "Error al actualizar profesional" });
    }
  },

  asignarCategorias: async (req, res) => {
    const { profesional_id, categorias } = req.body;

    try {
      await db.query("DELETE FROM profesional_categoria WHERE profesional_id = $1", [profesional_id]);

      for (const id_categoria of categorias) {
        await db.query(
          "INSERT INTO profesional_categoria (profesional_id, id_categoria) VALUES ($1, $2)",
          [profesional_id, id_categoria]
        );
      }

      res.json({ mensaje: "Categorías actualizadas" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al asignar categorías" });
    }
  },

  asignarServicios: async (req, res) => {
    const { profesional_id, servicios } = req.body;

    try {
      await db.query("DELETE FROM profesional_servicio WHERE profesional_id = $1", [profesional_id]);

      for (const id_servicio of servicios) {
        await db.query(
          "INSERT INTO profesional_servicio (profesional_id, id_servicio) VALUES ($1, $2)",
          [profesional_id, id_servicio]
        );
      }

      res.json({ mensaje: "Servicios actualizados" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al asignar servicios" });
    }
  },

  obtenerCategoriasYServicios: async (req, res) => {
    const { id } = req.params;
    try {
      const categorias = await db.query(
        `SELECT id_categoria FROM profesional_categoria WHERE profesional_id = $1`,
        [id]
      );
      const servicios = await db.query(
        `SELECT id_servicio FROM profesional_servicio WHERE profesional_id = $1`,
        [id]
      );

      res.json({
        categorias: categorias.rows.map(r => r.id_categoria),
        servicios: servicios.rows.map(r => r.id_servicio)
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener relaciones" });
    }
  }
};

module.exports = ProfesionalesController;
