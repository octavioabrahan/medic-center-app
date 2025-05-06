const AdminUsersModel = require("../models/adminUsersModel");
const AdminUserRolesModel = require("../models/adminUserRolesModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// Obtener la clave secreta del entorno o usar una por defecto (solo para desarrollo)
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_insegura';
const TOKEN_EXPIRY = '8h'; // Tiempo de expiración del token

const AdminUsersController = {
  /**
   * Registra un nuevo usuario administrativo
   */
  registro: async (req, res) => {
    try {
      console.log("=== INICIO DE REGISTRO DE USUARIO ===");
      console.log("Headers:", req.headers);
      console.log("Usuario autenticado:", req.user);
      console.log("Body recibido:", req.body);
      
      const { email, password, name, last_name, roles } = req.body;
      
      // Verificar que se haya especificado al menos un rol
      // Ahora aceptamos el campo 'roles' que viene del frontend
      if (!roles || !Array.isArray(roles) || roles.length === 0) {
        console.log("Error: No se especificaron roles");
        return res.status(400).json({ error: "Debe asignar al menos un rol al usuario" });
      }
      
      // Verificar si el usuario ya existe
      const existingUser = await AdminUsersModel.obtenerPorEmail(email);
      if (existingUser) {
        console.log("Error: El correo ya está registrado");
        return res.status(409).json({ error: "El correo electrónico ya está registrado" });
      }
      
      // Validar complejidad de la contraseña
      if (!validatePassword(password)) {
        console.log("Error: La contraseña no cumple los requisitos");
        return res.status(400).json({ 
          error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial" 
        });
      }

      console.log("Iniciando transacción para crear usuario");
      // Usar transacción para garantizar que se creen tanto el usuario como su rol
      const db = require("../models/db");
      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');
        console.log("Transacción iniciada");
        
        // Crear el usuario
        console.log("Creando usuario en la base de datos");
        const usuario = await AdminUsersModel.crearConCliente(client, { 
          email, password, name, last_name 
        });
        console.log("Usuario creado:", usuario);
        
        // Asignar todos los roles seleccionados
        for (const roleId of roles) {
          try {
            console.log(`Asignando rol ${roleId} al usuario ${usuario.id}`);
            await AdminUserRolesModel.asignarConCliente(client, {
              user_id: usuario.id,
              id_rol: roleId,
              created_by: req.user ? req.user.email : 'sistema'
            });
            console.log(`Rol ${roleId} asignado correctamente`);
          } catch (rolError) {
            // Si falla la asignación de rol, seguimos con los demás
            console.error(`Error al asignar rol ${roleId}:`, rolError);
            logger.logError(`Error al asignar el rol ${roleId} al usuario`, rolError);
          }
        }
        
        console.log("Confirmando transacción");
        await client.query('COMMIT');
        console.log("Transacción confirmada exitosamente");
        
        logger.logSecurity('Usuario administrativo creado con roles', {
          userId: usuario.id,
          email: usuario.email,
          roles: roles,
          createdBy: req.user ? req.user.email : 'sistema'
        });
        
        console.log("Enviando respuesta al cliente");
        res.status(201).json({
          mensaje: "Usuario creado exitosamente",
          usuario: {
            id: usuario.id,
            email: usuario.email,
            name: usuario.name,
            last_name: usuario.last_name,
            roles: roles
          }
        });
        console.log("=== FIN DE REGISTRO DE USUARIO ===");
      } catch (err) {
        console.error("Error durante la transacción:", err);
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("ERROR CRÍTICO en registro:", err);
      logger.logError('Error al registrar usuario administrativo', err);
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  },

  /**
   * Inicia sesión de un usuario administrativo
   */
  login: async (req, res) => {
    try {
      console.log("=== INICIO DE PETICIÓN DE LOGIN ===");
      console.log("Body recibido:", req.body);
      const { email, password } = req.body;
      
      console.log("Datos de login:", { email, passwordLength: password ? password.length : 0 });
      
      // Obtener usuario por email
      const usuario = await AdminUsersModel.obtenerPorEmail(email);
      
      console.log("¿Usuario encontrado?:", !!usuario);
      
      // Si no existe el usuario o está desactivado
      if (!usuario) {
        console.log("Usuario no existe en la base de datos");
        logger.logSecurity('Intento de inicio de sesión con usuario inexistente', { email, ip: req.ip });
        return res.status(401).json({ error: "Credenciales inválidas" });
      }
      
      console.log("Estado del usuario:", { 
        id: usuario.id,
        isActive: usuario.is_active,
        failedAttempts: usuario.failed_login_attempts,
        lockedUntil: usuario.locked_until
      });
      
      if (!usuario.is_active) {
        console.log("Cuenta desactivada");
        logger.logSecurity('Intento de inicio de sesión con cuenta desactivada', { 
          userId: usuario.id, email, ip: req.ip 
        });
        return res.status(401).json({ error: "Esta cuenta ha sido desactivada" });
      }
      
      // Verificar si la cuenta está bloqueada
      if (usuario.locked_until && new Date(usuario.locked_until) > new Date()) {
        console.log("Cuenta bloqueada hasta:", usuario.locked_until);
        logger.logSecurity('Intento de inicio de sesión con cuenta bloqueada', { 
          userId: usuario.id, email, ip: req.ip 
        });
        return res.status(401).json({ 
          error: "Cuenta bloqueada temporalmente por múltiples intentos fallidos", 
          lockExpiry: usuario.locked_until
        });
      }

      // Verificar contraseña
      console.log("Verificando contraseña...");
      console.log("Hash almacenado:", usuario.password_hash);
      
      // Intentar verificar la contraseña con bcrypt
      try {
        const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
        console.log("Resultado de verificación:", passwordMatch);
        
        if (!passwordMatch) {
          console.log("Contraseña incorrecta");
          // Registrar intento fallido
          const intento = await AdminUsersModel.registrarIntentoFallido(email);
          
          logger.logSecurity('Intento de inicio de sesión fallido', {
            userId: usuario.id, 
            email, 
            ip: req.ip,
            attemptCount: intento.failed_login_attempts
          });
          
          if (intento.failed_login_attempts >= 5) {
            return res.status(401).json({
              error: "Cuenta bloqueada temporalmente por múltiples intentos fallidos",
              lockExpiry: intento.locked_until
            });
          }
          
          return res.status(401).json({ error: "Credenciales inválidas" });
        }
      } catch (bcryptError) {
        console.error("Error en bcrypt.compare:", bcryptError);
        return res.status(500).json({ error: "Error al verificar credenciales" });
      }
      
      console.log("Autenticación exitosa, obteniendo roles...");
      
      // Obtener los roles del usuario
      const roles = await AdminUserRolesModel.rolesDeUsuario(usuario.id);
      const roleNames = roles.map(r => r.nombre_rol);
      
      console.log("Roles:", roleNames);
      
      // Registrar inicio de sesión exitoso
      await AdminUsersModel.registrarLoginExitoso(usuario.id);
      
      // Generar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email,
          name: usuario.name,
          roles: roleNames
        }, 
        JWT_SECRET, 
        { expiresIn: TOKEN_EXPIRY }
      );
      
      console.log("Token generado correctamente");
      logger.logSecurity('Inicio de sesión exitoso', {
        userId: usuario.id,
        email: usuario.email,
        roles: roleNames,
        ip: req.ip
      });
      
      console.log("Enviando respuesta al cliente");
      res.json({
        token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          name: usuario.name,
          last_name: usuario.last_name,
          roles: roleNames
        }
      });
      console.log("=== FIN DE PETICIÓN DE LOGIN ===");
    } catch (err) {
      console.error("ERROR CRÍTICO en login:", err);
      logger.logError('Error en inicio de sesión', err);
      res.status(500).json({ error: "Error al iniciar sesión", details: err.message });
    }
  },

  /**
   * Obtiene el perfil del usuario actual
   */
  perfil: async (req, res) => {
    try {
      const usuario = await AdminUsersModel.obtenerPorId(req.user.id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      
      // Obtener los roles del usuario
      const roles = await AdminUserRolesModel.rolesDeUsuario(usuario.id);
      
      res.json({
        id: usuario.id,
        email: usuario.email,
        name: usuario.name,
        last_name: usuario.last_name,
        roles: roles,
        last_login: usuario.last_login,
        created_at: usuario.created_at
      });
    } catch (err) {
      logger.logError('Error al obtener perfil de usuario', err);
      res.status(500).json({ error: "Error al obtener información del perfil" });
    }
  },

  /**
   * Lista todos los usuarios administrativos
   */
  listar: async (req, res) => {
    try {
      const usuarios = await AdminUsersModel.listar();
      
      // Para cada usuario, obtener sus roles
      const usuariosConRoles = await Promise.all(usuarios.map(async (usuario) => {
        const roles = await AdminUserRolesModel.rolesDeUsuario(usuario.id);
        return { ...usuario, roles };
      }));
      
      res.json(usuariosConRoles);
    } catch (err) {
      logger.logError('Error al listar usuarios administrativos', err);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  },

  /**
   * Actualiza un usuario administrativo
   */
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, last_name, is_active } = req.body;
      
      const usuario = await AdminUsersModel.actualizar(id, { name, last_name, is_active });
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      
      logger.logGeneral('Usuario administrativo actualizado', {
        userId: id,
        updatedBy: req.user.email
      });
      
      res.json({ 
        mensaje: "Usuario actualizado exitosamente",
        usuario 
      });
    } catch (err) {
      logger.logError('Error al actualizar usuario administrativo', err);
      res.status(500).json({ error: "Error al actualizar usuario" });
    }
  },

  /**
   * Cambia la contraseña de un usuario
   */
  cambiarPassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      
      // Solo el propio usuario puede cambiar su contraseña, a menos que sea un superadmin
      const isSuperAdmin = await AdminUserRolesModel.tieneRol(req.user.id, 'superadmin');
      if (id !== req.user.id && !isSuperAdmin) {
        logger.logSecurity('Intento no autorizado de cambio de contraseña', {
          userId: req.user.id,
          targetUserId: id
        });
        return res.status(403).json({ error: "No está autorizado para cambiar esta contraseña" });
      }
      
      // Validar complejidad de la contraseña
      if (!validatePassword(newPassword)) {
        return res.status(400).json({ 
          error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial" 
        });
      }
      
      // Si no es superadmin, verificar la contraseña actual
      if (!isSuperAdmin) {
        const usuario = await AdminUsersModel.obtenerPorId(id);
        const passwordMatch = await bcrypt.compare(currentPassword, usuario.password_hash);
        
        if (!passwordMatch) {
          logger.logSecurity('Intento fallido de cambio de contraseña', {
            userId: id,
            reason: 'Contraseña actual incorrecta'
          });
          return res.status(401).json({ error: "La contraseña actual es incorrecta" });
        }
      }
      
      await AdminUsersModel.cambiarPassword(id, newPassword);
      
      logger.logSecurity('Contraseña cambiada exitosamente', {
        userId: id,
        changedBy: req.user.email
      });
      
      res.json({ mensaje: "Contraseña actualizada exitosamente" });
    } catch (err) {
      logger.logError('Error al cambiar contraseña', err);
      res.status(500).json({ error: "Error al cambiar contraseña" });
    }
  },

  /**
   * Elimina un usuario administrativo
   */
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si se está intentando eliminar al superadmin
      const esSuperAdmin = await AdminUserRolesModel.tieneRol(id, 'superadmin');
      if (esSuperAdmin) {
        return res.status(403).json({ error: "No se puede eliminar una cuenta de superadmin" });
      }
      
      await AdminUsersModel.eliminar(id);
      
      logger.logSecurity('Usuario administrativo eliminado', {
        deletedUserId: id,
        deletedBy: req.user.email
      });
      
      res.json({ mensaje: "Usuario eliminado exitosamente" });
    } catch (err) {
      logger.logError('Error al eliminar usuario administrativo', err);
      res.status(500).json({ error: "Error al eliminar usuario" });
    }
  }
};

/**
 * Valida la complejidad de la contraseña
 */
function validatePassword(password) {
  // Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

module.exports = AdminUsersController;