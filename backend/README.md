# Backend Cafetería El Bandito

Backend para el sistema de gestión de la Cafetería El Bandito, construido con Node.js, Express y PostgreSQL.

## Estructura de la Base de Datos

El backend ha sido desarrollado para trabajar con la base de datos existente "cafeteria_l_bandito", respetando la estructura de tablas y relaciones establecidas en el diagrama:

- **Usuarios**: Gestión de clientes y administradores
- **Productos**: Catálogo de productos disponibles
- **Categorías**: Clasificación de productos
- **Pedidos**: Gestión de órdenes de compra
- **Carritos**: Carritos de compra de usuarios
- **Direcciones**: Direcciones de envío de los usuarios
- **Vendedores**: Proveedores de productos
- **Estados de Pedido**: Estados posibles para un pedido
- **Métodos de Pago**: Opciones de pago disponibles
- **Imágenes de Producto**: Galería de imágenes para productos
- **Reseñas**: Opiniones de usuarios sobre productos
- **Roles**: Roles de usuario en el sistema

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── db.js             # Configuración de conexión a PostgreSQL
│   ├── controllers/          # Controladores para cada entidad
│   │   ├── carritos.controller.js
│   │   ├── categorias.controller.js
│   │   ├── detalles_carrito.controller.js
│   │   ├── detalles_pedido.controller.js
│   │   ├── estados_pedido.controller.js
│   │   ├── historial_estado_pedido.controller.js
│   │   ├── imagenes_producto.controller.js
│   │   ├── metodos_pago.controller.js
│   │   ├── pedidos.controller.js
│   │   ├── productos.controller.js
│   │   ├── resenas.controller.js
│   │   ├── roles.controller.js
│   │   ├── usuarios.controller.js
│   │   └── vendedores.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js # Middleware de autenticación JWT
│   │   ├── validation.middleware.js # Validación de datos
│   │   ├── errorHandler.js # Manejo de errores
│   │   ├── rateLimiter.middleware.js # Límite de peticiones
│   │   ├── roles.middleware.js # Verificación de roles
│   │   └── vendedor.middleware.js # Verificación de vendedor
│   ├── models/               # Modelos para interactuar con la BD
│   │   ├── carrito.model.js
│   │   ├── categoria.model.js
│   │   ├── detalle_carrito.model.js
│   │   ├── detalle_pedido.model.js
│   │   ├── direccion.model.js
│   │   ├── estado_pedido.model.js
│   │   ├── historial_estado_pedido.model.js
│   │   ├── imagen_producto.model.js
│   │   ├── metodo_pago.model.js
│   │   ├── pedido.model.js
│   │   ├── producto.model.js
│   │   ├── resena.model.js
│   │   ├── rol.model.js
│   │   ├── sequelize.js       # Configuración de Sequelize
│   │   ├── setup.js           # Verificación de estructura de BD
│   │   ├── usuario.model.js
│   │   └── vendedor.model.js
│   ├── routes/               # Rutas API
│   │   ├── carritos.routes.js
│   │   ├── categorias.routes.js
│   │   ├── pedidos.routes.js
│   │   ├── productos.routes.js
│   │   ├── usuarios.routes.js
│   │   ├── vendedores.routes.js
│   │   ├── resenas.routes.js
│   │   ├── metodos_pago.routes.js
│   │   ├── estados_pedido.routes.js
│   │   └── roles.routes.js
│   └── index.js              # Punto de entrada de la aplicación
├── .env                      # Variables de entorno
├── package.json              # Dependencias del proyecto
├── tablas.txt                # Definición SQL de tablas
└── README.md                 # Documentación
```

## API Endpoints

### Autenticación
- `POST /api/usuarios/registro` - Registro de usuario
- `POST /api/usuarios/login` - Inicio de sesión

### Usuarios
- `GET /api/usuarios/perfil` - Obtener perfil del usuario
- `PUT /api/usuarios/perfil` - Actualizar perfil
- `PUT /api/usuarios/cambiar-password` - Cambiar contraseña

### Direcciones
- `GET /api/usuarios/direcciones` - Obtener direcciones del usuario
- `POST /api/usuarios/direcciones` - Agregar dirección
- `PUT /api/usuarios/direcciones/:id` - Actualizar dirección
- `DELETE /api/usuarios/direcciones/:id` - Eliminar dirección
- `PUT /api/usuarios/direcciones/:id/principal` - Establecer dirección principal

### Productos
- `GET /api/productos` - Obtener todos los productos
- `GET /api/productos/:id` - Obtener un producto por ID
- `POST /api/productos` - Crear producto (admin/vendedor)
- `PUT /api/productos/:id` - Actualizar producto (admin/vendedor)
- `DELETE /api/productos/:id` - Eliminar producto (admin/vendedor)
- `POST /api/productos/:id/imagenes` - Agregar imagen a producto (admin/vendedor)

### Categorías
- `GET /api/categorias` - Obtener todas las categorías
- `GET /api/categorias/:id` - Obtener una categoría por ID
- `POST /api/categorias` - Crear categoría (admin)
- `PUT /api/categorias/:id` - Actualizar categoría (admin)
- `DELETE /api/categorias/:id` - Eliminar categoría (admin)

### Carrito
- `GET /api/carritos` - Obtener carrito del usuario
- `POST /api/carritos/agregar` - Agregar producto al carrito
- `PUT /api/carritos/actualizar` - Actualizar cantidad de producto
- `DELETE /api/carritos/producto/:producto_id` - Eliminar producto del carrito
- `DELETE /api/carritos/vaciar` - Vaciar carrito

### Pedidos
- `GET /api/pedidos` - Obtener pedidos del usuario (o todos si es admin)
- `GET /api/pedidos/:id` - Obtener un pedido por ID
- `GET /api/pedidos/:id/historial` - Obtener historial de estados de un pedido
- `POST /api/pedidos` - Crear pedido
- `PUT /api/pedidos/:id/estado` - Actualizar estado de pedido (admin)

### Vendedores
- `GET /api/vendedores` - Obtener todos los vendedores (admin)
- `GET /api/vendedores/:id` - Obtener un vendedor por ID (admin)
- `POST /api/vendedores` - Crear vendedor (admin)
- `PUT /api/vendedores/:id` - Actualizar vendedor (admin)
- `DELETE /api/vendedores/:id` - Eliminar vendedor (admin)

### Roles
- `GET /api/roles` - Obtener todos los roles (admin)
- `GET /api/roles/:id` - Obtener un rol por ID (admin)
- `POST /api/roles` - Crear rol (admin)
- `PUT /api/roles/:id` - Actualizar rol (admin)
- `DELETE /api/roles/:id` - Eliminar rol (admin)

### Métodos de Pago
- `GET /api/metodos-pago` - Obtener todos los métodos de pago
- `GET /api/metodos-pago/:id` - Obtener un método de pago por ID
- `POST /api/metodos-pago` - Crear método de pago (admin)
- `PUT /api/metodos-pago/:id` - Actualizar método de pago (admin)
- `DELETE /api/metodos-pago/:id` - Eliminar método de pago (admin)

### Estados de Pedido
- `GET /api/estados-pedido` - Obtener todos los estados de pedido
- `GET /api/estados-pedido/:id` - Obtener un estado de pedido por ID
- `POST /api/estados-pedido` - Crear estado de pedido (admin)
- `PUT /api/estados-pedido/:id` - Actualizar estado de pedido (admin)
- `DELETE /api/estados-pedido/:id` - Eliminar estado de pedido (admin)

### Reseñas
- `GET /api/productos/:producto_id/resenas` - Obtener reseñas de un producto
- `POST /api/productos/:producto_id/resenas` - Crear reseña para un producto
- `PUT /api/resenas/:id` - Actualizar reseña (propietario)
- `DELETE /api/resenas/:id` - Eliminar reseña (propietario o admin)

## Documentación API

La documentación completa de la API está disponible en formato Swagger, permitiendo probar los endpoints directamente desde el navegador:

```
http://localhost:8080/api-docs
```

La documentación incluye:
- Descripción detallada de cada endpoint
- Parámetros requeridos y opcionales
- Formato de datos de entrada y salida
- Códigos de respuesta
- Ejemplos de uso
- Autenticación y autorización requerida

## Instalación y Ejecución

1. Clonar el repositorio
2. Instalar dependencias:
```
npm install
```

3. Configurar variables de entorno en `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cafeteria_l_bandito
DB_USER=usuario_bd
DB_PASSWORD=contraseña_bd
JWT_SECRET=secreto_jwt
PORT=8080
```

4. Iniciar el servidor:
```
npm run dev
```

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución
- **Express**: Framework web
- **PostgreSQL**: Base de datos
- **JWT**: Autenticación
- **bcryptjs**: Encriptación de contraseñas
- **Swagger**: Documentación API
- **Joi**: Validación de datos 