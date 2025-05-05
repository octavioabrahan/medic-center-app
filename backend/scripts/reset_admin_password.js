/**
 * Script para resetear la contraseña del usuario admin
 * 
 * Este script actualiza directamente la contraseña del usuario admin en la base de datos
 * usando la misma configuración de conexión que el resto de la aplicación.
 * 
 * Uso: node scripts/reset_admin_password.js
 */

// Cargar variables de entorno primero
require('dotenv').config();

const bcrypt = require('bcrypt');
const db = require('../models/db'); // Usar la misma conexión que usa toda la aplicación

async function resetAdminPassword() {
  try {
    console.log('Iniciando proceso de reseteo de contraseña para el usuario admin...');
    
    // Email del usuario admin que queremos actualizar
    const email = 'admin@clinica.com';
    
    // Nueva contraseña que queremos establecer
    const newPassword = 'Admin123!';
    
    // Generar el hash de la nueva contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('Hash generado:', passwordHash);
    
    // Actualizar la contraseña en la base de datos
    const result = await db.query(
      `UPDATE admin_users 
       SET password_hash = $1, 
           failed_login_attempts = 0, 
           locked_until = NULL,
           updated_at = NOW()
       WHERE email = $2
       RETURNING id, email, name`,
      [passwordHash, email]
    );
    
    if (result.rows.length === 0) {
      console.error(`Usuario con email ${email} no encontrado`);
      return;
    }
    
    const user = result.rows[0];
    console.log(`Contraseña actualizada exitosamente para el usuario: ${user.name} (${user.email})`);
    console.log('Ahora puede iniciar sesión con la nueva contraseña: Admin123!');
    
  } catch (err) {
    console.error('Error al resetear la contraseña:', err);
  } finally {
    // Cerrar la conexión para que el script pueda terminar
    process.exit(0);
  }
}

resetAdminPassword();