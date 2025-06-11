const { pool } = require('../config/db');

async function insertTestAddress() {
  try {
    const result = await pool.query(`
      INSERT INTO direcciones (
        usuario_id, 
        calle, 
        numero, 
        ciudad, 
        comuna, 
        codigo_postal, 
        pais, 
        principal
      ) VALUES (
        3, 
        'Av. Providencia', 
        '1234', 
        'Santiago', 
        'Providencia', 
        '7500000', 
        'Chile', 
        true
      ) RETURNING *;
    `);

    console.log('Dirección insertada:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error al insertar dirección:', error);
    process.exit(1);
  }
}

insertTestAddress(); 