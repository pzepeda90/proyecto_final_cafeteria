#!/bin/bash

# 🏪 Script de Inicio Completo - Sistema POS Cafetería L'Bandito
# ================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Función para limpiar procesos al salir
cleanup() {
    print_warning "Deteniendo servicios..."
    
    # Matar procesos en puertos específicos
    if lsof -ti:3000 >/dev/null 2>&1; then
        print_status "Deteniendo backend (puerto 3000)..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null
    fi
    
    if lsof -ti:5174 >/dev/null 2>&1; then
        print_status "Deteniendo frontend (puerto 5174)..."
        lsof -ti:5174 | xargs kill -9 2>/dev/null
    fi
    
    print_success "Servicios detenidos correctamente"
    exit 0
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Banner de inicio
clear
print_header "
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🏪 SISTEMA POS CAFETERÍA L'BANDITO - VERSIÓN MEJORADA    ║
║                                                              ║
║    ✅ Búsqueda inteligente de clientes                       ║
║    ✅ Gestión visual de mesas                                ║
║    ✅ Carrito mejorado                                       ║
║    ✅ API completa de mesas y clientes                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"

# Verificar dependencias
print_header "🔍 VERIFICANDO DEPENDENCIAS..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi
print_status "Node.js: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi
print_status "npm: $(npm --version)"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL no está instalado"
    exit 1
fi
print_status "PostgreSQL: $(psql --version | head -n1)"

# Verificar conexión a la base de datos
print_header "🗄️  VERIFICANDO BASE DE DATOS..."

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-cafeteria_l_bandito}
DB_USER=${DB_USER:-patriciozepeda}
DB_PASS=${DB_PASS:-123456}

if ! PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" >/dev/null 2>&1; then
    print_error "No se puede conectar a la base de datos"
    print_error "Verifica que PostgreSQL esté corriendo y las credenciales sean correctas"
    exit 1
fi
print_success "Conexión a base de datos exitosa"

# Verificar tabla de mesas
if ! PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM mesas;" >/dev/null 2>&1; then
    print_warning "Tabla 'mesas' no encontrada, creándola..."
    
    # Crear tabla de mesas
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'EOF'
CREATE TABLE IF NOT EXISTS mesas (
    mesa_id SERIAL PRIMARY KEY,
    numero VARCHAR(10) UNIQUE NOT NULL,
    capacidad INTEGER NOT NULL DEFAULT 4,
    ubicacion VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'disponible' 
        CHECK (estado IN ('disponible', 'ocupada', 'reservada', 'fuera_servicio')),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_mesas_updated_at ON mesas;
CREATE TRIGGER update_mesas_updated_at
    BEFORE UPDATE ON mesas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos iniciales si no existen
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
EOF
    
    if [ $? -eq 0 ]; then
        print_success "Tabla 'mesas' creada e inicializada correctamente"
    else
        print_error "Error al crear tabla 'mesas'"
        exit 1
    fi
else
    MESA_COUNT=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM mesas;" | xargs)
    print_success "Tabla 'mesas' encontrada con $MESA_COUNT registros"
fi

# Limpiar puertos ocupados
print_header "🧹 LIMPIANDO PUERTOS..."

if lsof -ti:3000 >/dev/null 2>&1; then
    print_warning "Puerto 3000 ocupado, liberando..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

if lsof -ti:5174 >/dev/null 2>&1; then
    print_warning "Puerto 5174 ocupado, liberando..."
    lsof -ti:5174 | xargs kill -9 2>/dev/null
    sleep 2
fi

print_success "Puertos liberados"

# Verificar e instalar dependencias del backend
print_header "📦 VERIFICANDO DEPENDENCIAS DEL BACKEND..."

cd backend
if [ ! -d "node_modules" ]; then
    print_status "Instalando dependencias del backend..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Error al instalar dependencias del backend"
        exit 1
    fi
fi
print_success "Dependencias del backend verificadas"

# Iniciar backend
print_header "🚀 INICIANDO BACKEND..."

export DB_HOST=$DB_HOST
export DB_PORT=$DB_PORT
export DB_NAME=$DB_NAME
export DB_USER=$DB_USER
export DB_PASS=$DB_PASS
export PORT=3000
export JWT_SECRET=${JWT_SECRET:-tu_jwt_secret_muy_seguro_aqui_123456789}
export CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:5174}
export NODE_ENV=${NODE_ENV:-development}

# Iniciar backend en background
node src/index.js &
BACKEND_PID=$!

# Esperar a que el backend esté listo
print_status "Esperando a que el backend esté listo..."
for i in {1..30}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        print_success "Backend iniciado correctamente en puerto 3000"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Timeout esperando al backend"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 1
done

# Probar endpoint de mesas
print_status "Probando endpoint de mesas..."
MESAS_RESPONSE=$(curl -s http://localhost:3000/api/mesas/disponibles)
if [ $? -eq 0 ] && [[ $MESAS_RESPONSE == *"mesa_id"* ]]; then
    MESAS_COUNT=$(echo $MESAS_RESPONSE | grep -o '"mesa_id"' | wc -l | xargs)
    print_success "Endpoint de mesas funcionando - $MESAS_COUNT mesas disponibles"
else
    print_error "Error en endpoint de mesas"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Verificar e instalar dependencias del frontend
print_header "📦 VERIFICANDO DEPENDENCIAS DEL FRONTEND..."

cd ../frontend
if [ ! -d "node_modules" ]; then
    print_status "Instalando dependencias del frontend..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Error al instalar dependencias del frontend"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
fi
print_success "Dependencias del frontend verificadas"

# Crear archivo .env para frontend si no existe
if [ ! -f ".env" ]; then
    print_status "Creando archivo .env para frontend..."
    cat > .env << EOF
VITE_API_BASE_URL=http://localhost:3000/api
EOF
    print_success "Archivo .env creado"
fi

# Iniciar frontend
print_header "🚀 INICIANDO FRONTEND..."

npm run dev &
FRONTEND_PID=$!

# Esperar a que el frontend esté listo
print_status "Esperando a que el frontend esté listo..."
for i in {1..30}; do
    if curl -s http://localhost:5174 >/dev/null 2>&1; then
        print_success "Frontend iniciado correctamente en puerto 5174"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Timeout esperando al frontend"
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
        exit 1
    fi
    sleep 1
done

# Mostrar información del sistema
print_header "📊 INFORMACIÓN DEL SISTEMA"

echo -e "${CYAN}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│                     SERVICIOS ACTIVOS                      │${NC}"
echo -e "${CYAN}├─────────────────────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│${NC} 🌐 Frontend:     ${GREEN}http://localhost:5174${NC}                   ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} 🔧 Backend:      ${GREEN}http://localhost:3000${NC}                   ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} 📚 API Docs:     ${GREEN}http://localhost:3000/api-docs${NC}          ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} 🗄️  Base de Datos: ${GREEN}PostgreSQL (cafeteria_l_bandito)${NC}      ${CYAN}│${NC}"
echo -e "${CYAN}├─────────────────────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│                    CREDENCIALES DE ACCESO                  │${NC}"
echo -e "${CYAN}├─────────────────────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│${NC} 👤 Vendedor:     ${YELLOW}vendedor@cafeteria.com${NC} / ${YELLOW}password123${NC}   ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} 👑 Admin:        ${YELLOW}admin@cafeteria.com${NC} / ${YELLOW}admin123${NC}        ${CYAN}│${NC}"
echo -e "${CYAN}├─────────────────────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│                    NUEVAS FUNCIONALIDADES                  │${NC}"
echo -e "${CYAN}├─────────────────────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│${NC} 🔍 Búsqueda inteligente de clientes                    ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} 🪑 Gestión visual de mesas con estados                 ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} 🛒 Carrito mejorado con información completa           ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} 📊 API completa para mesas y clientes                  ${CYAN}│${NC}"
echo -e "${CYAN}│${NC} ✅ Validaciones específicas por tipo de pedido         ${CYAN}│${NC}"
echo -e "${CYAN}└─────────────────────────────────────────────────────────────┘${NC}"

# Estadísticas en tiempo real
print_header "📈 ESTADÍSTICAS EN TIEMPO REAL"

PRODUCTOS_COUNT=$(curl -s http://localhost:3000/api/productos | grep -o '"producto_id"' | wc -l | xargs 2>/dev/null || echo "0")
MESAS_DISPONIBLES=$(curl -s http://localhost:3000/api/mesas/disponibles | grep -o '"mesa_id"' | wc -l | xargs 2>/dev/null || echo "0")
USUARIOS_COUNT=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM usuarios;" 2>/dev/null | xargs || echo "0")

echo -e "${BLUE}📦 Productos en catálogo:${NC} $PRODUCTOS_COUNT"
echo -e "${BLUE}🪑 Mesas disponibles:${NC} $MESAS_DISPONIBLES"
echo -e "${BLUE}👥 Usuarios registrados:${NC} $USUARIOS_COUNT"

print_header "🎯 SISTEMA LISTO PARA USAR"

print_success "¡El sistema POS mejorado está funcionando correctamente!"
print_status "Presiona Ctrl+C para detener todos los servicios"

# Mantener el script corriendo y mostrar logs
print_header "📋 LOGS EN TIEMPO REAL"

# Función para mostrar logs
show_logs() {
    while true; do
        sleep 5
        
        # Verificar que los servicios sigan corriendo
        if ! curl -s http://localhost:3000 >/dev/null 2>&1; then
            print_error "Backend no responde, reiniciando..."
            cd ../backend
            node src/index.js &
            BACKEND_PID=$!
        fi
        
        if ! curl -s http://localhost:5174 >/dev/null 2>&1; then
            print_error "Frontend no responde, reiniciando..."
            cd ../frontend
            npm run dev &
            FRONTEND_PID=$!
        fi
    done
}

# Iniciar monitoreo en background
show_logs &
MONITOR_PID=$!

# Esperar indefinidamente
wait 