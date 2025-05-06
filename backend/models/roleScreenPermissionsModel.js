const db = require("./db");

const RoleScreenPermissionsModel = {
  asignar: async ({ id_rol, id_screen, can_view, created_by }) => {
    const query = `
      INSERT INTO role_screen_permissions (id_rol, id_screen, can_view, created_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id_rol, id_screen) 
      DO UPDATE SET can_view = $3, created_by = $4
      RETURNING *
    `;
    const result = await db.query(query, [id_rol, id_screen, can_view, created_by]);
    return result.rows[0];
  },
  
  eliminar: async (id_rol, id_screen) => {
    const query = `
      DELETE FROM role_screen_permissions 
      WHERE id_rol = $1 AND id_screen = $2
    `;
    await db.query(query, [id_rol, id_screen]);
  },
  
  obtenerPorRol: async (id_rol) => {
    const query = `
      SELECT rsp.*, s.name, s.description, s.path, s.icon, s.orden
      FROM role_screen_permissions rsp
      JOIN screens s ON rsp.id_screen = s.id_screen
      WHERE rsp.id_rol = $1
      ORDER BY s.orden ASC
    `;
    const result = await db.query(query, [id_rol]);
    return result.rows;
  },
  
  pantallasPorUsuario: async (user_id) => {
    const query = `
      SELECT DISTINCT s.id_screen, s.name, s.description, s.path, s.icon, s.orden
      FROM screens s
      JOIN role_screen_permissions rsp ON s.id_screen = rsp.id_screen
      JOIN admin_user_roles aur ON rsp.id_rol = aur.id_rol
      WHERE aur.user_id = $1 AND rsp.can_view = true AND s.is_active = true
      ORDER BY s.orden ASC
    `;
    const result = await db.query(query, [user_id]);
    return result.rows;
  },

  // Función para verificar si el superadmin y admin pueden ver todas las pantallas
  asignarTodasPantallasARol: async (id_rol, created_by) => {
    const query = `
      INSERT INTO role_screen_permissions (id_rol, id_screen, can_view, created_by)
      SELECT $1, id_screen, true, $2
      FROM screens
      ON CONFLICT (id_rol, id_screen) 
      DO UPDATE SET can_view = true, created_by = $2
    `;
    await db.query(query, [id_rol, created_by]);
  }
};

module.exports = RoleScreenPermissionsModel;