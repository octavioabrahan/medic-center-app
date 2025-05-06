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

// Envolver el pool con funciones útiles
const db = {
  /**
   * Ejecuta una consulta SQL en la base de datos
   * @param {string} text - Consulta SQL
   * @param {Array} params - Parámetros para la consulta
   */
  query: (text, params) => {
    return pool.query(text, params);
  },

  /**
   * Obtiene un cliente desde el pool para una transacción
   * @returns {Promise<pg.PoolClient>} Cliente SQL para transacciones
   */
  getClient: async () => {
    const client = await pool.connect();
    return client;
  }
};

module.exports = db;

