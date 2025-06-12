#!/bin/bash

# =====================================================
# SCRIPT DE DEPLOYMENT - CAFETERÍA L'BANDITO
# =====================================================

set -e  # Salir si cualquier comando falla

echo "🚀 Iniciando deployment de Cafetería L'Bandito..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    error "No se encontró docker-compose.yml. Ejecuta este script desde la raíz del proyecto."
fi

# Verificar que Docker está instalado y ejecutándose
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Por favor instala Docker primero."
fi

if ! docker info &> /dev/null; then
    error "Docker no está ejecutándose. Por favor inicia Docker primero."
fi

# Verificar que docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    error "docker-compose no está instalado. Por favor instala docker-compose primero."
fi

# Verificar variables de entorno críticas
log "Verificando variables de entorno..."

if [ -z "$JWT_SECRET" ]; then
    warning "JWT_SECRET no está configurado. Generando uno temporal..."
    export JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    echo "JWT_SECRET generado: $JWT_SECRET"
    echo "⚠️  IMPORTANTE: Guarda este JWT_SECRET para uso futuro"
fi

if [ -z "$DB_PASS" ]; then
    warning "DB_PASS no está configurado. Usando password por defecto."
    export DB_PASS="cafeteria_password_change_me"
fi

if [ -z "$CORS_ORIGIN" ]; then
    warning "CORS_ORIGIN no está configurado. Usando localhost."
    export CORS_ORIGIN="http://localhost:80"
fi

if [ -z "$VITE_API_BASE_URL" ]; then
    warning "VITE_API_BASE_URL no está configurado. Usando localhost."
    export VITE_API_BASE_URL="http://localhost:3000/api"
fi

# Crear directorio de backups si no existe
log "Creando directorios necesarios..."
mkdir -p backups
mkdir -p logs

# Detener servicios existentes
log "Deteniendo servicios existentes..."
docker-compose down --remove-orphans || true

# Limpiar imágenes antiguas (opcional)
read -p "¿Deseas limpiar imágenes Docker antiguas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Limpiando imágenes Docker antiguas..."
    docker system prune -f
fi

# Construir imágenes
log "Construyendo imágenes Docker..."
docker-compose build --no-cache

# Iniciar servicios
log "Iniciando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
log "Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
log "Verificando estado de los servicios..."

# Verificar PostgreSQL
if docker-compose exec -T postgres pg_isready -U cafeteria_user -d cafeteria_l_bandito; then
    success "✅ PostgreSQL está funcionando"
else
    error "❌ PostgreSQL no está respondiendo"
fi

# Verificar Backend
if curl -f http://localhost:3000/api/productos > /dev/null 2>&1; then
    success "✅ Backend API está funcionando"
else
    error "❌ Backend API no está respondiendo"
fi

# Verificar Frontend
if curl -f http://localhost:80 > /dev/null 2>&1; then
    success "✅ Frontend está funcionando"
else
    error "❌ Frontend no está respondiendo"
fi

# Mostrar logs de los servicios
log "Mostrando logs de los servicios..."
docker-compose logs --tail=20

# Información final
success "🎉 Deployment completado exitosamente!"
echo ""
echo "📋 Información de acceso:"
echo "   Frontend: http://localhost:80"
echo "   Backend API: http://localhost:3000"
echo "   Swagger Docs: http://localhost:3000/api-docs"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs: docker-compose logs -f"
echo "   Detener: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo ""
echo "⚠️  IMPORTANTE para producción:"
echo "   1. Cambiar JWT_SECRET: $JWT_SECRET"
echo "   2. Cambiar DB_PASS: $DB_PASS"
echo "   3. Configurar CORS_ORIGIN para tu dominio"
echo "   4. Configurar SSL/HTTPS"
echo "   5. Configurar backups automáticos" 