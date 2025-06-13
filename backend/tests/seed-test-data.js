const { sequelize } = require('../src/models');
const bcrypt = require('bcrypt');

// Script para poblar la BD con datos de prueba completos
async function seedTestData() {
  try {
    console.log('🌱 Iniciando seed de datos de prueba...');

    // 1. LIMPIAR DATOS EXISTENTES (en orden correcto por FK)
    await sequelize.query('TRUNCATE TABLE detalles_pedido CASCADE');
    await sequelize.query('TRUNCATE TABLE detalles_carrito CASCADE');
    await sequelize.query('TRUNCATE TABLE carritos CASCADE');
    await sequelize.query('TRUNCATE TABLE pedidos CASCADE');
    await sequelize.query('TRUNCATE TABLE productos CASCADE');
    await sequelize.query('TRUNCATE TABLE vendedores CASCADE');
    await sequelize.query('TRUNCATE TABLE usuario_rol CASCADE');
    await sequelize.query('TRUNCATE TABLE usuarios CASCADE');
    await sequelize.query('TRUNCATE TABLE categorias CASCADE');
    await sequelize.query('TRUNCATE TABLE estados_pedido CASCADE');
    await sequelize.query('TRUNCATE TABLE metodos_pago CASCADE');
    await sequelize.query('TRUNCATE TABLE roles CASCADE');
    await sequelize.query('TRUNCATE TABLE mesas CASCADE');

    // 2. INSERTAR ROLES
    await sequelize.query(`
      INSERT INTO roles (rol_id, nombre, descripcion) VALUES 
      (1, 'admin', 'Administrador del sistema'),
      (2, 'vendedor', 'Vendedor de la cafetería'),
      (3, 'cliente', 'Cliente de la cafetería')
    `);

    // 3. INSERTAR ESTADOS DE PEDIDO
    await sequelize.query(`
      INSERT INTO estados_pedido (estado_pedido_id, nombre, descripcion) VALUES 
      (1, 'pendiente', 'Pedido pendiente de preparación'),
      (2, 'preparando', 'Pedido en preparación'),
      (3, 'listo', 'Pedido listo para entregar'),
      (4, 'entregado', 'Pedido entregado al cliente'),
      (5, 'cancelado', 'Pedido cancelado')
    `);

    // 4. INSERTAR MÉTODOS DE PAGO
    await sequelize.query(`
      INSERT INTO metodos_pago (metodo_pago_id, nombre, descripcion) VALUES 
      (1, 'efectivo', 'Pago en efectivo'),
      (2, 'tarjeta', 'Pago con tarjeta de crédito/débito'),
      (3, 'transferencia', 'Transferencia bancaria'),
      (4, 'app_movil', 'Pago por aplicación móvil')
    `);

    // 5. INSERTAR CATEGORÍAS
    await sequelize.query(`
      INSERT INTO categorias (categoria_id, nombre, descripcion) VALUES 
      (1, 'bebidas_calientes', 'Café, té, chocolate caliente'),
      (2, 'bebidas_frias', 'Jugos, smoothies, bebidas heladas'),
      (3, 'comida_salada', 'Sandwiches, ensaladas, platos principales'),
      (4, 'postres', 'Pasteles, galletas, dulces'),
      (5, 'snacks', 'Aperitivos y bocadillos')
    `);

    // 6. INSERTAR MESAS
    await sequelize.query(`
      INSERT INTO mesas (mesa_id, numero, capacidad, estado, activa) VALUES 
      (1, '1', 2, 'disponible', true),
      (2, '2', 4, 'disponible', true),
      (3, '3', 2, 'disponible', true),
      (4, '4', 6, 'disponible', true),
      (5, '5', 4, 'ocupada', true),
      (6, '6', 2, 'disponible', true)
    `);

    // 7. INSERTAR USUARIOS
    const passwordHash = await bcrypt.hash('password123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);
    
    await sequelize.query(`
      INSERT INTO usuarios (usuario_id, nombre, apellido, email, password_hash, telefono, activo) VALUES 
      (1, 'Admin', 'Sistema', 'admin@cafeteria.com', '${adminHash}', '555-0001', true),
      (2, 'Juan', 'Pérez', 'juan@example.com', '${passwordHash}', '555-0002', true),
      (3, 'María', 'García', 'maria@example.com', '${passwordHash}', '555-0003', true),
      (4, 'Carlos', 'López', 'carlos@example.com', '${passwordHash}', '555-0004', true),
      (5, 'Ana', 'Martínez', 'ana@example.com', '${passwordHash}', '555-0005', true),
      (6, 'Usuario', 'Inactivo', 'inactivo@example.com', '${passwordHash}', '555-0006', false)
    `);

    // 8. ASIGNAR ROLES A USUARIOS
    await sequelize.query(`
      INSERT INTO usuario_rol (usuario_id, rol_id) VALUES 
      (1, 1),  -- Admin es admin
      (1, 2),  -- Admin también es vendedor
      (2, 3),  -- Juan es cliente
      (3, 3),  -- María es cliente
      (4, 2),  -- Carlos es vendedor
      (5, 3),  -- Ana es cliente
      (6, 3)   -- Usuario inactivo es cliente
    `);

    // 8.5. INSERTAR VENDEDORES
    await sequelize.query(`
      INSERT INTO vendedores (vendedor_id, usuario_id, nombre, apellido, email, password_hash, telefono, activo) VALUES 
      (1, 1, 'Admin', 'Sistema', 'admin@cafeteria.com', '${adminHash}', '555-0001', true),
      (2, 4, 'Carlos', 'López', 'carlos@example.com', '${passwordHash}', '555-0004', true)
    `);

    // 9. INSERTAR PRODUCTOS
    await sequelize.query(`
      INSERT INTO productos (producto_id, categoria_id, nombre, descripcion, precio, stock, disponible, vendedor_id) VALUES 
      -- Bebidas Calientes
      (1, 1, 'Café Americano', 'Café negro tradicional', 2500, 100, true, 1),
      (2, 1, 'Café Latte', 'Café con leche espumosa', 3500, 80, true, 1),
      (3, 1, 'Cappuccino', 'Café con espuma de leche', 3200, 75, true, 1),
      (4, 1, 'Té Verde', 'Té verde natural', 2000, 50, true, 2),
      (5, 1, 'Chocolate Caliente', 'Chocolate cremoso', 3000, 40, false, 2),
      
      -- Bebidas Frías
      (6, 2, 'Jugo de Naranja', 'Jugo natural de naranja', 2800, 60, true, 1),
      (7, 2, 'Smoothie de Fresa', 'Batido de fresa con yogurt', 4000, 30, true, 1),
      (8, 2, 'Café Frappé', 'Café helado con crema', 4500, 25, true, 2),
      (9, 2, 'Limonada', 'Limonada natural', 2200, 45, true, 2),
      
      -- Comida Salada
      (10, 3, 'Sandwich Club', 'Sandwich de pollo, tocino y vegetales', 6500, 20, true, 1),
      (11, 3, 'Ensalada César', 'Ensalada con pollo y aderezo césar', 5800, 15, true, 1),
      (12, 3, 'Wrap Vegetariano', 'Wrap con vegetales frescos', 5200, 18, true, 2),
      (13, 3, 'Pasta Alfredo', 'Pasta con salsa alfredo', 7200, 12, false, 2),
      
      -- Postres
      (14, 4, 'Cheesecake', 'Pastel de queso con frutos rojos', 4200, 8, true, 1),
      (15, 4, 'Brownie', 'Brownie de chocolate', 3500, 15, true, 1),
      (16, 4, 'Tiramisu', 'Postre italiano tradicional', 4800, 6, true, 2),
      
      -- Snacks
      (17, 5, 'Croissant', 'Croissant de mantequilla', 2800, 25, true, 1),
      (18, 5, 'Muffin Arándanos', 'Muffin con arándanos frescos', 3200, 20, true, 2),
      (19, 5, 'Galletas Chocolate', 'Galletas con chips de chocolate', 2500, 30, true, 1),
      (20, 5, 'Producto Sin Stock', 'Producto para testing', 1000, 0, false, 2)
    `);

    // 10. CREAR CARRITOS
    await sequelize.query(`
      INSERT INTO carritos (carrito_id, usuario_id) VALUES 
      (1, 2),   -- Juan tiene carrito
      (2, 3),   -- María tiene carrito
      (3, 4),   -- Carlos tiene carrito
      (4, 5)    -- Ana tiene carrito
    `);

    // 11. AGREGAR PRODUCTOS A CARRITOS
    await sequelize.query(`
      INSERT INTO detalles_carrito (carrito_id, producto_id, cantidad) VALUES 
      -- Carrito de Juan
      (1, 1, 2),  -- 2 Café Americano
      (1, 14, 1), -- 1 Cheesecake
      
      -- Carrito de María
      (2, 2, 1),  -- 1 Café Latte
      (2, 10, 1), -- 1 Sandwich Club
      (2, 17, 2), -- 2 Croissant
      
      -- Carrito de Ana
      (4, 6, 1),  -- 1 Jugo de Naranja
      (4, 15, 1)  -- 1 Brownie
    `);

    // 12. CREAR PEDIDOS
    await sequelize.query(`
      INSERT INTO pedidos (pedido_id, usuario_id, estado_pedido_id, metodo_pago_id, subtotal, impuestos, total, notas) VALUES 
      (1, 2, 4, 1, 8400, 800, 9200, 'Sin azúcar en el café'),
      (2, 3, 3, 2, 14700, 1400, 16100, 'Para llevar'),
      (3, 4, 2, 1, 5000, 500, 5500, 'Urgente'),
      (4, 5, 1, 3, 5700, 600, 6300, 'Mesa junto a la ventana'),
      (5, 2, 5, 1, 3200, 300, 3500, 'Pedido cancelado por cliente')
    `);

    // 13. AGREGAR DETALLES DE PEDIDOS
    await sequelize.query(`
      INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES 
      -- Pedido 1 (Juan - Entregado)
      (1, 1, 2, 2500, 5000),
      (1, 14, 1, 4200, 4200),
      
      -- Pedido 2 (María - Listo)
      (2, 2, 1, 3500, 3500),
      (2, 10, 1, 6500, 6500),
      (2, 17, 2, 2800, 5600),
      (2, 6, 1, 2800, 2800),
      
      -- Pedido 3 (Carlos - Preparando)
      (3, 3, 1, 3200, 3200),
      (3, 18, 1, 3200, 3200),
      
      -- Pedido 4 (Ana - Pendiente)
      (4, 7, 1, 4000, 4000),
      (4, 15, 1, 3500, 3500),
      
      -- Pedido 5 (Juan - Cancelado)
      (5, 2, 1, 3500, 3500)
    `);

    console.log('✅ Datos de prueba insertados exitosamente');
    console.log('📊 Resumen de datos creados:');
    console.log('   - 3 Roles');
    console.log('   - 5 Estados de pedido');
    console.log('   - 4 Métodos de pago');
    console.log('   - 5 Categorías');
    console.log('   - 6 Mesas');
    console.log('   - 6 Usuarios (1 admin, 1 vendedor, 4 clientes)');
    console.log('   - 20 Productos (variados por categoría)');
    console.log('   - 4 Carritos con productos');
    console.log('   - 5 Pedidos en diferentes estados');
    console.log('   - Detalles completos de carritos y pedidos');

  } catch (error) {
    console.error('❌ Error al insertar datos de prueba:', error);
    throw error;
  }
}

module.exports = { seedTestData };

// Ejecutar si se llama directamente
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('🎯 Seed completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en seed:', error);
      process.exit(1);
    });
} 