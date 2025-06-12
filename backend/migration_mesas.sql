-- =====================================================
-- MIGRACIÓN: Agregar soporte para mesas y actualizar pedidos
-- =====================================================
-- Este script actualiza la base de datos existente para agregar
-- soporte completo para gestión de mesas y mejoras en pedidos
-- 
-- Uso: psql -U usuario -d cafeteria_l_bandito -f migration_mesas.sql
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CREAR TABLA MESAS (si no existe)
-- =====================================================
CREATE TABLE IF NOT EXISTS mesas (
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
CREATE INDEX IF NOT EXISTS idx_mesas_numero ON mesas(numero);
CREATE INDEX IF NOT EXISTS idx_mesas_estado ON mesas(estado);
CREATE INDEX IF NOT EXISTS idx_mesas_activa ON mesas(activa);

-- =====================================================
-- 2. AGREGAR CAMPO mesa_id A TABLA PEDIDOS (si no existe)
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pedidos' AND column_name = 'mesa_id') THEN
        ALTER TABLE pedidos ADD COLUMN mesa_id INTEGER REFERENCES mesas(mesa_id) ON DELETE SET NULL;
        CREATE INDEX idx_pedidos_mesa_id ON pedidos(mesa_id);
    END IF;
END $$;

-- =====================================================
-- 3. ACTUALIZAR CONSTRAINT DE tipo_entrega (si es necesario)
-- =====================================================
DO $$ 
BEGIN
    -- Eliminar constraint existente si existe
    ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_tipo_entrega_check;
    
    -- Agregar nuevo constraint
    ALTER TABLE pedidos ADD CONSTRAINT pedidos_tipo_entrega_check 
    CHECK (tipo_entrega IN ('local', 'delivery', 'takeaway'));
EXCEPTION
    WHEN OTHERS THEN
        -- Si hay error, continuar
        NULL;
END $$;

-- =====================================================
-- 4. CREAR TRIGGER PARA MESAS (si no existe)
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers 
                   WHERE trigger_name = 'update_mesas_updated_at') THEN
        CREATE TRIGGER update_mesas_updated_at 
        BEFORE UPDATE ON mesas 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- 5. INSERTAR DATOS INICIALES DE MESAS (si no existen)
-- =====================================================
INSERT INTO mesas (numero, capacidad, ubicacion, estado) 
SELECT * FROM (VALUES
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
    ('12', 6, 'Mesa familiar', 'disponible')
) AS v(numero, capacidad, ubicacion, estado)
WHERE NOT EXISTS (SELECT 1 FROM mesas WHERE numero = v.numero);

-- =====================================================
-- 6. AGREGAR COLUMNAS A estados_pedido (si no existen)
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'estados_pedido' AND column_name = 'color') THEN
        ALTER TABLE estados_pedido ADD COLUMN color VARCHAR(7) DEFAULT '#6B7280';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'estados_pedido' AND column_name = 'orden') THEN
        ALTER TABLE estados_pedido ADD COLUMN orden INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'estados_pedido' AND column_name = 'activo') THEN
        ALTER TABLE estados_pedido ADD COLUMN activo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- =====================================================
-- 7. INSERTAR ESTADOS DE PEDIDO (si no existen)
-- =====================================================
INSERT INTO estados_pedido (nombre, descripcion, color, orden) 
SELECT * FROM (VALUES
    ('Pendiente', 'Pedido recibido, esperando confirmación', '#FCD34D', 1),
    ('Confirmado', 'Pedido confirmado, en preparación', '#60A5FA', 2),
    ('En Preparación', 'Pedido siendo preparado en cocina', '#F97316', 3),
    ('Listo', 'Pedido listo para entrega o recogida', '#34D399', 4),
    ('Entregado', 'Pedido entregado al cliente', '#10B981', 5),
    ('Cancelado', 'Pedido cancelado', '#EF4444', 6)
) AS v(nombre, descripcion, color, orden)
WHERE NOT EXISTS (SELECT 1 FROM estados_pedido WHERE nombre = v.nombre);

-- =====================================================
-- 8. INSERTAR MÉTODOS DE PAGO (si no existen)
-- =====================================================
INSERT INTO metodos_pago (nombre, descripcion) 
SELECT * FROM (VALUES
    ('Efectivo', 'Pago en efectivo al momento de la entrega'),
    ('Tarjeta de Débito', 'Pago con tarjeta de débito'),
    ('Tarjeta de Crédito', 'Pago con tarjeta de crédito'),
    ('Transferencia', 'Transferencia bancaria'),
    ('WebPay', 'Pago online a través de WebPay'),
    ('Mercado Pago', 'Pago a través de Mercado Pago')
) AS v(nombre, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE nombre = v.nombre);

-- =====================================================
-- 9. CREAR VISTA PARA PEDIDOS CON MESAS
-- =====================================================
CREATE OR REPLACE VIEW vista_pedidos_completa AS
SELECT 
    p.pedido_id,
    p.usuario_id,
    u.nombre AS cliente_nombre,
    u.apellido AS cliente_apellido,
    u.email AS cliente_email,
    u.telefono AS cliente_telefono,
    p.estado_pedido_id,
    ep.nombre AS estado_nombre,
    ep.descripcion AS estado_descripcion,
    COALESCE(ep.color, '#6B7280') AS estado_color,
    p.metodo_pago_id,
    mp.nombre AS metodo_pago_nombre,
    p.mesa_id,
    m.numero AS mesa_numero,
    m.capacidad AS mesa_capacidad,
    m.ubicacion AS mesa_ubicacion,
    p.subtotal,
    p.impuestos,
    p.total,
    p.fecha_pedido,
    p.created_at,
    p.updated_at
FROM pedidos p
JOIN usuarios u ON p.usuario_id = u.usuario_id
JOIN estados_pedido ep ON p.estado_pedido_id = ep.estado_pedido_id
JOIN metodos_pago mp ON p.metodo_pago_id = mp.metodo_pago_id
LEFT JOIN mesas m ON p.mesa_id = m.mesa_id;

-- =====================================================
-- 10. CREAR VISTA PARA MESAS CON ESTADO
-- =====================================================
CREATE OR REPLACE VIEW vista_mesas_estado AS
SELECT 
    m.mesa_id,
    m.numero,
    m.capacidad,
    m.ubicacion,
    m.estado,
    m.activa,
    CASE 
        WHEN p.pedido_id IS NOT NULL AND ep.nombre NOT IN ('Entregado', 'Cancelado') THEN 'ocupada'
        ELSE m.estado
    END AS estado_actual,
    p.pedido_id AS pedido_activo_id,
    u.nombre AS cliente_actual_nombre,
    u.apellido AS cliente_actual_apellido,
    m.created_at,
    m.updated_at
FROM mesas m
LEFT JOIN pedidos p ON m.mesa_id = p.mesa_id 
    AND p.estado_pedido_id IN (
        SELECT estado_pedido_id FROM estados_pedido 
        WHERE nombre NOT IN ('Entregado', 'Cancelado')
    )
LEFT JOIN usuarios u ON p.usuario_id = u.usuario_id
LEFT JOIN estados_pedido ep ON p.estado_pedido_id = ep.estado_pedido_id
WHERE m.activa = true;

-- =====================================================
-- 11. MOSTRAR RESUMEN DE LA MIGRACIÓN
-- =====================================================
SELECT 
    'MIGRACIÓN COMPLETADA' AS estado,
    (SELECT COUNT(*) FROM mesas) AS mesas_totales,
    (SELECT COUNT(*) FROM mesas WHERE estado = 'disponible') AS mesas_disponibles,
    (SELECT COUNT(*) FROM estados_pedido) AS estados_pedido,
    (SELECT COUNT(*) FROM metodos_pago) AS metodos_pago,
    CURRENT_TIMESTAMP AS fecha_migracion;

COMMIT;

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- ===================================================== 