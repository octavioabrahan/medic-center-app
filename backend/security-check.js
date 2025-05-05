/**
 * Script de verificación de seguridad pre-despliegue
 * Ejecutar antes de desplegar a producción para verificar configuraciones
 * Uso: node security-check.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Cargar variables de entorno
dotenv.config();

console.log('🔐 Iniciando verificación de seguridad pre-despliegue...\n');

let errors = 0;
let warnings = 0;
const securityIssues = [];

// Función para reportar problemas
function reportIssue(message, isError = true) {
  const prefix = isError ? '❌ ERROR' : '⚠️ ADVERTENCIA';
  securityIssues.push(`${prefix}: ${message}`);
  
  if (isError) errors++;
  else warnings++;
}

// 1. Verificar existencia y configuración de variables de entorno críticas
console.log('📋 Verificando variables de entorno...');
const requiredEnvVars = [
  { name: 'DB_USER', error: true },
  { name: 'DB_HOST', error: true },
  { name: 'DB_NAME', error: true },
  { name: 'DB_PASSWORD', error: true },
  { name: 'JWT_SECRET', error: true },
  { name: 'ENCRYPTION_KEY', error: true },
  { name: 'NODE_ENV', error: false }
];

requiredEnvVars.forEach(({ name, error }) => {
  if (!process.env[name]) {
    reportIssue(`Variable de entorno ${name} no está definida`, error);
  } else if ((name === 'JWT_SECRET' || name === 'DB_PASSWORD') && process.env[name].length < 12) {
    reportIssue(`La variable ${name} parece ser demasiado corta/débil`, error);
  }
});

// 2. Verificar si estamos en modo producción y las configuraciones apropiadas
if (process.env.NODE_ENV === 'production') {
  console.log('📋 Verificando configuración de producción...');
  
  // Verificar que CORS esté configurado correctamente
  if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') {
    reportIssue('CORS_ORIGIN no está configurado o permite todos los orígenes (*) en producción', true);
  }
  
  // Verificar que JWT_EXPIRY no sea demasiado largo
  if (process.env.JWT_EXPIRY && process.env.JWT_EXPIRY.match(/\d+[hd]/)) {
    const value = parseInt(process.env.JWT_EXPIRY);
    const unit = process.env.JWT_EXPIRY.slice(-1);
    
    if ((unit === 'h' && value > 24) || (unit === 'd' && value > 1)) {
      reportIssue('JWT_EXPIRY está configurado para un período demasiado largo en producción', false);
    }
  }
  
  // Verificar fortaleza de ENCRYPTION_KEY
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 64) {
    reportIssue('ENCRYPTION_KEY no parece ser lo suficientemente larga para AES-256', true);
  }
}

// 3. Verificar estructura de directorios de seguridad
console.log('📋 Verificando estructura de directorios...');
const requiredDirs = [
  { path: 'logs', create: true },
  { path: 'backups/logs', create: true },
  { path: 'middleware', create: false }
];

requiredDirs.forEach(({ path: dirPath, create }) => {
  const fullPath = path.join(__dirname, dirPath);
  
  if (!fs.existsSync(fullPath)) {
    if (create) {
      try {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`  ✅ Creado directorio: ${dirPath}`);
      } catch (err) {
        reportIssue(`No se pudo crear el directorio ${dirPath}: ${err.message}`, true);
      }
    } else {
      reportIssue(`Directorio ${dirPath} no encontrado`, true);
    }
  }
});

// 4. Verificar archivos de middleware de seguridad
console.log('📋 Verificando middleware de seguridad...');
const requiredFiles = [
  'middleware/auth.js',
  'middleware/security.js',
  'middleware/validator.js',
  'utils/logger.js',
  'utils/encryption.js',
  'utils/passwordUtils.js'
];

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  
  if (!fs.existsSync(fullPath)) {
    reportIssue(`Archivo de seguridad ${file} no encontrado`, true);
  } else {
    console.log(`  ✅ Encontrado: ${file}`);
  }
});

// 5. Verificar configuraciones de paquetes de seguridad en package.json
console.log('📋 Verificando dependencias de seguridad...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const requiredPackages = ['helmet', 'express-rate-limit', 'bcrypt', 'jsonwebtoken', 'dotenv'];
  
  requiredPackages.forEach(pkg => {
    if (!packageJson.dependencies[pkg] && !packageJson.devDependencies?.[pkg]) {
      reportIssue(`Paquete de seguridad ${pkg} no está instalado`, true);
    } else {
      console.log(`  ✅ Instalado: ${pkg}`);
    }
  });
} catch (err) {
  reportIssue(`No se pudo leer package.json: ${err.message}`, true);
}

// 6. Verificar .gitignore para asegurar que no se suban archivos sensibles
console.log('📋 Verificando .gitignore...');
try {
  const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
  const requiredIgnores = ['.env', 'logs/', 'backups/'];
  
  requiredIgnores.forEach(ignore => {
    if (!gitignore.includes(ignore)) {
      reportIssue(`${ignore} no está incluido en .gitignore`, false);
    } else {
      console.log(`  ✅ .gitignore contiene: ${ignore}`);
    }
  });
} catch (err) {
  reportIssue(`No se pudo leer .gitignore: ${err.message}`, false);
}

// Mostrar resultados
console.log('\n📊 Resultado de la verificación de seguridad:');

if (securityIssues.length === 0) {
  console.log('\n✅ ¡Todas las verificaciones de seguridad pasaron correctamente!');
} else {
  securityIssues.forEach(issue => {
    console.log(`\n${issue}`);
  });
  
  console.log(`\n🛑 Se encontraron ${errors} errores y ${warnings} advertencias de seguridad.`);
  
  if (errors > 0) {
    console.log('⚠️  Debe corregir estos problemas antes de desplegar a producción.');
  }
}

// Salir con código adecuado para integración con scripts de CI/CD
process.exit(errors > 0 ? 1 : 0);