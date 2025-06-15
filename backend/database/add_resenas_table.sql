-- Script para agregar la tabla resenas a la base de datos existente
-- Este script se ejecuta si la tabla no existe

-- Verificar si la tabla existe y crearla si no existe
DO $$
BEGIN
    -- Verificar si la tabla resenas existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'resenas') THEN
        -- Crear la tabla resenas
        CREATE TABLE resenas (
            resena_id SERIAL PRIMARY KEY,
            usuario_id INTEGER NOT NULL REFERENCES usuarios(usuario_id) ON UPDATE CASCADE,
            producto_id INTEGER NOT NULL REFERENCES productos(producto_id) ON UPDATE CASCADE,
            calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
            comentario TEXT,
            fecha_resena TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Crear índices para optimización
        CREATE INDEX resenas_usuario_id ON resenas(usuario_id);
        CREATE INDEX resenas_producto_id ON resenas(producto_id);
        CREATE INDEX resenas_calificacion ON resenas(calificacion);
        CREATE INDEX resenas_fecha_resena ON resenas(fecha_resena);
        
        RAISE NOTICE 'Tabla resenas creada exitosamente';
    ELSE
        RAISE NOTICE 'La tabla resenas ya existe';
    END IF;
END $$; 