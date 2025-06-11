const db = require('../config/db');

/**
 * Esta función verifica que todas las tablas necesarias existan en la base de datos
 * según el diagrama de tablas.
 */
const setupDatabase = async () => {
  try {
    await db.query('SELECT NOW()');
    
    const tablasRequeridas = [
      'usuarios',
      'direcciones', 
      'vendedores',
      'categorias',
      'productos',
      'imagenes_producto',
      'carritos',
      'detalles_carrito',
      'metodos_pago',
      'estados_pedido',
      'pedidos',
      'detalles_pedido',
      'reseñas',
      'historial_estado_pedido',
      'roles'
    ];
    
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tablasExistentes = tablesResult.rows.map(row => row.table_name);
    const tablasFaltantes = tablasRequeridas.filter(tabla => !tablasExistentes.includes(tabla));
    
    if (tablasFaltantes.length > 0) {
      return {
        success: false,
        message: 'Faltan tablas en la base de datos',
        tablasFaltantes
      };
    }
    
    return {
      success: true,
      message: 'Base de datos verificada correctamente',
      tablas: tablasExistentes
    };
  } catch (error) {
    throw new Error(`Error al verificar la base de datos: ${error.message}`);
  }
};

module.exports = setupDatabase; 