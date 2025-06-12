#!/bin/bash

# =====================================================
# SCRIPT DE INSTALACIÓN AUTOMÁTICA
# Sistema de Gestión de Cafetería L'Bandito
# =====================================================
# Este script automatiza la instalación completa del sistema
# =====================================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Verificar si Node.js está instalado
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 16+ antes de continuar."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Se requiere Node.js 16 o superior. Versión actual: $(node --version)"
        exit 1
    fi
    
    print_message "Node.js $(node --version) detectado ✓"
}

# Verificar si PostgreSQL está instalado
check_postgresql() {
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL no está instalado. Por favor instala PostgreSQL antes de continuar."
        exit 1
    fi
    
    print_message "PostgreSQL detectado ✓"
}

# Función para solicitar datos de configuración
get_database_config() {
    print_header "CONFIGURACIÓN DE BASE DE DATOS"
    
    read -p "Nombre de la base de datos [cafeteria_l_bandito]: " DB_NAME
    DB_NAME=${DB_NAME:-cafeteria_l_bandito}
    
    read -p "Usuario de PostgreSQL [postgres]: " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    read -s -p "Contraseña de PostgreSQL: " DB_PASS
    echo
    
    read -p "Host de la base de datos [localhost]: " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    
    read -p "Puerto de PostgreSQL [5432]: " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    
    read -p "Puerto del servidor backend [3000]: " SERVER_PORT
    SERVER_PORT=${SERVER_PORT:-3000}
    
    read -p "Puerto del frontend [5173]: " FRONTEND_PORT
    FRONTEND_PORT=${FRONTEND_PORT:-5173}
}

# Crear base de datos
create_database() {
    print_header "CREANDO BASE DE DATOS"
    
    # Verificar conexión a PostgreSQL
    if ! PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d postgres -c "SELECT 1;" &> /dev/null; then
        print_error "No se puede conectar a PostgreSQL. Verifica las credenciales."
        exit 1
    fi
    
    # Crear base de datos si no existe
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || print_warning "La base de datos $DB_NAME ya existe"
    
    print_message "Base de datos $DB_NAME lista ✓"
}

# Ejecutar script de estructura de base de datos
setup_database_structure() {
    print_header "CONFIGURANDO ESTRUCTURA DE BASE DE DATOS"
    
    if [ ! -f "backend/database_setup.sql" ]; then
        print_error "No se encuentra el archivo backend/database_setup.sql"
        exit 1
    fi
    
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f backend/database_setup.sql
    
    if [ $? -eq 0 ]; then
        print_message "Estructura de base de datos creada exitosamente ✓"
    else
        print_error "Error al crear la estructura de base de datos"
        exit 1
    fi
}

# Configurar variables de entorno
setup_environment() {
    print_header "CONFIGURANDO VARIABLES DE ENTORNO"
    
    # Generar JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    # Crear archivo .env para backend
    cat > backend/.env << EOF
# Configuración generada automáticamente
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASS=$DB_PASS
PORT=$SERVER_PORT
NODE_ENV=development
JWT_SECRET=$JWT_SECRET
CORS_ORIGIN=http://localhost:$FRONTEND_PORT
EOF
    
    print_message "Variables de entorno configuradas ✓"
}

# Instalar dependencias del backend
install_backend_dependencies() {
    print_header "INSTALANDO DEPENDENCIAS DEL BACKEND"
    
    cd backend
    npm install
    cd ..
    
    print_message "Dependencias del backend instaladas ✓"
}

# Instalar dependencias del frontend
install_frontend_dependencies() {
    print_header "INSTALANDO DEPENDENCIAS DEL FRONTEND"
    
    cd frontend
    npm install
    cd ..
    
    print_message "Dependencias del frontend instaladas ✓"
}

# Crear scripts de inicio
create_startup_scripts() {
    print_header "CREANDO SCRIPTS DE INICIO"
    
    # Script para iniciar backend
    cat > start_backend.sh << 'EOF'
#!/bin/bash
echo "Iniciando servidor backend..."
cd backend
npm run dev
EOF
    
    # Script para iniciar frontend
    cat > start_frontend.sh << 'EOF'
#!/bin/bash
echo "Iniciando servidor frontend..."
cd frontend
npm run dev
EOF
    
    # Script para iniciar ambos
    cat > start_all.sh << 'EOF'
#!/bin/bash
echo "Iniciando sistema completo..."

# Función para manejar Ctrl+C
cleanup() {
    echo "Deteniendo servidores..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT

# Iniciar backend en background
cd backend && npm run dev &
BACKEND_PID=$!
cd ..

# Esperar un poco para que el backend inicie
sleep 3

# Iniciar frontend en background
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Sistema iniciado:"
echo "   - Backend: http://localhost:3000"
echo "   - Frontend: http://localhost:5173"
echo "   - API Docs: http://localhost:3000/api-docs"
echo ""
echo "Presiona Ctrl+C para detener ambos servidores"

# Esperar a que terminen los procesos
wait $BACKEND_PID $FRONTEND_PID
EOF
    
    # Hacer ejecutables los scripts
    chmod +x start_backend.sh start_frontend.sh start_all.sh
    
    print_message "Scripts de inicio creados ✓"
}

# Crear documentación
create_documentation() {
    print_header "CREANDO DOCUMENTACIÓN"
    
    cat > README_INSTALACION.md << EOF
# Sistema de Gestión de Cafetería L'Bandito

## 🎉 Instalación Completada

El sistema ha sido instalado exitosamente con la siguiente configuración:

### 📊 Configuración de Base de Datos
- **Base de datos:** $DB_NAME
- **Host:** $DB_HOST:$DB_PORT
- **Usuario:** $DB_USER

### 🚀 Servidores
- **Backend:** http://localhost:$SERVER_PORT
- **Frontend:** http://localhost:$FRONTEND_PORT
- **API Docs:** http://localhost:$SERVER_PORT/api-docs

### 👤 Usuario Administrador por Defecto
- **Email:** admin@cafeteria.com
- **Password:** admin123
- **Rol:** Administrador

### 🏃‍♂️ Cómo Iniciar el Sistema

#### Opción 1: Iniciar todo junto
\`\`\`bash
./start_all.sh
\`\`\`

#### Opción 2: Iniciar por separado
\`\`\`bash
# Terminal 1 - Backend
./start_backend.sh

# Terminal 2 - Frontend  
./start_frontend.sh
\`\`\`

#### Opción 3: Manualmente
\`\`\`bash
# Backend
cd backend && npm run dev

# Frontend (en otra terminal)
cd frontend && npm run dev
\`\`\`

### 📁 Estructura del Proyecto
\`\`\`
proyecto_final_cafeteria/
├── backend/           # Servidor Node.js/Express
├── frontend/          # Aplicación React/Vite
├── database_setup.sql # Script de base de datos
├── start_all.sh      # Iniciar sistema completo
├── start_backend.sh  # Solo backend
└── start_frontend.sh # Solo frontend
\`\`\`

### 🔧 Funcionalidades Incluidas
- ✅ Gestión de usuarios y vendedores
- ✅ Catálogo de productos con categorías
- ✅ Sistema de autenticación JWT
- ✅ Panel de administración
- ✅ API REST documentada con Swagger
- ✅ Interfaz responsive
- ✅ Base de datos poblada con productos de ejemplo

### 🛠️ Comandos Útiles

#### Backend
\`\`\`bash
cd backend
npm run dev      # Modo desarrollo
npm start        # Modo producción
npm run test     # Ejecutar tests
\`\`\`

#### Frontend
\`\`\`bash
cd frontend
npm run dev      # Servidor de desarrollo
npm run build    # Construir para producción
npm run preview  # Vista previa de producción
\`\`\`

### 🔒 Seguridad
- Cambia la contraseña del administrador después del primer login
- El JWT secret se generó automáticamente
- Revisa las variables de entorno en \`backend/.env\`

### 📞 Soporte
Si encuentras algún problema, revisa:
1. Que PostgreSQL esté corriendo
2. Que los puertos no estén ocupados
3. Que las credenciales de base de datos sean correctas

¡Disfruta tu nuevo sistema de cafetería! ☕
EOF
    
    print_message "Documentación creada ✓"
}

# Función principal
main() {
    print_header "INSTALADOR DE CAFETERÍA L'BANDITO"
    echo "Este script instalará automáticamente todo el sistema"
    echo ""
    
    # Verificaciones previas
    check_nodejs
    check_postgresql
    
    # Configuración
    get_database_config
    
    # Confirmación
    echo ""
    print_warning "¿Continuar con la instalación? (y/N)"
    read -r CONFIRM
    if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
        print_message "Instalación cancelada"
        exit 0
    fi
    
    # Proceso de instalación
    create_database
    setup_database_structure
    setup_environment
    install_backend_dependencies
    install_frontend_dependencies
    create_startup_scripts
    create_documentation
    
    # Mensaje final
    print_header "🎉 INSTALACIÓN COMPLETADA"
    echo ""
    print_message "El sistema está listo para usar!"
    echo ""
    echo "Para iniciar el sistema completo:"
    echo "  ./start_all.sh"
    echo ""
    echo "URLs importantes:"
    echo "  - Frontend: http://localhost:$FRONTEND_PORT"
    echo "  - Backend: http://localhost:$SERVER_PORT"
    echo "  - API Docs: http://localhost:$SERVER_PORT/api-docs"
    echo ""
    echo "Usuario admin: admin@cafeteria.com / admin123"
    echo ""
    print_message "¡Revisa README_INSTALACION.md para más detalles!"
}

# Ejecutar función principal
main "$@" 