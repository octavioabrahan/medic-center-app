const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'centro_medico',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  // Configuraciones adicionales de seguridad
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;

