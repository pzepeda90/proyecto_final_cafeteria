const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cafeteria_l_bandito',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

pool.on('connect', () => {
  console.log('Conectado a la base de datos PostgreSQL: cafeteria_l_bandito');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente PostgreSQL', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}; 