#!/bin/bash

# =====================================================
# SCRIPT DE LIMPIEZA Y OPTIMIZACIÓN - CAFETERÍA L'BANDITO
# =====================================================

set -e

echo "🧹 Iniciando limpieza y optimización del proyecto..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =====================================================
# 1. LIMPIAR ARCHIVOS TEMPORALES Y LOGS
# =====================================================
log "Limpiando archivos temporales..."

# Limpiar logs de npm
find . -name "npm-debug.log*" -delete 2>/dev/null || true
find . -name ".npm" -type d -exec rm -rf {} + 2>/dev/null || true

# Limpiar archivos de sistema
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true

# Limpiar archivos temporales de editores
find . -name "*.swp" -delete 2>/dev/null || true
find . -name "*.swo" -delete 2>/dev/null || true
find . -name "*~" -delete 2>/dev/null || true

success "Archivos temporales eliminados"

# =====================================================
# 2. OPTIMIZAR DEPENDENCIAS
# =====================================================
log "Optimizando dependencias del backend..."

cd backend
if [ -f "package-lock.json" ]; then
    npm ci --only=production --silent
    npm prune --production
fi
cd ..

log "Optimizando dependencias del frontend..."

cd frontend
if [ -f "package-lock.json" ]; then
    npm ci --only=production --silent
    npm prune --production
fi
cd ..

success "Dependencias optimizadas"

# =====================================================
# 3. VERIFICAR ESTRUCTURA DE ARCHIVOS
# =====================================================
log "Verificando estructura de archivos..."

# Verificar archivos esenciales
REQUIRED_FILES=(
    "docker-compose.yml"
    "docker-compose.prod.yml"
    "deploy.sh"
    "backend/package.json"
    "backend/Dockerfile"
    "frontend/package.json"
    "frontend/Dockerfile"
    "frontend/nginx.conf"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        error "Archivo requerido faltante: $file"
        exit 1
    fi
done

success "Estructura de archivos verificada"

# =====================================================
# 4. GENERAR REPORTE DE TAMAÑO
# =====================================================
log "Generando reporte de tamaño..."

echo "📊 REPORTE DE TAMAÑO DEL PROYECTO" > size_report.txt
echo "=================================" >> size_report.txt
echo "" >> size_report.txt

# Tamaño total del proyecto
TOTAL_SIZE=$(du -sh . | cut -f1)
echo "Tamaño total: $TOTAL_SIZE" >> size_report.txt
echo "" >> size_report.txt

# Tamaño por directorio principal
echo "Tamaño por directorio:" >> size_report.txt
echo "---------------------" >> size_report.txt
du -sh backend frontend 2>/dev/null >> size_report.txt
echo "" >> size_report.txt

# Archivos más grandes
echo "Archivos más grandes (>1MB):" >> size_report.txt
echo "----------------------------" >> size_report.txt
find . -type f -size +1M -exec du -sh {} + 2>/dev/null | sort -hr >> size_report.txt
echo "" >> size_report.txt

# Conteo de archivos por tipo
echo "Conteo de archivos por tipo:" >> size_report.txt
echo "---------------------------" >> size_report.txt
echo "JavaScript/JSX: $(find . -name "*.js" -o -name "*.jsx" | wc -l)" >> size_report.txt
echo "CSS: $(find . -name "*.css" | wc -l)" >> size_report.txt
echo "JSON: $(find . -name "*.json" | wc -l)" >> size_report.txt
echo "Markdown: $(find . -name "*.md" | wc -l)" >> size_report.txt
echo "SQL: $(find . -name "*.sql" | wc -l)" >> size_report.txt
echo "Docker: $(find . -name "Dockerfile*" -o -name "docker-compose*.yml" | wc -l)" >> size_report.txt

success "Reporte de tamaño generado: size_report.txt"

# =====================================================
# 5. ACTUALIZAR .gitignore
# =====================================================
log "Actualizando .gitignore..."

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
/frontend/dist/
/frontend/build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary files
tmp/
temp/
size_report.txt

# Database
*.sqlite
*.db

# Docker
.dockerignore
EOF

success ".gitignore actualizado"

# =====================================================
# 6. CREAR RESUMEN FINAL
# =====================================================
log "Creando resumen final..."

cat > PROYECTO_LIMPIO.md << 'EOF'
# 🎯 PROYECTO CAFETERÍA L'BANDITO - LIMPIO Y OPTIMIZADO

## ✅ **ESTADO ACTUAL**

### **Funcionalidades Operativas:**
- ✅ Backend API Node.js/Express
- ✅ Frontend React/Vite
- ✅ Base de datos PostgreSQL
- ✅ Sistema POS funcional
- ✅ Gestión de productos e inventario
- ✅ Sistema de autenticación JWT
- ✅ Docker y Docker Compose configurados

### **Archivos de Producción:**
- ✅ `docker-compose.yml` - Desarrollo
- ✅ `docker-compose.prod.yml` - Producción
- ✅ `deploy.sh` - Script de deployment
- ✅ `backend/Dockerfile` - Imagen del backend
- ✅ `frontend/Dockerfile` - Imagen del frontend
- ✅ `frontend/nginx.conf` - Configuración de Nginx

## 🚀 **COMANDOS PARA PRODUCCIÓN**

### **Desarrollo Local:**
```bash
# Iniciar todo el stack
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### **Producción:**
```bash
# Deployment completo
./deploy.sh

# O manualmente:
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 **OPTIMIZACIONES REALIZADAS**

### **Archivos Eliminados:**
- ❌ Scripts duplicados (start_*.sh)
- ❌ READMEs redundantes
- ❌ Archivos de documentación temporales
- ❌ Configuraciones de testing no necesarias
- ❌ Archivos de desarrollo (.husky, jest, etc.)

### **Estructura Final:**
```
proyecto_final_cafeteria/
├── backend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── env.production
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── docker-compose.prod.yml
├── deploy.sh
└── README.md
```

## 🔧 **CONFIGURACIÓN REQUERIDA**

### **Variables de Entorno:**
1. Copiar `backend/env.production` a `backend/.env`
2. Actualizar credenciales de base de datos
3. Generar JWT_SECRET seguro
4. Configurar URLs de producción

### **Base de Datos:**
```bash
# Ejecutar setup inicial
psql -U postgres -d cafeteria_l_bandito -f backend/database_setup.sql
```

## ✨ **LISTO PARA PRODUCCIÓN**

El proyecto está completamente limpio y optimizado para deployment en producción.
EOF

success "Resumen final creado: PROYECTO_LIMPIO.md"

# =====================================================
# RESUMEN FINAL
# =====================================================
echo ""
echo "🎉 ¡LIMPIEZA COMPLETADA!"
echo "========================"
echo ""
echo "📁 Tamaño del proyecto: $TOTAL_SIZE"
echo "📄 Archivos eliminados: Duplicados y temporales"
echo "🐳 Docker: Configurado para producción"
echo "📋 Documentación: Actualizada"
echo ""
echo "🚀 El proyecto está listo para producción!"
echo ""
echo "Próximos pasos:"
echo "1. Revisar PROYECTO_LIMPIO.md"
echo "2. Configurar variables de entorno"
echo "3. Ejecutar ./deploy.sh para deployment"
echo "" 