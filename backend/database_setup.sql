-- =====================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS - CAFETERÍA L'BANDITO
-- =====================================================
-- Este script crea toda la estructura de la base de datos
-- para el sistema de gestión de cafetería
-- 
-- Uso: psql -U usuario -d nombre_base_datos -f database_setup.sql
-- =====================================================

-- Eliminar tablas existentes si existen (en orden correcto por dependencias)
DROP TABLE IF EXISTS imagenes_producto CASCADE;
DROP TABLE IF EXISTS items_carrito CASCADE;
DROP TABLE IF EXISTS carritos CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS vendedores CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS estados_pedido CASCADE;
DROP TABLE IF EXISTS metodos_pago CASCADE;
DROP TABLE IF EXISTS direcciones CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS detalles_pedido CASCADE;
DROP TABLE IF EXISTS historial_estado_pedido CASCADE;
DROP TABLE IF EXISTS mesas CASCADE;

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE usuarios (
    usuario_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (rol IN ('admin', 'vendedor', 'cliente')),
    activo BOOLEAN DEFAULT true,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- =====================================================
-- TABLA: categorias
-- =====================================================
CREATE TABLE categorias (
    categoria_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(500),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para categorias
CREATE INDEX idx_categorias_nombre ON categorias(nombre);
CREATE INDEX idx_categorias_activa ON categorias(activa);

-- =====================================================
-- TABLA: vendedores
-- =====================================================
CREATE TABLE vendedores (
    vendedor_id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_contratacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para vendedores
CREATE INDEX idx_vendedores_usuario_id ON vendedores(usuario_id);
CREATE INDEX idx_vendedores_email ON vendedores(email);
CREATE INDEX idx_vendedores_activo ON vendedores(activo);

-- =====================================================
-- TABLA: productos
-- =====================================================
CREATE TABLE productos (
    producto_id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias(categoria_id) ON DELETE RESTRICT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    imagen_url VARCHAR(500),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    disponible BOOLEAN DEFAULT true,
    vendedor_id INTEGER NOT NULL REFERENCES vendedores(vendedor_id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para productos
CREATE INDEX idx_productos_categoria_id ON productos(categoria_id);
CREATE INDEX idx_productos_vendedor_id ON productos(vendedor_id);
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_disponible ON productos(disponible);
CREATE INDEX idx_productos_precio ON productos(precio);

-- =====================================================
-- TABLA: imagenes_producto
-- =====================================================
CREATE TABLE imagenes_producto (
    imagen_id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(producto_id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    descripcion VARCHAR(255),
    orden INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para imagenes_producto
CREATE INDEX idx_imagenes_producto_id ON imagenes_producto(producto_id);
CREATE INDEX idx_imagenes_orden ON imagenes_producto(orden);

-- =====================================================
-- TABLA: carritos
-- =====================================================
CREATE TABLE carritos (
    carrito_id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'abandonado')),
    total DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para carritos
CREATE INDEX idx_carritos_usuario_id ON carritos(usuario_id);
CREATE INDEX idx_carritos_estado ON carritos(estado);

-- =====================================================
-- TABLA: items_carrito
-- =====================================================
CREATE TABLE items_carrito (
    item_id SERIAL PRIMARY KEY,
    carrito_id INTEGER NOT NULL REFERENCES carritos(carrito_id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(producto_id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para items_carrito
CREATE INDEX idx_items_carrito_id ON items_carrito(carrito_id);
CREATE INDEX idx_items_producto_id ON items_carrito(producto_id);

-- =====================================================
-- TABLA: estados_pedido
-- =====================================================
CREATE TABLE estados_pedido (
    estado_pedido_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para estados_pedido
CREATE INDEX idx_estados_pedido_nombre ON estados_pedido(nombre);
CREATE INDEX idx_estados_pedido_orden ON estados_pedido(orden);

-- =====================================================
-- TABLA: metodos_pago
-- =====================================================
CREATE TABLE metodos_pago (
    metodo_pago_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para metodos_pago
CREATE INDEX idx_metodos_pago_nombre ON metodos_pago(nombre);

-- =====================================================
-- TABLA: mesas
-- =====================================================
CREATE TABLE mesas (
    mesa_id SERIAL PRIMARY KEY,
    numero VARCHAR(10) UNIQUE NOT NULL,
    capacidad INTEGER NOT NULL DEFAULT 4,
    ubicacion VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'reservada', 'fuera_servicio')),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mesas
CREATE INDEX idx_mesas_numero ON mesas(numero);
CREATE INDEX idx_mesas_estado ON mesas(estado);
CREATE INDEX idx_mesas_activa ON mesas(activa);

-- =====================================================
-- TABLA: direcciones
-- =====================================================
CREATE TABLE direcciones (
    direccion_id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    calle VARCHAR(255) NOT NULL,
    numero VARCHAR(50),
    ciudad VARCHAR(100) NOT NULL,
    comuna VARCHAR(100),
    codigo_postal VARCHAR(20),
    pais VARCHAR(50) NOT NULL DEFAULT 'Chile',
    principal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para direcciones
CREATE INDEX idx_direcciones_usuario_id ON direcciones(usuario_id);
CREATE INDEX idx_direcciones_principal ON direcciones(principal);

-- =====================================================
-- TABLA: pedidos
-- =====================================================
CREATE TABLE pedidos (
    pedido_id SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(usuario_id) ON DELETE RESTRICT,
    vendedor_id INTEGER REFERENCES vendedores(vendedor_id) ON DELETE SET NULL,
    estado_pedido_id INTEGER NOT NULL REFERENCES estados_pedido(estado_pedido_id) ON DELETE RESTRICT,
    metodo_pago_id INTEGER NOT NULL REFERENCES metodos_pago(metodo_pago_id) ON DELETE RESTRICT,
    direccion_id INTEGER REFERENCES direcciones(direccion_id) ON DELETE SET NULL,
    mesa_id INTEGER REFERENCES mesas(mesa_id) ON DELETE SET NULL,
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    impuestos DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (impuestos >= 0),
    descuento DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (descuento >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega_estimada TIMESTAMP,
    fecha_entrega_real TIMESTAMP,
    notas TEXT,
    tipo_entrega VARCHAR(20) DEFAULT 'local' CHECK (tipo_entrega IN ('local', 'delivery', 'takeaway')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para pedidos
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_vendedor_id ON pedidos(vendedor_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado_pedido_id);
CREATE INDEX idx_pedidos_mesa_id ON pedidos(mesa_id);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);

-- =====================================================
-- TABLA: detalles_pedido
-- =====================================================
CREATE TABLE detalles_pedido (
    detalle_id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(pedido_id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(producto_id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para detalles_pedido
CREATE INDEX idx_detalles_pedido_id ON detalles_pedido(pedido_id);
CREATE INDEX idx_detalles_producto_id ON detalles_pedido(producto_id);

-- =====================================================
-- TABLA: historial_estado_pedido
-- =====================================================
CREATE TABLE historial_estado_pedido (
    historial_id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(pedido_id) ON DELETE CASCADE,
    estado_pedido_id INTEGER NOT NULL REFERENCES estados_pedido(estado_pedido_id) ON DELETE RESTRICT,
    usuario_id INTEGER REFERENCES usuarios(usuario_id) ON DELETE SET NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para historial_estado_pedido
CREATE INDEX idx_historial_pedido_id ON historial_estado_pedido(pedido_id);
CREATE INDEX idx_historial_estado ON historial_estado_pedido(estado_pedido_id);
CREATE INDEX idx_historial_fecha ON historial_estado_pedido(fecha_cambio);

-- =====================================================
-- TRIGGERS PARA ACTUALIZAR updated_at
-- =====================================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabla
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendedores_updated_at BEFORE UPDATE ON vendedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carritos_updated_at BEFORE UPDATE ON carritos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_carrito_updated_at BEFORE UPDATE ON items_carrito FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estados_pedido_updated_at BEFORE UPDATE ON estados_pedido FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_metodos_pago_updated_at BEFORE UPDATE ON metodos_pago FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mesas_updated_at BEFORE UPDATE ON mesas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_direcciones_updated_at BEFORE UPDATE ON direcciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_detalles_pedido_updated_at BEFORE UPDATE ON detalles_pedido FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_historial_estado_pedido_updated_at BEFORE UPDATE ON historial_estado_pedido FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Usuario administrador por defecto
INSERT INTO usuarios (username, email, password_hash, nombre, apellido, telefono, rol) VALUES 
('admin', 'admin@cafeteria.com', '$2a$10$yFVTLOdlvgtKNBuPiCbgHuqvY3HRDeOGUO5KSkJTSNY18epsQ5y76', 'Administrador', 'Sistema', '+56912345678', 'admin');

-- Categorías iniciales
INSERT INTO categorias (nombre, descripcion, imagen_url) VALUES 
('Café', 'Nuestras mejores mezclas de café, desde espresso hasta specialty drinks', 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?q=80&w=400'),
('Postres', 'Deliciosos postres artesanales hechos en casa diariamente', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=400'),
('Desayunos', 'El mejor inicio del día con opciones saludables y deliciosas', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=400'),
('Bebidas', 'Refrescantes opciones frías y calientes para acompañar tu día', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=400'),
('Sandwiches', 'Sandwiches gourmet frescos con ingredientes premium', 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?q=80&w=400');

-- Vendedor inicial (vinculado al usuario admin)
INSERT INTO vendedores (usuario_id, nombre, apellido, email, password_hash, telefono) VALUES 
(1, 'Administrador', 'Principal', 'admin@cafeteria.com', '$2a$10$yFVTLOdlvgtKNBuPiCbgHuqvY3HRDeOGUO5KSkJTSNY18epsQ5y76', '+56912345678');

-- Datos iniciales para productos
INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen_url, stock, disponible, vendedor_id) VALUES
-- Café (categoria_id = 1)
(1, 'Espresso', 'Café espresso tradicional italiano, intenso y aromático.', 2500.00, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?q=80&w=400', 50, true, 1),
(1, 'Americano', 'Café americano suave, perfecto para cualquier momento del día.', 2800.00, 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=400', 45, true, 1),
(1, 'Cappuccino', 'Café con leche espumosa y un toque de canela.', 3500.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=400', 40, true, 1),
(1, 'Latte', 'Café con leche cremosa y arte latte personalizado.', 3800.00, 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?q=80&w=400', 35, true, 1),
(1, 'Mocha', 'Deliciosa combinación de café, chocolate y crema batida.', 4200.00, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=400', 30, true, 1),
(1, 'Macchiato', 'Espresso marcado con un toque de leche espumosa.', 3200.00, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=400', 25, true, 1),
(1, 'Frappé', 'Café helado batido con hielo y crema, perfecto para el verano.', 4500.00, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=400', 20, true, 1),

-- Postres (categoria_id = 2)
(2, 'Cheesecake de Frutos Rojos', 'Cremoso cheesecake con salsa de frutos rojos frescos.', 4800.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400', 15, true, 1),
(2, 'Tiramisú', 'Clásico postre italiano con café, mascarpone y cacao.', 5200.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=400', 12, true, 1),
(2, 'Brownie con Helado', 'Brownie de chocolate caliente servido con helado de vainilla.', 4500.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=400', 20, true, 1),
(2, 'Tarta de Manzana', 'Tarta casera de manzana con canela y masa crujiente.', 4000.00, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=400', 10, true, 1),

-- Desayunos (categoria_id = 3)
(3, 'Tostadas Francesas', 'Pan brioche con huevo, canela y miel de maple.', 5500.00, 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=400', 25, true, 1),
(3, 'Huevos Benedict', 'Huevos pochados sobre muffin inglés con salsa holandesa.', 6800.00, 'https://images.unsplash.com/photo-1608039755401-742074f0548d?q=80&w=400', 15, true, 1),
(3, 'Pancakes con Berries', 'Stack de pancakes esponjosos con frutos rojos y jarabe.', 5800.00, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=400', 20, true, 1),
(3, 'Avocado Toast', 'Pan artesanal con palta, tomate cherry y semillas.', 4800.00, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=400', 30, true, 1),

-- Bebidas (categoria_id = 4)
(4, 'Smoothie Verde', 'Batido de espinaca, manzana, apio y jengibre.', 4200.00, 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?q=80&w=400', 25, true, 1),
(4, 'Jugo Natural de Naranja', 'Jugo de naranja recién exprimido, 100% natural.', 3500.00, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=400', 30, true, 1),
(4, 'Té Chai Latte', 'Té especiado con leche cremosa y un toque de miel.', 3800.00, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=400', 20, true, 1),
(4, 'Chocolate Caliente', 'Chocolate belga caliente con marshmallows y crema.', 4000.00, 'https://images.unsplash.com/photo-1542990253-0b8de10fb6d4?q=80&w=400', 25, true, 1),

-- Sandwiches (categoria_id = 5)
(5, 'Sandwich Vegetariano', 'Verduras asadas, queso de cabra, pesto de albahaca en pan artesanal integral.', 7200.00, 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?q=80&w=400', 12, true, 1),
(5, 'Panini de Jamón y Queso', 'Jamón serrano, queso manchego, tomate y rúcula en pan ciabatta prensado.', 6800.00, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=400', 18, true, 1);

-- Datos iniciales para mesas
INSERT INTO mesas (numero, capacidad, ubicacion, estado) VALUES
('1', 2, 'Ventana principal', 'disponible'),
('2', 4, 'Centro del salón', 'disponible'),
('3', 4, 'Cerca de la barra', 'disponible'),
('4', 6, 'Mesa familiar', 'disponible'),
('5', 2, 'Rincón acogedor', 'disponible'),
('6', 4, 'Terraza', 'disponible'),
('7', 2, 'Ventana lateral', 'disponible'),
('8', 8, 'Mesa grande', 'disponible'),
('9', 4, 'Centro del salón', 'disponible'),
('10', 2, 'Barra alta', 'disponible'),
('11', 4, 'Terraza', 'disponible'),
('12', 6, 'Mesa familiar', 'disponible');

-- Datos iniciales para estados de pedido
INSERT INTO estados_pedido (nombre, descripcion, color, orden) VALUES
('Pendiente', 'Pedido recibido, esperando confirmación', '#FCD34D', 1),
('Confirmado', 'Pedido confirmado, en preparación', '#60A5FA', 2),
('En Preparación', 'Pedido siendo preparado en cocina', '#F97316', 3),
('Listo', 'Pedido listo para entrega o recogida', '#34D399', 4),
('Entregado', 'Pedido entregado al cliente', '#10B981', 5),
('Cancelado', 'Pedido cancelado', '#EF4444', 6);

-- Datos iniciales para métodos de pago
INSERT INTO metodos_pago (nombre, descripcion) VALUES
('Efectivo', 'Pago en efectivo al momento de la entrega'),
('Tarjeta de Débito', 'Pago con tarjeta de débito'),
('Tarjeta de Crédito', 'Pago con tarjeta de crédito'),
('Transferencia', 'Transferencia bancaria'),
('WebPay', 'Pago online a través de WebPay'),
('Mercado Pago', 'Pago a través de Mercado Pago');

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de productos con información completa
CREATE VIEW vista_productos_completa AS
SELECT 
    p.producto_id,
    p.nombre,
    p.descripcion,
    p.precio,
    p.imagen_url,
    p.stock,
    p.disponible,
    c.nombre AS categoria_nombre,
    c.descripcion AS categoria_descripcion,
    v.nombre AS vendedor_nombre,
    v.apellido AS vendedor_apellido,
    p.created_at,
    p.updated_at
FROM productos p
JOIN categorias c ON p.categoria_id = c.categoria_id
JOIN vendedores v ON p.vendedor_id = v.vendedor_id;

-- Vista de carritos con totales
CREATE VIEW vista_carritos_resumen AS
SELECT 
    c.carrito_id,
    c.usuario_id,
    u.nombre AS usuario_nombre,
    u.apellido AS usuario_apellido,
    c.estado,
    COUNT(ic.item_id) AS total_items,
    SUM(ic.cantidad) AS total_productos,
    c.total,
    c.created_at,
    c.updated_at
FROM carritos c
JOIN usuarios u ON c.usuario_id = u.usuario_id
LEFT JOIN items_carrito ic ON c.carrito_id = ic.carrito_id
GROUP BY c.carrito_id, u.usuario_id, u.nombre, u.apellido;

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para calcular total del carrito
CREATE OR REPLACE FUNCTION calcular_total_carrito(carrito_id_param INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_calculado DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(subtotal), 0.00)
    INTO total_calculado
    FROM items_carrito
    WHERE carrito_id = carrito_id_param;
    
    UPDATE carritos 
    SET total = total_calculado, updated_at = CURRENT_TIMESTAMP
    WHERE carrito_id = carrito_id_param;
    
    RETURN total_calculado;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar total del carrito automáticamente
CREATE OR REPLACE FUNCTION trigger_actualizar_total_carrito()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM calcular_total_carrito(NEW.carrito_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM calcular_total_carrito(OLD.carrito_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_items_carrito_total
    AFTER INSERT OR UPDATE OR DELETE ON items_carrito
    FOR EACH ROW EXECUTE FUNCTION trigger_actualizar_total_carrito();

-- =====================================================
-- PERMISOS Y SEGURIDAD
-- =====================================================

-- Crear rol para la aplicación (opcional)
-- CREATE ROLE cafeteria_app WITH LOGIN PASSWORD 'tu_password_seguro';
-- GRANT CONNECT ON DATABASE tu_base_datos TO cafeteria_app;
-- GRANT USAGE ON SCHEMA public TO cafeteria_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO cafeteria_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cafeteria_app;

-- =====================================================
-- INFORMACIÓN DEL SCRIPT
-- =====================================================

-- Insertar información sobre la instalación
CREATE TABLE IF NOT EXISTS sistema_info (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) DEFAULT '1.0.0',
    fecha_instalacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT DEFAULT 'Sistema de Gestión de Cafetería L''Bandito'
);

INSERT INTO sistema_info (version, descripcion) VALUES 
('1.0.0', 'Instalación inicial del sistema de gestión de cafetería');

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Mostrar resumen de la instalación
SELECT 
    'INSTALACIÓN COMPLETADA' AS estado,
    (SELECT COUNT(*) FROM usuarios) AS usuarios_creados,
    (SELECT COUNT(*) FROM categorias) AS categorias_creadas,
    (SELECT COUNT(*) FROM vendedores) AS vendedores_creados,
    (SELECT COUNT(*) FROM productos) AS productos_creados,
    CURRENT_TIMESTAMP AS fecha_instalacion;

COMMIT; 