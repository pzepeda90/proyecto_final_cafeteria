#!/bin/bash

# Script de inicio mejorado para el Sistema POS de Cafetería L'Bandito
# Incluye búsqueda de clientes y gestión de mesas

echo "🚀 Iniciando Sistema POS Mejorado - Cafetería L'Bandito"
echo "========================================================"

# Verificar si PostgreSQL está corriendo
if ! pgrep -x "postgres" > /dev/null; then
    echo "❌ PostgreSQL no está corriendo. Por favor, inicia PostgreSQL primero."
    exit 1
fi

# Verificar conexión a la base de datos
if ! psql -U patriciozepeda -d cafeteria_l_bandito -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ No se puede conectar a la base de datos cafeteria_l_bandito"
    echo "   Verifica que la base de datos existe y las credenciales son correctas"
    exit 1
fi

echo "✅ Base de datos conectada correctamente"

# Verificar que las tablas necesarias existen
echo "🔍 Verificando estructura de base de datos..."

# Verificar tabla mesas
if psql -U patriciozepeda -d cafeteria_l_bandito -c "SELECT COUNT(*) FROM mesas;" > /dev/null 2>&1; then
    MESA_COUNT=$(psql -U patriciozepeda -d cafeteria_l_bandito -t -c "SELECT COUNT(*) FROM mesas;" | xargs)
    echo "✅ Tabla mesas: $MESA_COUNT mesas disponibles"
else
    echo "⚠️  Tabla mesas no encontrada. Creando..."
    psql -U patriciozepeda -d cafeteria_l_bandito -c "
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
        
        INSERT INTO mesas (numero, capacidad, ubicacion, estado) VALUES 
        ('1', 2, 'Ventana', 'disponible'),
        ('2', 4, 'Centro', 'disponible'),
        ('3', 4, 'Centro', 'disponible'),
        ('4', 6, 'Terraza', 'disponible'),
        ('5', 2, 'Barra', 'disponible'),
        ('6', 4, 'Ventana', 'disponible'),
        ('7', 8, 'Salón Principal', 'disponible'),
        ('8', 4, 'Centro', 'disponible'),
        ('9', 2, 'Rincón', 'disponible'),
        ('10', 6, 'Terraza', 'disponible')
        ON CONFLICT (numero) DO NOTHING;
    " > /dev/null 2>&1
    echo "✅ Tabla mesas creada con 10 mesas iniciales"
fi

# Verificar productos
PRODUCT_COUNT=$(psql -U patriciozepeda -d cafeteria_l_bandito -t -c "SELECT COUNT(*) FROM productos WHERE disponible = true;" | xargs)
echo "✅ Productos disponibles: $PRODUCT_COUNT"

# Verificar usuarios
USER_COUNT=$(psql -U patriciozepeda -d cafeteria_l_bandito -t -c "SELECT COUNT(*) FROM usuarios WHERE activo = true;" | xargs)
echo "✅ Usuarios registrados: $USER_COUNT"

echo ""
echo "🔧 Iniciando servicios..."

# Función para verificar si un puerto está en uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Iniciar Backend
echo "🔙 Iniciando Backend (Puerto 3000)..."
if check_port 3000; then
    echo "⚠️  Puerto 3000 ya está en uso. Deteniendo proceso anterior..."
    pkill -f "node.*backend" 2>/dev/null || true
    sleep 2
fi

cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Esperar a que el backend esté listo
echo "⏳ Esperando que el backend esté listo..."
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Backend listo en http://localhost:3000"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend no responde después de 30 segundos"
        exit 1
    fi
    sleep 1
done

# Iniciar Frontend
echo "🎨 Iniciando Frontend (Puerto 5174)..."
if check_port 5174; then
    echo "⚠️  Puerto 5174 ya está en uso. Deteniendo proceso anterior..."
    pkill -f "vite.*frontend" 2>/dev/null || true
    sleep 2
fi

cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Esperar a que el frontend esté listo
echo "⏳ Esperando que el frontend esté listo..."
for i in {1..30}; do
    if curl -s http://localhost:5174 > /dev/null 2>&1; then
        echo "✅ Frontend listo en http://localhost:5174"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Frontend no responde después de 30 segundos"
        exit 1
    fi
    sleep 1
done

echo ""
echo "🎉 ¡Sistema POS Mejorado iniciado exitosamente!"
echo "=============================================="
echo ""
echo "📱 ACCESOS PRINCIPALES:"
echo "   🌐 Aplicación Web: http://localhost:5174"
echo "   🔧 API Backend:    http://localhost:3000"
echo "   📚 Documentación:  http://localhost:3000/api-docs"
echo ""
echo "👥 CREDENCIALES DE ACCESO:"
echo "   🛒 Vendedor: vendedor@cafeteria.com / password123"
echo "   👑 Admin:    admin@cafeteria.com / admin123"
echo ""
echo "🆕 NUEVAS FUNCIONALIDADES:"
echo "   🔍 Búsqueda inteligente de clientes"
echo "   🪑 Gestión visual de mesas"
echo "   👤 Creación rápida de clientes"
echo "   📊 Carrito mejorado con información completa"
echo "   🎯 Selección de tipo de pedido (Local/Delivery/Takeaway)"
echo ""
echo "🏪 GESTIÓN DE MESAS:"
echo "   ✅ Disponible  🔴 Ocupada  🟡 Reservada  🚫 Fuera de servicio"
echo "   📍 Ubicaciones: Ventana, Centro, Terraza, Barra, Salón Principal, Rincón"
echo ""
echo "🔧 ENDPOINTS API NUEVOS:"
echo "   GET  /api/mesas              - Listar todas las mesas"
echo "   GET  /api/mesas/disponibles  - Mesas disponibles"
echo "   GET  /api/usuarios/buscar    - Buscar clientes"
echo "   POST /api/mesas              - Crear nueva mesa"
echo ""
echo "📋 FLUJO DE TRABAJO MEJORADO:"
echo "   1. 🔍 Buscar o crear cliente"
echo "   2. 🪑 Seleccionar mesa (para pedidos locales)"
echo "   3. 🛒 Agregar productos al carrito"
echo "   4. 🎯 Elegir tipo de pedido"
echo "   5. 💳 Procesar pago"
echo "   6. ✅ Confirmar pedido"
echo ""
echo "📊 ESTADÍSTICAS ACTUALES:"
echo "   🍽️  Productos disponibles: $PRODUCT_COUNT"
echo "   🪑 Mesas configuradas: $MESA_COUNT"
echo "   👥 Usuarios registrados: $USER_COUNT"
echo ""
echo "🔄 Para detener el sistema: Ctrl+C"
echo "📝 Logs disponibles en: ./logs/"
echo ""
echo "💡 TIPS:"
echo "   • La búsqueda de clientes funciona con nombre, apellido, teléfono o email"
echo "   • Las mesas se actualizan automáticamente según disponibilidad"
echo "   • Los pedidos de delivery requieren teléfono obligatorio"
echo "   • El carrito muestra información completa del cliente y mesa"
echo ""

# Crear directorio de logs si no existe
mkdir -p logs

# Función para limpiar al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ Servicios detenidos"
    exit 0
}

# Capturar señal de interrupción
trap cleanup INT

# Mantener el script corriendo
echo "⚡ Sistema funcionando... Presiona Ctrl+C para detener"
wait 