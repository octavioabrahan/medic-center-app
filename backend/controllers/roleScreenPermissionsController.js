const RoleScreenPermissionsModel = require("../models/roleScreenPermissionsModel");
const logger = require("../utils/logger");

const RoleScreenPermissionsController = {
  asignarPantallas: async (req, res) => {
    try {
      const { id_rol, pantallas, created_by } = req.body;
      
      // Eliminar permisos existentes para este rol
      // y luego asignar los nuevos permisos
      for (const pantalla of pantallas) {
        await RoleScreenPermissionsModel.asignar({
          id_rol,
          id_screen: pantalla.id_screen,
          can_view: pantalla.can_view,
          created_by: created_by || req.user.email
        });
      }
      
      res.json({ mensaje: "Permisos de pantallas actualizados correctamente" });
    } catch (err) {
      logger.logError('Error al asignar pantallas a rol', err);
      res.status(500).json({ error: "Error al actualizar permisos de pantallas" });
    }
  },
  
  obtenerPorRol: async (req, res) => {
    try {
      const { id_rol } = req.params;
      const pantallas = await RoleScreenPermissionsModel.obtenerPorRol(id_rol);
      res.json(pantallas);
    } catch (err) {
      logger.logError('Error al obtener pantallas de rol', err);
      res.status(500).json({ error: "Error al obtener pantallas" });
    }
  },
  
  pantallasPorUsuario: async (req, res) => {
    try {
      const user_id = req.user.id;
      const pantallas = await RoleScreenPermissionsModel.pantallasPorUsuario(user_id);
      res.json(pantallas);
    } catch (err) {
      logger.logError('Error al obtener pantallas de usuario', err);
      res.status(500).json({ error: "Error al obtener pantallas" });
    }
  },

  asignarTodasPantallasARol: async (req, res) => {
    try {
      const { id_rol } = req.params;
      const created_by = req.user.email;
      
      await RoleScreenPermissionsModel.asignarTodasPantallasARol(id_rol, created_by);
      
      res.json({ mensaje: "Todas las pantallas asignadas al rol correctamente" });
    } catch (err) {
      logger.logError('Error al asignar todas las pantallas a rol', err);
      res.status(500).json({ error: "Error al asignar pantallas" });
    }
  }
};

module.exports = RoleScreenPermissionsController;