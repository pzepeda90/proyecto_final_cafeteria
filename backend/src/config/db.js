const { Pool } = require('pg');
require('dotenv').config();

// Configuración para producción con DATABASE_URL (Render) o variables individuales
const dbConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
} : {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cafeteria_l_bandito',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || process.env.DB_PASSWORD || 'postgres'
};

const pool = new Pool(dbConfig);

pool.on('connect', () => {
  const dbName = process.env.DB_NAME || 'cafeteria_l_bandito';
  const environment = process.env.NODE_ENV || 'development';
  console.log(`✅ Conectado a PostgreSQL [${dbName}] - Ambiente: ${environment}`);
});

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente PostgreSQL', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}; 