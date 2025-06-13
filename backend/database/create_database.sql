-- =====================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS - CAFETERÍA L'BANDITO
-- Versión: 2.0 (Actualizada después de testing)
-- Fecha: Diciembre 2024
-- =====================================================

-- Crear base de datos
CREATE DATABASE cafeteria_l_bandito;

-- Conectar a la base de datos
\c cafeteria_l_bandito;

-- =====================================================
-- TIPOS ENUM
-- =====================================================

-- Estados de mesa
CREATE TYPE enum_mesas_estado AS ENUM (
    'disponible',
    'ocupada', 
    'reservada',
    'fuera_servicio'
);

-- Tipos de entrega
CREATE TYPE enum_pedidos_tipo_entrega AS ENUM (
    'local',
    'domicilio',
    'takeaway'
);

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla: roles
CREATE TABLE roles (
    rol_id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: estados_pedido
CREATE TABLE estados_pedido (
    estado_pedido_id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: metodos_pago
CREATE TABLE metodos_pago (
    metodo_pago_id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: categorias
CREATE TABLE categorias (
    categoria_id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    imagen_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: usuarios
CREATE TABLE usuarios (
    usuario_id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(255),
    fecha_nacimiento TIMESTAMP WITH TIME ZONE,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true
);

-- Tabla: vendedores
CREATE TABLE vendedores (
    vendedor_id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(usuario_id),
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(255),
    fecha_contratacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: mesas
CREATE TABLE mesas (
    mesa_id SERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL UNIQUE,
    capacidad INTEGER NOT NULL DEFAULT 4,
    ubicacion VARCHAR(100),
    estado enum_mesas_estado NOT NULL DEFAULT 'disponible',
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: productos
CREATE TABLE productos (
    producto_id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias(categoria_id) ON UPDATE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    imagen_url VARCHAR(255),
    stock INTEGER DEFAULT 0,
    disponible BOOLEAN DEFAULT true,
    vendedor_id INTEGER NOT NULL REFERENCES vendedores(vendedor_id) ON UPDATE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: direcciones
CREATE TABLE direcciones (
    direccion_id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(usuario_id) ON UPDATE CASCADE,
    calle VARCHAR(255) NOT NULL,
    numero VARCHAR(10),
    comuna VARCHAR(100),
    ciudad VARCHAR(100),
    region VARCHAR(100),
    codigo_postal VARCHAR(10),
    referencia TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: carritos
CREATE TABLE carritos (
    carrito_id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(usuario_id) ON UPDATE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: detalles_carrito
CREATE TABLE detalles_carrito (
    detalle_carrito_id SERIAL PRIMARY KEY,
    carrito_id INTEGER NOT NULL REFERENCES carritos(carrito_id) ON UPDATE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(producto_id) ON UPDATE CASCADE,
    cantidad INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: pedidos
CREATE TABLE pedidos (
    pedido_id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(usuario_id) ON UPDATE CASCADE,
    direccion_id INTEGER REFERENCES direcciones(direccion_id) ON UPDATE CASCADE ON DELETE SET NULL,
    metodo_pago_id INTEGER NOT NULL REFERENCES metodos_pago(metodo_pago_id) ON UPDATE CASCADE,
    carrito_id INTEGER REFERENCES carritos(carrito_id) ON UPDATE CASCADE ON DELETE SET NULL,
    estado_pedido_id INTEGER NOT NULL REFERENCES estados_pedido(estado_pedido_id) ON UPDATE CASCADE DEFAULT 1,
    subtotal NUMERIC(10,2) NOT NULL,
    impuestos NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tipo_entrega enum_pedidos_tipo_entrega DEFAULT 'local',
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: detalles_pedido
CREATE TABLE detalles_pedido (
    detalle_id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(pedido_id) ON UPDATE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(producto_id) ON UPDATE CASCADE,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL
);

-- Tabla: usuario_rol (relación muchos a muchos)
CREATE TABLE usuario_rol (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(usuario_id) ON UPDATE CASCADE ON DELETE CASCADE,
    rol_id INTEGER NOT NULL REFERENCES roles(rol_id) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, rol_id)
);

-- Tabla: historial_estado_pedido
CREATE TABLE historial_estado_pedido (
    historial_id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(pedido_id) ON UPDATE CASCADE,
    estado_anterior_id INTEGER REFERENCES estados_pedido(estado_pedido_id),
    estado_nuevo_id INTEGER NOT NULL REFERENCES estados_pedido(estado_pedido_id),
    fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT
);

-- Tabla: imagenes_producto
CREATE TABLE imagenes_producto (
    imagen_id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(producto_id) ON UPDATE CASCADE,
    url VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    orden INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: resenas
CREATE TABLE resenas (
    resena_id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(usuario_id) ON UPDATE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(producto_id) ON UPDATE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    fecha_resena TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para usuarios
CREATE INDEX usuarios_email ON usuarios(email);

-- Índices para productos
CREATE INDEX productos_categoria_id ON productos(categoria_id);
CREATE INDEX productos_nombre ON productos(nombre);
CREATE INDEX productos_vendedor_id ON productos(vendedor_id);

-- Índices para pedidos
CREATE INDEX pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX pedidos_estado_pedido_id ON pedidos(estado_pedido_id);
CREATE INDEX pedidos_metodo_pago_id ON pedidos(metodo_pago_id);
CREATE INDEX pedidos_direccion_id ON pedidos(direccion_id);
CREATE INDEX pedidos_carrito_id ON pedidos(carrito_id);

-- Índices para mesas
CREATE INDEX mesas_estado ON mesas(estado);
CREATE INDEX mesas_activa ON mesas(activa);
CREATE UNIQUE INDEX mesas_numero ON mesas(numero);

-- Índices para usuario_rol
CREATE INDEX usuario_rol_usuario_id ON usuario_rol(usuario_id);
CREATE INDEX usuario_rol_rol_id ON usuario_rol(rol_id);
CREATE UNIQUE INDEX usuario_rol_usuario_id_rol_id ON usuario_rol(usuario_id, rol_id);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estados_pedido_updated_at BEFORE UPDATE ON estados_pedido
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metodos_pago_updated_at BEFORE UPDATE ON metodos_pago
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendedores_updated_at BEFORE UPDATE ON vendedores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mesas_updated_at BEFORE UPDATE ON mesas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_direcciones_updated_at BEFORE UPDATE ON direcciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carritos_updated_at BEFORE UPDATE ON carritos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar roles básicos
INSERT INTO roles (nombre, descripcion) VALUES 
('admin', 'Administrador del sistema'),
('vendedor', 'Vendedor de la cafetería'),
('cliente', 'Cliente de la cafetería');

-- Insertar estados de pedido
INSERT INTO estados_pedido (nombre, descripcion) VALUES 
('pendiente', 'Pedido pendiente de preparación'),
('preparando', 'Pedido en preparación'),
('listo', 'Pedido listo para entregar'),
('entregado', 'Pedido entregado al cliente'),
('cancelado', 'Pedido cancelado');

-- Insertar métodos de pago
INSERT INTO metodos_pago (nombre, descripcion) VALUES 
('efectivo', 'Pago en efectivo'),
('tarjeta', 'Pago con tarjeta de crédito/débito'),
('transferencia', 'Transferencia bancaria'),
('app_movil', 'Pago por aplicación móvil');

-- Insertar categorías básicas
INSERT INTO categorias (nombre, descripcion) VALUES 
('bebidas_calientes', 'Café, té, chocolate caliente'),
('bebidas_frias', 'Jugos, smoothies, bebidas heladas'),
('comida_salada', 'Sandwiches, ensaladas, platos principales'),
('postres', 'Pasteles, galletas, dulces'),
('snacks', 'Aperitivos y bocadillos');

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema';
COMMENT ON TABLE vendedores IS 'Tabla de vendedores/empleados';
COMMENT ON TABLE productos IS 'Tabla de productos de la cafetería';
COMMENT ON TABLE pedidos IS 'Tabla de pedidos realizados';
COMMENT ON TABLE carritos IS 'Tabla de carritos de compra';
COMMENT ON TABLE mesas IS 'Tabla de mesas del local';

-- =====================================================
-- PERMISOS Y SEGURIDAD
-- =====================================================

-- Crear usuario para la aplicación (opcional)
-- CREATE USER cafeteria_app WITH PASSWORD 'secure_password_here';
-- GRANT CONNECT ON DATABASE cafeteria_l_bandito TO cafeteria_app;
-- GRANT USAGE ON SCHEMA public TO cafeteria_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO cafeteria_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cafeteria_app;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Verificar que todo se creó correctamente
SELECT 'Base de datos cafeteria_l_bandito creada exitosamente' AS resultado; 