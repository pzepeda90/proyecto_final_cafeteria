const db = require('../config/db');

/**
 * Esta función verifica que todas las tablas necesarias existan en la base de datos
 * según el diagrama de tablas.
 */
const setupDatabase = async () => {
  try {
    // Verificar conexión a la base de datos
    const result = await db.query('SELECT NOW()');
    console.log('Conexión a base de datos verificada:', result.rows[0].now);
    
    // Lista de tablas que deben existir según el diagrama
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
    
    // Verificar si la estructura de la base de datos existe
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tablasExistentes = tablesResult.rows.map(row => row.table_name);
    
    console.log('Tablas existentes en la base de datos:', tablasExistentes.join(', '));
    
    // Verificar que todas las tablas requeridas existan
    const tablasFaltantes = tablasRequeridas.filter(tabla => !tablasExistentes.includes(tabla));
    
    if (tablasFaltantes.length > 0) {
      console.error('⚠️ ADVERTENCIA: Faltan las siguientes tablas en la base de datos:', tablasFaltantes.join(', '));
      console.error('Las tablas faltantes deben ser creadas según el diagrama de la base de datos');
      return {
        success: false,
        message: 'Faltan tablas en la base de datos',
        tablasFaltantes
      };
    }
    
    console.log('✅ Todas las tablas requeridas están presentes en la base de datos');
    
    return {
      success: true,
      message: 'Base de datos verificada correctamente',
      tablas: tablasExistentes
    };
  } catch (error) {
    console.error('Error al verificar la base de datos:', error);
    throw error;
  }
};

module.exports = { setupDatabase }; 