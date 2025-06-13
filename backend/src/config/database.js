module.exports = {
  development: {
    username: process.env.DB_USER || 'patriciozepeda',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'cafeteria_l_bandito',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  },
  test: {
    username: process.env.DB_USER || 'patriciozepeda',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'cafeteria_l_bandito',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  }
}; 