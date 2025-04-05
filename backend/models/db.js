const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'centro_medico',
  password: 'O4SK5eG6EeT6ka', // <- contraseña vacía
  port: 5432,
});

module.exports = pool;

