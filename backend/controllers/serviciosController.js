const db = require("../models/db");

const ServiciosController = {
  listar: async (req, res) => {
    try {
      const result = await db.query(
        "SELECT id_servicio, nombre_servicio, price_usd, is_recomended, is_active FROM servicio ORDER BY nombre_servicio"
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener servicios" });
    }
  },

  obtenerPorId: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await db.query(
        "SELECT id_servicio, nombre_servicio, price_usd, is_recomended, is_active FROM servicio WHERE id_servicio = $1",
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Servicio no encontrado" });
      }
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener el servicio" });
    }
  },

  crear: async (req, res) => {
    const { nombre_servicio, price_usd, recomendado_primera_consulta } = req.body;
    
    try {
      const result = await db.query(
        "INSERT INTO servicio (nombre_servicio, price_usd, is_recomended, is_active) VALUES ($1, $2, $3, true) RETURNING *",
        [nombre_servicio, price_usd, recomendado_primera_consulta || false]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al crear el servicio" });
    }
  },

  actualizar: async (req, res) => {
    const { id } = req.params;
    const { nombre_servicio, price_usd, recomendado_primera_consulta } = req.body;
    
    try {
      // Verificar que el servicio exista
      const checkResult = await db.query(
        "SELECT * FROM servicio WHERE id_servicio = $1",
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "Servicio no encontrado" });
      }
      
      const result = await db.query(
        `UPDATE servicio 
         SET nombre_servicio = $1, 
             price_usd = $2, 
             is_recomended = $3
         WHERE id_servicio = $4 
         RETURNING *`,
        [nombre_servicio, price_usd, recomendado_primera_consulta || false, id]
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al actualizar el servicio" });
    }
  },

  archivar: async (req, res) => {
    const { id } = req.params;
    
    try {
      // Verificar que el servicio exista
      const checkResult = await db.query(
        "SELECT * FROM servicio WHERE id_servicio = $1",
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "Servicio no encontrado" });
      }
      
      const result = await db.query(
        "UPDATE servicio SET is_active = false WHERE id_servicio = $1 RETURNING *",
        [id]
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al archivar el servicio" });
    }
  },

  desarchivar: async (req, res) => {
    const { id } = req.params;
    
    try {
      // Verificar que el servicio exista
      const checkResult = await db.query(
        "SELECT * FROM servicio WHERE id_servicio = $1",
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "Servicio no encontrado" });
      }
      
      const result = await db.query(
        "UPDATE servicio SET is_active = true WHERE id_servicio = $1 RETURNING *",
        [id]
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al desarchivar el servicio" });
    }
  }
};

module.exports = ServiciosController;
