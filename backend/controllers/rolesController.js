const Model = require("../models/rolesModel");
const db = require("../models/db");
const logger = require("../utils/logger");

const RolesController = {
  crear: async (req, res) => {
    try {
      const { nombre_rol, descripcion } = req.body;
      await db.query("INSERT INTO roles (nombre_rol, descripcion) VALUES ($1, $2)", [nombre_rol, descripcion]);
      res.status(201).json({ mensaje: "Rol creado" });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: "Este nombre de rol ya existe." });
      }
      logger.logError('Error al crear rol', err);
      res.status(500).json({ error: "Error al crear rol" });
    }
  },

  listar: async (req, res) => {
    try {
      const roles = await Model.listar();
      res.json(roles);
    } catch (err) {
      logger.logError('Error al listar roles', err);
      res.status(500).json({ error: "Error al obtener roles" });
    }
  },

  // Nuevo método para actualizar un rol
  actualizar: async (req, res) => {
    try {
      const { id_rol } = req.params;
      const { nombre_rol, descripcion } = req.body;
      
      const query = `
        UPDATE roles
        SET nombre_rol = $1, descripcion = $2
        WHERE id_rol = $3
        RETURNING *
      `;
      
      const result = await db.query(query, [nombre_rol, descripcion, id_rol]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Rol no encontrado" });
      }
      
      res.json({ mensaje: "Rol actualizado correctamente", rol: result.rows[0] });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: "Este nombre de rol ya existe." });
      }
      logger.logError('Error al actualizar rol', err);
      res.status(500).json({ error: "Error al actualizar rol" });
    }
  },

  // Nuevo método para eliminar un rol
  eliminar: async (req, res) => {
    try {
      const { id_rol } = req.params;
      
      // Verificar si es un rol crítico del sistema
      const checkQuery = `SELECT nombre_rol FROM roles WHERE id_rol = $1`;
      const checkResult = await db.query(checkQuery, [id_rol]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "Rol no encontrado" });
      }
      
      const rolNombre = checkResult.rows[0].nombre_rol;
      if (['superadmin', 'admin'].includes(rolNombre)) {
        return res.status(403).json({ error: "No se pueden eliminar roles críticos del sistema" });
      }
      
      // Eliminar asignaciones de usuarios a este rol
      await db.query('DELETE FROM admin_user_roles WHERE id_rol = $1', [id_rol]);
      
      // Eliminar permisos de pantallas de este rol
      await db.query('DELETE FROM role_screen_permissions WHERE id_rol = $1', [id_rol]);
      
      // Finalmente eliminar el rol
      const result = await db.query('DELETE FROM roles WHERE id_rol = $1', [id_rol]);
      
      res.json({ mensaje: "Rol eliminado correctamente" });
    } catch (err) {
      logger.logError('Error al eliminar rol', err);
      res.status(500).json({ error: "Error al eliminar rol" });
    }
  }
};

module.exports = RolesController;
