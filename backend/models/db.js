const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'centro_medico',
  password: 'OctavioySarai2019', // <- contraseña vacía
  port: 5432,
});

module.exports = pool;

