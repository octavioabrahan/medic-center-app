const db = require("./db");
const bcrypt = require("bcrypt");

const AdminUsersModel = {
  /**
   * Crea un nuevo usuario administrativo
   */
  crear: async ({ email, password, name, last_name }) => {
    // Hash de la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO admin_users (email, password_hash, name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, last_name
    `;
    const result = await db.query(query, [email, password_hash, name, last_name]);
    return result.rows[0];
  },

  /**
   * Crea un nuevo usuario administrativo usando un cliente de transacción
   */
  crearConCliente: async (client, { email, password, name, last_name }) => {
    // Hash de la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO admin_users (email, password_hash, name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, last_name
    `;
    const result = await client.query(query, [email, password_hash, name, last_name]);
    return result.rows[0];
  },

  /**
   * Obtiene un usuario por su correo electrónico
   */
  obtenerPorEmail: async (email) => {
    const query = `SELECT * FROM admin_users WHERE email = $1`;
    const result = await db.query(query, [email]);
    return result.rows[0];
  },

  /**
   * Obtiene un usuario por su ID
   */
  obtenerPorId: async (id) => {
    const query = `SELECT id, email, name, last_name, is_active, last_login, created_at FROM admin_users WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  /**
   * Lista todos los usuarios administrativos
   */
  listar: async () => {
    const query = `
      SELECT id, email, name, last_name, is_active, last_login, created_at, updated_at 
      FROM admin_users 
      ORDER BY name ASC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  /**
   * Actualiza un usuario administrativo
   */
  actualizar: async (id, { name, last_name, is_active }) => {
    const query = `
      UPDATE admin_users 
      SET name = $2, last_name = $3, is_active = $4
      WHERE id = $1
      RETURNING id, email, name, last_name, is_active
    `;
    const result = await db.query(query, [id, name, last_name, is_active]);
    return result.rows[0];
  },

  /**
   * Cambia la contraseña de un usuario
   */
  cambiarPassword: async (id, newPassword) => {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const query = `
      UPDATE admin_users 
      SET password_hash = $2, failed_login_attempts = 0, locked_until = NULL
      WHERE id = $1
    `;
    await db.query(query, [id, password_hash]);
  },

  /**
   * Registra un intento fallido de inicio de sesión
   */
  registrarIntentoFallido: async (email) => {
    const query = `
      UPDATE admin_users 
      SET failed_login_attempts = failed_login_attempts + 1,
          locked_until = CASE 
                           WHEN failed_login_attempts >= 5 THEN NOW() + INTERVAL '30 minutes'
                           ELSE locked_until
                         END
      WHERE email = $1
      RETURNING failed_login_attempts, locked_until
    `;
    const result = await db.query(query, [email]);
    return result.rows[0];
  },

  /**
   * Registra un inicio de sesión exitoso
   */
  registrarLoginExitoso: async (id) => {
    const query = `
      UPDATE admin_users 
      SET last_login = NOW(), failed_login_attempts = 0, locked_until = NULL
      WHERE id = $1
    `;
    await db.query(query, [id]);
  },

  /**
   * Elimina un usuario administrativo
   */
  eliminar: async (id) => {
    const query = `DELETE FROM admin_users WHERE id = $1`;
    await db.query(query, [id]);
  }
};

module.exports = AdminUsersModel;