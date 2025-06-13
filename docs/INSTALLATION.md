# 📖 Guía Detallada de Instalación

Esta guía te llevará paso a paso por la instalación completa del Sistema de Gestión de Cafetería L'Bandito.

## 📋 Tabla de Contenidos

- [Prerrequisitos](#-prerrequisitos)
- [Instalación con Docker](#-instalación-con-docker-recomendada)
- [Instalación Manual](#-instalación-manual)
- [Configuración de Base de Datos](#-configuración-de-base-de-datos)
- [Variables de Entorno](#-variables-de-entorno)
- [Verificación de Instalación](#-verificación-de-instalación)
- [Troubleshooting](#-troubleshooting)

## 🔧 Prerrequisitos

### Requisitos del Sistema

| Herramienta | Versión Mínima | Versión Recomendada | Notas |
|-------------|----------------|---------------------|-------|
| **Node.js** | 16.0.0 | 18.19.0+ | LTS recomendado |
| **npm** | 8.0.0 | 10.0.0+ | Incluido con Node.js |
| **PostgreSQL** | 12.0 | 14.10+ | Base de datos principal |
| **Git** | 2.30.0 | 2.42.0+ | Control de versiones |
| **Docker** | 20.10.0 | 24.0.0+ | (Opcional) Para instalación con Docker |
| **Docker Compose** | 2.0.0 | 2.23.0+ | (Opcional) Para orquestación |

### Verificar Instalaciones

```bash
# Verificar Node.js
node --version
# Debería mostrar: v18.19.0 o superior

# Verificar npm
npm --version
# Debería mostrar: 10.0.0 o superior

# Verificar PostgreSQL
psql --version
# Debería mostrar: psql (PostgreSQL) 14.10 o superior

# Verificar Git
git --version
# Debería mostrar: git version 2.42.0 o superior

# Verificar Docker (opcional)
docker --version
docker-compose --version
```

### Instalación de Prerrequisitos

<details>
<summary>🐧 Ubuntu/Debian</summary>

```bash
# Actualizar repositorios
sudo apt update

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Instalar Git
sudo apt install git

# Instalar Docker (opcional)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin
```
</details>

<details>
<summary>🍎 macOS</summary>

```bash
# Instalar Homebrew (si no está instalado)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node@18

# Instalar PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# Instalar Git
brew install git

# Instalar Docker (opcional)
brew install --cask docker
```
</details>

<details>
<summary>🪟 Windows</summary>

```powershell
# Instalar usando Chocolatey (recomendado)
# Primero instalar Chocolatey: https://chocolatey.org/install

# Instalar Node.js
choco install nodejs --version=18.19.0

# Instalar PostgreSQL
choco install postgresql --version=14.10

# Instalar Git
choco install git

# Instalar Docker Desktop
choco install docker-desktop
```
</details>

## 🐳 Instalación con Docker (Recomendada)

Esta es la forma más rápida y confiable de instalar el sistema completo.

### Paso 1: Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/cafeteria-l-bandito.git
cd cafeteria-l-bandito

# Verificar que estás en la rama correcta
git branch
# Debería mostrar: * main
```

### Paso 2: Configurar Variables de Entorno

```bash
# Copiar archivos de ejemplo
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env

# Opcional: Editar configuraciones
nano backend/.env
nano frontend/.env
```

### Paso 3: Levantar los Servicios

```bash
# Construir y levantar todos los servicios
docker-compose up -d --build

# Verificar que los contenedores están ejecutándose
docker-compose ps
```

Deberías ver algo como esto:
```
NAME                    STATUS          PORTS
cafeteria_frontend      Up 2 minutes    0.0.0.0:80->80/tcp
cafeteria_backend       Up 2 minutes    0.0.0.0:3000->3000/tcp
cafeteria_db            Up 2 minutes    0.0.0.0:5432->5432/tcp
```

### Paso 4: Ejecutar Migraciones y Seeds

```bash
# Esperar a que la base de datos esté lista (30 segundos aprox)
sleep 30

# Ejecutar migraciones
docker-compose exec backend npm run migrate

# Insertar datos de prueba (opcional)
docker-compose exec backend npm run seed
```

### Paso 5: Verificar Instalación

Abre tu navegador y navega a:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3000
- **Documentación**: http://localhost:3000/api-docs

## 🛠️ Instalación Manual

Si prefieres no usar Docker, puedes instalar cada componente manualmente.

### Paso 1: Configurar Base de Datos

```bash
# Conectar a PostgreSQL como superusuario
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE cafeteria_l_bandito;
CREATE USER cafeteria_user WITH PASSWORD 'cafeteria_password';
GRANT ALL PRIVILEGES ON DATABASE cafeteria_l_bandito TO cafeteria_user;

# Salir de PostgreSQL
\q
```

### Paso 2: Clonar y Configurar Backend

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/cafeteria-l-bandito.git
cd cafeteria-l-bandito/backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
```

Editar `.env` con tus configuraciones:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cafeteria_l_bandito
DB_USER=cafeteria_user
DB_PASS=cafeteria_password
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
CORS_ORIGIN=http://localhost:5173
```

```bash
# Ejecutar migraciones
npm run migrate

# Insertar datos de prueba
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

### Paso 3: Configurar Frontend

En una nueva terminal:

```bash
cd cafeteria-l-bandito/frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

Editar `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Cafetería L'Bandito
```

```bash
# Iniciar servidor de desarrollo
npm run dev
```

## 🗄️ Configuración de Base de Datos

### Estructura de la Base de Datos

El sistema utiliza PostgreSQL con las siguientes tablas principales:

```sql
-- Tabla de roles
CREATE TABLE roles (
    rol_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    usuario_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INTEGER REFERENCES roles(rol_id),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE categorias (
    categoria_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de productos
CREATE TABLE productos (
    producto_id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(categoria_id),
    stock INTEGER DEFAULT 0,
    imagen_url VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Datos Iniciales

El sistema incluye datos de prueba que se pueden insertar ejecutando:

```bash
# Con Docker
docker-compose exec backend npm run seed

# Manual
cd backend && npm run seed
```

Esto creará:
- **Roles**: admin, vendedor, cliente
- **Usuario admin**: admin@cafeteria.com / admin123
- **Categorías**: Bebidas Calientes, Bebidas Frías, Postres, etc.
- **Productos**: Café Americano, Cappuccino, Croissant, etc.

## ⚙️ Variables de Entorno

### Backend (.env)

```env
# ===========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ===========================================
DB_HOST=localhost                    # Host de PostgreSQL
DB_PORT=5432                        # Puerto de PostgreSQL
DB_NAME=cafeteria_l_bandito         # Nombre de la base de datos
DB_USER=cafeteria_user              # Usuario de la base de datos
DB_PASS=cafeteria_password          # Contraseña de la base de datos

# ===========================================
# CONFIGURACIÓN DEL SERVIDOR
# ===========================================
PORT=3000                           # Puerto del servidor backend
NODE_ENV=development                # Entorno (development/production)

# ===========================================
# CONFIGURACIÓN DE SEGURIDAD
# ===========================================
JWT_SECRET=tu_jwt_secret_muy_seguro # Clave secreta para JWT (mín 64 caracteres)
JWT_EXPIRES_IN=24h                  # Tiempo de expiración del token

# ===========================================
# CONFIGURACIÓN DE CORS
# ===========================================
CORS_ORIGIN=http://localhost:5173  # URL del frontend permitida

# ===========================================
# CONFIGURACIÓN DE REDIS (OPCIONAL)
# ===========================================
REDIS_HOST=localhost               # Host de Redis
REDIS_PORT=6379                   # Puerto de Redis
REDIS_PASSWORD=                   # Contraseña de Redis (opcional)

# ===========================================
# CONFIGURACIÓN DE EMAIL (FUTURO)
# ===========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_app

# ===========================================
# CONFIGURACIÓN DE ARCHIVOS
# ===========================================
UPLOAD_PATH=./uploads              # Ruta de archivos subidos
MAX_FILE_SIZE=5242880             # Tamaño máximo (5MB en bytes)

# ===========================================
# CONFIGURACIÓN DE LOGS
# ===========================================
LOG_LEVEL=info                    # Nivel de logging (error, warn, info, debug)
LOG_FILE=./logs/app.log          # Archivo de logs
```

### Frontend (.env)

```env
# ===========================================
# CONFIGURACIÓN DE API
# ===========================================
VITE_API_BASE_URL=http://localhost:3000/api  # URL base de la API
VITE_APP_NAME=Cafetería L'Bandito            # Nombre de la aplicación
VITE_APP_VERSION=1.0.0                       # Versión de la aplicación

# ===========================================
# CONFIGURACIÓN DE CARACTERÍSTICAS
# ===========================================
VITE_ENABLE_ANALYTICS=false        # Habilitar analytics (Google Analytics)
VITE_ENABLE_PWA=false              # Habilitar Progressive Web App
VITE_ENABLE_SENTRY=false           # Habilitar Sentry para error tracking

# ===========================================
# CONFIGURACIÓN DEL ENTORNO
# ===========================================
VITE_NODE_ENV=development          # Entorno de desarrollo
VITE_DEBUG=true                    # Habilitar modo debug
```

## ✅ Verificación de Instalación

### Verificar Backend

```bash
# Verificar que el servidor está ejecutándose
curl http://localhost:3000/api/health

# Debería responder:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": "00:05:30",
  "version": "1.0.0"
}
```

### Verificar Frontend

```bash
# El frontend debería estar disponible en:
# http://localhost:5173 (desarrollo manual)
# http://localhost:80 (Docker)

# Verificar que los assets se cargan correctamente
curl -I http://localhost:5173
# Debería responder: HTTP/1.1 200 OK
```

### Verificar Base de Datos

```bash
# Conectar a la base de datos
psql -h localhost -U cafeteria_user -d cafeteria_l_bandito

# Verificar tablas
\dt

# Verificar datos de prueba
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM productos;
SELECT COUNT(*) FROM categorias;
```

### Verificar Logs

```bash
# Logs del backend (Docker)
docker-compose logs backend

# Logs del frontend (Docker)
docker-compose logs frontend

# Logs de la base de datos (Docker)
docker-compose logs postgres
```

## 🚨 Troubleshooting

### Problemas Comunes

#### Error: Puerto ya en uso

```bash
# Problema: Error: listen EADDRINUSE: address already in use :::3000
# Solución: Cambiar puerto o terminar proceso existente

# Ver qué proceso usa el puerto
lsof -i :3000

# Terminar proceso específico
kill -9 <PID>

# O cambiar puerto en .env
PORT=3001
```

#### Error: No se puede conectar a PostgreSQL

```bash
# Problema: Connection refused
# Verificar que PostgreSQL está ejecutándose

# Ubuntu/Debian
sudo systemctl status postgresql
sudo systemctl start postgresql

# macOS
brew services list | grep postgresql
brew services start postgresql@14

# Windows
net start postgresql-x64-14
```

#### Error: Migraciones fallan

```bash
# Problema: Error al ejecutar migraciones
# Verificar configuración de base de datos

# Verificar que la base de datos existe
psql -h localhost -U postgres -c "SELECT datname FROM pg_database;"

# Verificar permisos del usuario
psql -h localhost -U postgres -c "SELECT * FROM pg_roles WHERE rolname = 'cafeteria_user';"

# Recrear base de datos si es necesario
dropdb -h localhost -U postgres cafeteria_l_bandito
createdb -h localhost -U postgres cafeteria_l_bandito
psql -h localhost -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE cafeteria_l_bandito TO cafeteria_user;"
```

#### Error: Frontend no se conecta al Backend

```bash
# Problema: Network Error o CORS
# Verificar configuración de CORS

# En backend/.env
CORS_ORIGIN=http://localhost:5173

# En frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api

# Reiniciar ambos servicios
```

#### Error: Docker no inicia

```bash
# Problema: Docker containers no inician
# Verificar Docker y logs

# Verificar estado de Docker
docker system info

# Ver logs detallados
docker-compose logs -f

# Limpiar volúmenes si es necesario
docker-compose down -v
docker system prune -a
```

### Comandos Útiles para Debugging

```bash
# Ver todos los procesos en puertos específicos
netstat -tulpn | grep :3000
netstat -tulpn | grep :5173
netstat -tulpn | grep :5432

# Verificar variables de entorno
printenv | grep DB_
printenv | grep JWT_
printenv | grep VITE_

# Ver logs en tiempo real (Docker)
docker-compose logs -f backend
docker-compose logs -f frontend

# Ejecutar comandos dentro del contenedor
docker-compose exec backend bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

### Obtener Ayuda

Si sigues teniendo problemas:

1. **Revisa los logs** detalladamente
2. **Verifica las configuraciones** de .env
3. **Consulta la documentación** completa
4. **Busca en Issues** existentes en GitHub
5. **Crea un nuevo Issue** con información detallada

---

## 📞 Soporte Adicional

- 📧 **Email**: soporte@cafeteria-lbandito.com
- 💬 **Discord**: [Servidor de la comunidad](placeholder)
- 🐛 **GitHub Issues**: [Reportar problemas](https://github.com/tu-usuario/proyecto/issues)

---

**¡Listo!** Con esta guía deberías tener el sistema funcionando correctamente. Si encuentras algún problema, no dudes en consultar la sección de troubleshooting o contactar al equipo de soporte. 