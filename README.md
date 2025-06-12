# ☕ Sistema de Gestión de Cafetería L'Bandito

Un sistema completo de gestión para cafeterías desarrollado con tecnologías modernas. Incluye gestión de productos, usuarios, inventario y un panel de administración intuitivo.

## 🚀 Instalación Rápida

### Opción 1: Instalación Automática (Recomendada)
```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd proyecto_final_cafeteria

# Ejecutar instalador automático
./install_cafeteria.sh
```

### Opción 2: Instalación Manual
Ver [Instalación Manual](#instalación-manual) más abajo.

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticación y autorización
- **Bcrypt** - Encriptación de contraseñas
- **Swagger** - Documentación de API

### Frontend
- **React** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **CSS3** - Estilos y responsive design

### Base de Datos
- **PostgreSQL** - Sistema de gestión de base de datos
- **Triggers** - Automatización de procesos
- **Vistas** - Consultas optimizadas
- **Índices** - Optimización de rendimiento

## 📋 Características

### 🔐 Sistema de Autenticación
- Login seguro con JWT
- Roles de usuario (Admin, Vendedor, Cliente)
- Protección de rutas
- Sesiones persistentes

### 👥 Gestión de Usuarios
- Crear, editar y eliminar vendedores
- Perfiles de usuario completos
- Control de acceso por roles
- Interfaz responsive

### 🛍️ Gestión de Productos
- Catálogo completo de productos
- Categorización automática
- Control de inventario
- Imágenes de productos
- Filtros y búsqueda

### 📊 Panel de Administración
- Dashboard intuitivo
- Estadísticas en tiempo real
- Gestión completa del sistema
- Interfaz moderna y responsive

### 🛒 Sistema de Carrito (Preparado)
- Estructura de base de datos lista
- API endpoints preparados
- Cálculo automático de totales

## 📁 Estructura del Proyecto

```
proyecto_final_cafeteria/
├── backend/                    # Servidor Node.js/Express
│   ├── src/
│   │   ├── controllers/       # Controladores de la API
│   │   ├── models/           # Modelos de Sequelize
│   │   ├── routes/           # Rutas de la API
│   │   ├── services/         # Lógica de negocio
│   │   ├── middleware/       # Middlewares personalizados
│   │   └── config/           # Configuración
│   ├── database_setup.sql    # Script de base de datos
│   └── package.json
├── frontend/                  # Aplicación React
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── services/        # Servicios de API
│   │   ├── hooks/           # Hooks personalizados
│   │   └── styles/          # Estilos CSS
│   └── package.json
├── install_cafeteria.sh      # Script de instalación automática
├── start_all.sh             # Iniciar sistema completo
├── start_backend.sh         # Solo backend
├── start_frontend.sh        # Solo frontend
└── README.md               # Este archivo
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales
- **usuarios** - Información de usuarios del sistema
- **vendedores** - Perfiles de vendedores
- **categorias** - Categorías de productos
- **productos** - Catálogo de productos
- **carritos** - Carritos de compra
- **items_carrito** - Items individuales del carrito

### Relaciones
- Usuario → Vendedor (1:1)
- Categoría → Productos (1:N)
- Vendedor → Productos (1:N)
- Usuario → Carritos (1:N)
- Carrito → Items (1:N)

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 16+
- PostgreSQL 12+
- npm o yarn

### Después de la Instalación

1. **Iniciar el sistema completo:**
   ```bash
   ./start_all.sh
   ```

2. **Acceder a la aplicación:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Documentación API: http://localhost:3000/api-docs

3. **Login inicial:**
   - Email: `admin@cafeteria.com`
   - Password: `admin123`

## 📖 Instalación Manual

### 1. Configurar Base de Datos
```bash
# Crear base de datos
createdb cafeteria_l_bandito

# Ejecutar script de estructura
psql -d cafeteria_l_bandito -f backend/database_setup.sql
```

### 2. Configurar Backend
```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus datos

# Iniciar servidor
npm run dev
```

### 3. Configurar Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 🔧 Configuración

### Variables de Entorno (Backend)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cafeteria_l_bandito
DB_USER=tu_usuario
DB_PASS=tu_password
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_jwt_secret_seguro
CORS_ORIGIN=http://localhost:5173
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil

### Productos
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Vendedores
- `GET /api/vendedores` - Listar vendedores
- `POST /api/vendedores` - Crear vendedor
- `PUT /api/vendedores/:id` - Actualizar vendedor
- `DELETE /api/vendedores/:id` - Eliminar vendedor

### Categorías
- `GET /api/categorias` - Listar categorías
- `POST /api/categorias` - Crear categoría

Ver documentación completa en: http://localhost:3000/api-docs

## 🎨 Características de la Interfaz

### Responsive Design
- Adaptable a móviles, tablets y desktop
- Cards en móvil, tablas en desktop
- Navegación optimizada para touch

### Componentes Modernos
- Modales interactivos
- Formularios con validación
- Filtros y búsqueda en tiempo real
- Estados de carga y feedback visual

### UX/UI
- Diseño intuitivo y moderno
- Colores y tipografía consistentes
- Iconografía clara
- Feedback inmediato de acciones

## 🔒 Seguridad

### Implementada
- Autenticación JWT
- Encriptación de contraseñas con bcrypt
- Validación de datos de entrada
- Protección CORS
- Sanitización de consultas SQL

### Recomendaciones
- Cambiar credenciales por defecto
- Usar HTTPS en producción
- Configurar firewall de base de datos
- Implementar rate limiting

## 🚀 Despliegue en Producción

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Servir archivos estáticos con nginx/apache
```

### Base de Datos
- Configurar backups automáticos
- Optimizar índices para producción
- Configurar conexiones SSL

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu-email@ejemplo.com

## 🙏 Agradecimientos

- Equipo de desarrollo
- Comunidad de código abierto
- Recursos de imágenes de Unsplash

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la [documentación](#-api-endpoints)
2. Busca en [issues existentes](https://github.com/tu-usuario/proyecto/issues)
3. Crea un [nuevo issue](https://github.com/tu-usuario/proyecto/issues/new)

---

⭐ **¡No olvides dar una estrella al proyecto si te fue útil!** ⭐
