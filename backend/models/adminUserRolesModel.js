const db = require("./db");

const AdminUserRolesModel = {
  /**
   * Asigna un rol a un usuario administrativo
   */
  asignar: async ({ user_id, id_rol, created_by }) => {
    const query = `
      INSERT INTO admin_user_roles (user_id, id_rol, created_by)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, id_rol
    `;
    const result = await db.query(query, [user_id, id_rol, created_by]);
    
    // Nota: Se ha eliminado la inserción en admin_role_changes ya que la tabla no existe
    
    return result.rows[0];
  },

  /**
   * Asigna un rol a un usuario administrativo usando un cliente de transacción
   */
  asignarConCliente: async (client, { user_id, id_rol, created_by }) => {
    const query = `
      INSERT INTO admin_user_roles (user_id, id_rol, created_by)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, id_rol
    `;
    const result = await client.query(query, [user_id, id_rol, created_by]);
    
    // Nota: Se ha eliminado la inserción en admin_role_changes ya que la tabla no existe
    
    return result.rows[0];
  },

  /**
   * Elimina un rol de un usuario administrativo
   */
  eliminar: async ({ user_id, id_rol, created_by }) => {
    const query = `
      DELETE FROM admin_user_roles 
      WHERE user_id = $1 AND id_rol = $2
    `;
    await db.query(query, [user_id, id_rol]);
    
    // Nota: Se ha eliminado la inserción en admin_role_changes ya que la tabla no existe
  },

  /**
   * Elimina un rol de un usuario administrativo usando un cliente de transacción
   */
  eliminarConCliente: async (client, { user_id, id_rol, created_by }) => {
    const query = `
      DELETE FROM admin_user_roles 
      WHERE user_id = $1 AND id_rol = $2
    `;
    await client.query(query, [user_id, id_rol]);
    
    // Nota: Se ha eliminado la inserción en admin_role_changes ya que la tabla no existe
  },

  /**
   * Elimina todos los roles de un usuario
   */
  eliminarTodosLosRoles: async (user_id) => {
    const query = `
      DELETE FROM admin_user_roles 
      WHERE user_id = $1
    `;
    await db.query(query, [user_id]);
  },

  /**
   * Obtiene todos los roles de un usuario
   */
  rolesDeUsuario: async (userId) => {
    const query = `
      SELECT r.id_rol, r.nombre_rol, r.descripcion
      FROM admin_user_roles ur
      JOIN roles r ON ur.id_rol = r.id_rol
      WHERE ur.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  /**
   * Verifica si un usuario tiene un rol específico
   */
  tieneRol: async (userId, rolNombre) => {
    const query = `
      SELECT COUNT(*) as count
      FROM admin_user_roles ur
      JOIN roles r ON ur.id_rol = r.id_rol
      WHERE ur.user_id = $1 AND r.nombre_rol = $2
    `;
    const result = await db.query(query, [userId, rolNombre]);
    return parseInt(result.rows[0].count) > 0;
  },

  /**
   * Lista todos los usuarios con un rol específico
   */
  usuariosConRol: async (rolId) => {
    const query = `
      SELECT u.id, u.email, u.name, u.last_name
      FROM admin_users u
      JOIN admin_user_roles ur ON u.id = ur.user_id
      WHERE ur.id_rol = $1
    `;
    const result = await db.query(query, [rolId]);
    return result.rows;
  }
};

module.exports = AdminUserRolesModel;