# API Cafetería El Bandito - Documentación

## Consideraciones de Seguridad y Mejoras

### 1. Validaciones
Todos los endpoints implementan validaciones robustas de datos de entrada:

#### Validaciones de Usuario
- **Nombre y Apellido**: 2-50 caracteres, solo letras
- **Email**: Formato válido, normalizado
- **Contraseña**: 
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número
  - Al menos un carácter especial
- **Teléfono**: 8-15 dígitos, formato internacional
- **Fecha de Nacimiento**: Formato de fecha válido

#### Validaciones de Producto
- **Nombre**: 3-100 caracteres
- **Descripción**: 10-1000 caracteres
- **Precio**: Número positivo
- **Stock**: Número entero positivo
- **Categoría**: ID válido

#### Validaciones de Pedido
- **Método de Pago**: ID válido
- **Dirección**: ID válido
- **Carrito**: ID válido

#### Validaciones de Reseña
- **Calificación**: Número entero entre 1 y 5
- **Comentario**: 10-500 caracteres

### 2. Seguridad

#### Rate Limiting
- **General**: 100 peticiones por 15 minutos
- **Autenticación**: 5 intentos por hora
- **Registro**: 3 registros por día por IP
- **API Pública**: 30 peticiones por minuto

#### Tokens JWT
- Expiración: 24 horas
- Renovación automática
- Validación en cada request autenticado

#### Headers de Seguridad
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Content-Security-Policy

### 3. Manejo de Errores

#### Sistema de Logging
- **Niveles**:
  - ERROR: Errores críticos
  - WARN: Advertencias
  - INFO: Información general
  - HTTP: Peticiones HTTP
  - DEBUG: Información de desarrollo

#### Archivos de Log
- `all.log`: Todos los logs
- `error.log`: Solo errores
- `http.log`: Logs de peticiones HTTP

#### Formato de Logs
```
[Timestamp] [Level]: [Message]
[Stack Trace] (para errores)
[Request Details] (para errores HTTP)
```

### 4. Optimización

#### Sistema de Caché
- **Duración**: 5 minutos por defecto
- **Entidades Cacheadas**:
  - Listados de productos
  - Categorías
  - Información de usuario
  - Carritos
  - Pedidos

#### Invalidación de Caché
- Automática al modificar datos
- Por patrón de clave
- Manual mediante endpoints administrativos

#### Estadísticas de Redis
- Clientes conectados
- Memoria utilizada
- Conexiones totales
- Comandos procesados

### 5. Códigos de Error Estándar
- **400**: Error de validación
- **401**: No autenticado
- **403**: No autorizado
- **404**: Recurso no encontrado
- **429**: Demasiadas peticiones
- **500**: Error interno del servidor

### 6. Respuestas de Error
```json
{
  "status": "error",
  "errors": [
    {
      "field": "nombre_campo",
      "message": "Descripción del error"
    }
  ]
}
```

## 1. Autenticación

### Registro de usuario
**POST /api/usuarios/registro**

**Request:**
```json
{
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "password": "string",
  "telefono": "string",
  "fecha_nacimiento": "string"
}
```

**Response (201):**
```json
{
  "mensaje": "Usuario registrado correctamente",
  "usuario": {
    "usuario_id": "number",
    "nombre": "string",
    "apellido": "string",
    "email": "string",
    "telefono": "string",
    "fecha_registro": "string",
    "activo": "boolean"
  },
  "token": "string"
}
```

### Login
**POST /api/usuarios/login**

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "mensaje": "Login exitoso",
  "usuario": {
    "usuario_id": "number",
    "nombre": "string",
    "apellido": "string",
    "email": "string",
    "telefono": "string",
    "fecha_registro": "string",
    "activo": "boolean"
  },
  "token": "string"
}
```

## 2. Usuarios

### Obtener Perfil de Usuario
**GET /api/usuarios/perfil**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "usuario_id": "number",
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "telefono": "string",
  "fecha_nacimiento": "string",
  "fecha_registro": "string",
  "activo": "boolean"
}
```

### Actualizar Perfil de Usuario
**PUT /api/usuarios/perfil**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "telefono": "string",
  "fecha_nacimiento": "string"
}
```

**Response (200):**
```json
{
  "mensaje": "Perfil actualizado correctamente",
  "usuario": {
    "usuario_id": "number",
    "nombre": "string",
    "apellido": "string",
    "email": "string",
    "telefono": "string",
    "fecha_nacimiento": "string",
    "activo": "boolean"
  }
}
```

### Cambiar Contraseña
**PUT /api/usuarios/cambiar-password**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "password_actual": "string",
  "password_nueva": "string",
  "password_confirmacion": "string"
}
```

**Response (200):**
```json
{
  "mensaje": "Contraseña actualizada correctamente"
}
```

### Obtener Direcciones del Usuario
**GET /api/usuarios/direcciones**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "direccion_id": "number",
    "usuario_id": "number",
    "calle": "string",
    "numero": "string",
    "ciudad": "string",
    "comuna": "string",
    "codigo_postal": "string",
    "pais": "string",
    "principal": "boolean",
    "created_at": "string",
    "updated_at": "string"
  }
]
```

### Agregar Dirección
**POST /api/usuarios/direcciones**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "calle": "string",
  "numero": "string",
  "ciudad": "string",
  "comuna": "string",
  "codigo_postal": "string",
  "pais": "string",
  "principal": "boolean"
}
```

**Response (201):**
```json
{
  "mensaje": "Dirección agregada correctamente",
  "direccion": {
    "direccion_id": "number",
    "usuario_id": "number",
    "calle": "string",
    "numero": "string",
    "ciudad": "string",
    "comuna": "string",
    "codigo_postal": "string",
    "pais": "string",
    "principal": "boolean",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

### Actualizar Dirección
**PUT /api/usuarios/direcciones/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "calle": "string",
  "numero": "string",
  "ciudad": "string",
  "comuna": "string",
  "codigo_postal": "string",
  "pais": "string"
}
```

**Response (200):**
```json
{
  "mensaje": "Dirección actualizada correctamente",
  "direccion": {
    "direccion_id": "number",
    "usuario_id": "number",
    "calle": "string",
    "numero": "string",
    "ciudad": "string",
    "comuna": "string",
    "codigo_postal": "string",
    "pais": "string",
    "principal": "boolean",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

### Eliminar Dirección
**DELETE /api/usuarios/direcciones/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mensaje": "Dirección eliminada correctamente"
}
```

### Establecer Dirección Principal
**PUT /api/usuarios/direcciones/:id/principal**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mensaje": "Dirección establecida como principal"
}
```

## 3. Productos

### Obtener Todos los Productos
**GET /api/productos**

**Parámetros de consulta opcionales:**
- `categoria_id`: Filtrar por categoría
- `disponible`: Filtrar por disponibilidad (true/false)
- `vendedor_id`: Filtrar por vendedor

**Response (200):**
```json
[
  {
    "producto_id": "number",
    "nombre": "string",
    "descripcion": "string",
    "precio": "number",
    "imagen_url": "string",
    "categoria_id": "number",
    "categoria_nombre": "string",
    "vendedor_id": "number",
    "vendedor_nombre": "string",
    "stock": "number",
    "disponible": "boolean",
    "created_at": "string",
    "updated_at": "string",
    "imagenes": [
      {
        "imagen_id": "number",
        "url": "string",
        "descripcion": "string",
        "orden": "number"
      }
    ]
  }
]
```

### Obtener Producto por ID
**GET /api/productos/:id**

**Response (200):**
```json
{
  "producto_id": "number",
  "nombre": "string",
  "descripcion": "string",
  "precio": "number",
  "imagen_url": "string",
  "categoria_id": "number",
  "categoria_nombre": "string",
  "vendedor_id": "number",
  "vendedor_nombre": "string",
  "stock": "number",
  "disponible": "boolean",
  "created_at": "string",
  "updated_at": "string",
  "imagenes": [
    {
      "imagen_id": "number",
      "url": "string",
      "descripcion": "string",
      "orden": "number"
    }
  ],
  "reseñas": [
    {
      "reseña_id": "number",
      "usuario_id": "number",
      "calificacion": "number",
      "comentario": "string",
      "fecha_reseña": "string",
      "usuario_nombre": "string"
    }
  ]
}
```

### Crear Producto (admin)
**POST /api/productos**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nombre": "string",
  "descripcion": "string",
  "precio": "number",
  "imagen_url": "string",
  "categoria_id": "number",
  "stock": "number",
  "disponible": "boolean",
  "vendedor_id": "number",
  "imagenes_adicionales": [
    {
      "url": "string",
      "descripcion": "string",
      "orden": "number"
    }
  ]
}
```

**Response (201):**
```json
{
  "producto_id": "number",
  "nombre": "string",
  "descripcion": "string",
  "precio": "number",
  "imagen_url": "string",
  "categoria_id": "number",
  "vendedor_id": "number",
  "stock": "number",
  "disponible": "boolean",
  "created_at": "string",
  "updated_at": "string",
  "imagenes": [
    {
      "imagen_id": "number",
      "url": "string",
      "descripcion": "string",
      "orden": "number"
    }
  ]
}
```

### Actualizar Producto (admin)
**PUT /api/productos/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nombre": "string",
  "descripcion": "string",
  "precio": "number",
  "imagen_url": "string",
  "categoria_id": "number",
  "stock": "number",
  "disponible": "boolean"
}
```

**Response (200):**
```json
{
  "producto_id": "number",
  "nombre": "string",
  "descripcion": "string",
  "precio": "number",
  "imagen_url": "string",
  "categoria_id": "number",
  "vendedor_id": "number",
  "stock": "number",
  "disponible": "boolean",
  "created_at": "string",
  "updated_at": "string"
}
```

### Eliminar Producto (admin)
**DELETE /api/productos/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mensaje": "Producto eliminado correctamente",
  "producto": {
    "producto_id": "number",
    "nombre": "string",
    "descripcion": "string",
    "precio": "number",
    "imagen_url": "string",
    "categoria_id": "number",
    "disponible": "boolean"
  }
}
```

### Agregar Imagen a Producto (admin)
**POST /api/productos/:id/imagenes**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "url": "string",
  "descripcion": "string",
  "orden": "number"
}
```

**Response (201):**
```json
{
  "mensaje": "Imagen agregada correctamente",
  "imagen": {
    "imagen_id": "number",
    "producto_id": "number",
    "url": "string",
    "descripcion": "string",
    "orden": "number",
    "created_at": "string"
  }
}
```

## 4. Categorías

### Obtener Todas las Categorías
**GET /api/categorias**

**Response (200):**
```json
[
  {
    "categoria_id": "number",
    "nombre": "string",
    "descripcion": "string",
    "imagen_url": "string",
    "created_at": "string",
    "updated_at": "string"
  }
]
```

### Obtener Categoría por ID
**GET /api/categorias/:id**

**Response (200):**
```json
{
  "categoria_id": "number",
  "nombre": "string",
  "descripcion": "string",
  "imagen_url": "string",
  "created_at": "string",
  "updated_at": "string",
  "productos": [
    {
      "producto_id": "number",
      "nombre": "string",
      "precio": "number",
      "imagen_url": "string"
    }
  ]
}
```

### Crear Categoría (admin)
**POST /api/categorias**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nombre": "string",
  "descripcion": "string",
  "imagen_url": "string"
}
```

**Response (201):**
```json
{
  "categoria_id": "number",
  "nombre": "string",
  "descripcion": "string",
  "imagen_url": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

### Actualizar Categoría (admin)
**PUT /api/categorias/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nombre": "string",
  "descripcion": "string",
  "imagen_url": "string"
}
```

**Response (200):**
```json
{
  "categoria_id": "number",
  "nombre": "string",
  "descripcion": "string",
  "imagen_url": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

### Eliminar Categoría (admin)
**DELETE /api/categorias/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mensaje": "Categoría eliminada correctamente",
  "categoria": {
    "categoria_id": "number",
    "nombre": "string",
    "descripcion": "string",
    "imagen_url": "string"
  }
}
```

## 5. Vendedores

### Obtener Todos los Vendedores
**GET /api/vendedores**

**Response (200):**
```json
[
  {
    "vendedor_id": "number",
    "nombre": "string",
    "apellido": "string",
    "email": "string",
    "telefono": "string",
    "fecha_contratacion": "string",
    "activo": "boolean",
    "created_at": "string",
    "updated_at": "string"
  }
]
```

### Obtener Vendedor por ID
**GET /api/vendedores/:id**

**Response (200):**
```json
{
  "vendedor_id": "number",
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "telefono": "string",
  "fecha_contratacion": "string",
  "activo": "boolean",
  "created_at": "string",
  "updated_at": "string",
  "productos": [
    {
      "producto_id": "number",
      "nombre": "string",
      "precio": "number",
      "imagen_url": "string"
    }
  ]
}
```

### Crear Vendedor (admin)
**POST /api/vendedores**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "password": "string",
  "telefono": "string"
}
```

**Response (201):**
```json
{
  "vendedor_id": "number",
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "telefono": "string",
  "fecha_contratacion": "string",
  "activo": "boolean",
  "created_at": "string",
  "updated_at": "string"
}
```

### Actualizar Vendedor (admin)
**PUT /api/vendedores/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "telefono": "string",
  "activo": "boolean"
}
```

**Response (200):**
```json
{
  "vendedor_id": "number",
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "telefono": "string",
  "fecha_contratacion": "string",
  "activo": "boolean",
  "created_at": "string",
  "updated_at": "string"
}
```

### Eliminar Vendedor (admin)
**DELETE /api/vendedores/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mensaje": "Vendedor eliminado correctamente",
  "vendedor": {
    "vendedor_id": "number",
    "nombre": "string",
    "apellido": "string",
    "email": "string"
  }
}
```

## 6. Carrito

### Obtener Carrito del Usuario
**GET /api/carritos**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "carrito_id": "number",
  "usuario_id": "number",
  "created_at": "string",
  "updated_at": "string",
  "total": "number",
  "detalles": [
    {
      "detalle_carrito_id": "number",
      "carrito_id": "number",
      "producto_id": "number",
      "nombre_producto": "string",
      "precio": "number",
      "cantidad": "number",
      "subtotal": "number",
      "imagen_url": "string",
      "created_at": "string"
    }
  ]
}
```

### Agregar Producto al Carrito
**POST /api/carritos/agregar**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "producto_id": "number",
  "cantidad": "number"
}
```

**Response (200):**
```json
{
  "mensaje": "Producto agregado al carrito",
  "carrito": {
    "carrito_id": "number",
    "usuario_id": "number",
    "total": "number",
    "detalles": [
      {
        "detalle_carrito_id": "number",
        "carrito_id": "number",
        "producto_id": "number",
        "nombre_producto": "string",
        "precio": "number",
        "cantidad": "number",
        "subtotal": "number",
        "imagen_url": "string",
        "created_at": "string"
      }
    ]
  }
}
```

### Actualizar Cantidad de Producto
**PUT /api/carritos/actualizar**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "producto_id": "number",
  "cantidad": "number"
}
```

**Response (200):**
```json
{
  "mensaje": "Cantidad actualizada",
  "carrito": {
    "carrito_id": "number",
    "usuario_id": "number",
    "total": "number",
    "detalles": [
      {
        "detalle_carrito_id": "number",
        "carrito_id": "number",
        "producto_id": "number",
        "nombre_producto": "string",
        "precio": "number",
        "cantidad": "number",
        "subtotal": "number",
        "imagen_url": "string",
        "created_at": "string"
      }
    ]
  }
}
```

### Eliminar Producto del Carrito
**DELETE /api/carritos/producto/:producto_id**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mensaje": "Producto eliminado del carrito",
  "carrito": {
    "carrito_id": "number",
    "usuario_id": "number",
    "total": "number",
    "detalles": [
      {
        "detalle_carrito_id": "number",
        "carrito_id": "number",
        "producto_id": "number",
        "nombre_producto": "string",
        "precio": "number",
        "cantidad": "number",
        "subtotal": "number",
        "imagen_url": "string",
        "created_at": "string"
      }
    ]
  }
}
```

### Vaciar el Carrito
**DELETE /api/carritos/vaciar**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mensaje": "Carrito vaciado correctamente",
  "carrito": {
    "carrito_id": "number",
    "usuario_id": "number",
    "total": 0,
    "detalles": []
  }
}
```

## 7. Pedidos

### Obtener Todos los Pedidos
**GET /api/pedidos**

**Headers:**
```
Authorization: Bearer <token>
```

**Parámetros de consulta opcionales:**
- `estado_pedido_id`: Filtrar por estado
- `fecha_inicio`: Filtrar por fecha de inicio
- `fecha_fin`: Filtrar por fecha de fin

**Response (200) para admin:**
```json
[
  {
    "pedido_id": "number",
    "usuario_id": "number",
    "nombre_usuario": "string",
    "apellido_usuario": "string",
    "direccion_id": "number",
    "metodo_pago_id": "number",
    "metodo_pago_nombre": "string",
    "estado_pedido_id": "number",
    "estado_pedido_nombre": "string",
    "subtotal": "number",
    "impuestos": "number",
    "total": "number",
    "fecha_pedido": "string",
    "carrito_id": "number",
    "created_at": "string",
    "updated_at": "string"
  }
]
```

**Response (200) para cliente:**
```json
[
  {
    "pedido_id": "number",
    "direccion_id": "number",
    "metodo_pago_id": "number",
    "metodo_pago_nombre": "string",
    "estado_pedido_id": "number",
    "estado_pedido_nombre": "string",
    "subtotal": "number",
    "impuestos": "number",
    "total": "number",
    "fecha_pedido": "string",
    "created_at": "string",
    "updated_at": "string"
  }
]
```

### Obtener Pedido por ID
**GET /api/pedidos/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "pedido_id": "number",
  "usuario_id": "number",
  "nombre_usuario": "string",
  "apellido_usuario": "string",
  "direccion_id": "number",
  "direccion": {
    "calle": "string",
    "numero": "string",
    "ciudad": "string",
    "comuna": "string",
    "codigo_postal": "string",
    "pais": "string"
  },
  "metodo_pago_id": "number",
  "metodo_pago_nombre": "string",
  "estado_pedido_id": "number",
  "estado_pedido_nombre": "string",
  "subtotal": "number",
  "impuestos": "number",
  "total": "number",
  "fecha_pedido": "string",
  "carrito_id": "number",
  "created_at": "string",
  "updated_at": "string",
  "detalles": [
    {
      "detalle_id": "number",
      "pedido_id": "number",
      "producto_id": "number",
      "nombre_producto": "string",
      "cantidad": "number",
      "precio_unitario": "number",
      "subtotal": "number"
    }
  ]
}
```

### Obtener Historial de Estados de un Pedido
**GET /api/pedidos/:id/historial**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "historial_id": "number",
    "pedido_id": "number",
    "estado_pedido_id": "number",
    "estado_pedido_nombre": "string",
    "fecha_cambio": "string",
    "comentario": "string"
  }
]
```

### Crear Pedido
**POST /api/pedidos**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "metodo_pago_id": "number",
  "direccion_id": "number",
  "carrito_id": "number"
}
```

**Response (201):**
```json
{
  "mensaje": "Pedido creado correctamente",
  "pedido": {
    "pedido_id": "number",
    "usuario_id": "number",
    "metodo_pago_id": "number",
    "direccion_id": "number",
    "carrito_id": "number",
    "estado_pedido_id": "number",
    "estado_pedido_nombre": "string",
    "subtotal": "number",
    "impuestos": "number",
    "total": "number",
    "fecha_pedido": "string",
    "detalles": [
      {
        "producto_id": "number",
        "nombre_producto": "string",
        "cantidad": "number",
        "precio_unitario": "number",
        "subtotal": "number"
      }
    ]
  }
}
```

### Actualizar Estado de Pedido (admin)
**PUT /api/pedidos/:id/estado**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "estado_pedido_id": "number",
  "comentario": "string"
}
```

**Response (200):**
```json
{
  "mensaje": "Estado de pedido actualizado correctamente",
  "pedido": {
    "pedido_id": "number",
    "usuario_id": "number",
    "estado_pedido_id": "number",
    "estado_pedido_nombre": "string",
    "subtotal": "number",
    "impuestos": "number",
    "total": "number",
    "fecha_pedido": "string",
    "updated_at": "string"
  }
}
```

## 8. Métodos de Pago

### Obtener Todos los Métodos de Pago
**GET /api/metodos-pago**

**Response (200):**
```json
[
  {
    "metodo_pago_id": "number",
    "nombre": "string",
    "descripcion": "string",
    "activo": "boolean"
  }
]
```

### Obtener Método de Pago por ID
**GET /api/metodos-pago/:id**

**Response (200):**
```json
{
  "metodo_pago_id": "number",
  "nombre": "string",
  "descripcion": "string",
  "activo": "boolean"
}
```

### Crear Método de Pago (admin)
**POST /api/metodos-pago**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nombre": "string",
  "descripcion": "string",
  "activo": "boolean"
}
```

**Response (201):**
```json
{
  "metodo_pago_id": "number",
  "nombre": "string",
  "descripcion": "string",
  "activo": "boolean"
}
```

### Actualizar Método de Pago (admin)
**PUT /api/metodos-pago/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nombre": "string",
  "descripcion": "string",
  "activo": "boolean"
}
```

**Response (200):**
```json
{
  "metodo_pago_id": "number",
  "nombre": "string",
  "descripcion": "string",
  "activo": "boolean"
}
```

### Eliminar Método de Pago (admin)
**DELETE /api/metodos-pago/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mensaje": "Método de pago eliminado correctamente",
  "metodo_pago": {
    "metodo_pago_id": "number",
    "nombre": "string",
    "descripcion": "string"
  }
}
```

## 9. Estados de Pedido

### Obtener Todos los Estados de Pedido
**GET /api/estados-pedido**

**Response (200):**
```json
[
  {
    "estado_pedido_id": "number",
    "nombre": "string",
    "descripcion": "string"
  }
]
```

### Obtener Estado de Pedido por ID
**GET /api/estados-pedido/:id**

**Response (200):**
```json
{
  "estado_pedido_id": "number",
  "nombre": "string",
  "descripcion": "string"
}
```

### Crear Estado de Pedido (admin)
**POST /api/estados-pedido**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nombre": "string",
  "descripcion": "string"
}
```

**Response (201):**
```json
{
  "estado_pedido_id": "number",
  "nombre": "string",
  "descripcion": "string"
}
```

### Actualizar Estado de Pedido (admin)
**PUT /api/estados-pedido/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nombre": "string",
  "descripcion": "string"
}
```

**Response (200):**
```json
{
  "estado_pedido_id": "number",
  "nombre": "string",
  "descripcion": "string"
}
```

### Eliminar Estado de Pedido (admin)
**DELETE /api/estados-pedido/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mensaje": "Estado de pedido eliminado correctamente",
  "estado_pedido": {
    "estado_pedido_id": "number",
    "nombre": "string",
    "descripcion": "string"
  }
}
```

## 10. Reseñas

### Obtener Reseñas de un Producto
**GET /api/productos/:id/reseñas**

**Response (200):**
```json
[
  {
    "reseña_id": "number",
    "usuario_id": "number",
    "usuario_nombre": "string",
    "producto_id": "number",
    "calificacion": "number",
    "comentario": "string",
    "fecha_reseña": "string"
  }
]
```

### Crear Reseña
**POST /api/productos/:id/reseñas**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "calificacion": "number",
  "comentario": "string"
}
```

**Response (201):**
```json
{
  "mensaje": "Reseña agregada correctamente",
  "reseña": {
    "reseña_id": "number",
    "usuario_id": "number",
    "producto_id": "number",
    "calificacion": "number",
    "comentario": "string",
    "fecha_reseña": "string"
  }
}
```

### Actualizar Reseña
**PUT /api/reseñas/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "calificacion": "number",
  "comentario": "string"
}
```

**Response (200):**
```json
{
  "mensaje": "Reseña actualizada correctamente",
  "reseña": {
    "reseña_id": "number",
    "usuario_id": "number",
    "producto_id": "number",
    "calificacion": "number",
    "comentario": "string",
    "fecha_reseña": "string"
  }
}
```

### Eliminar Reseña
**DELETE /api/reseñas/:id**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mensaje": "Reseña eliminada correctamente"
}
```

## 11. Códigos de Error Comunes

- **400 Bad Request**: Solicitud inválida o datos incorrectos
- **401 Unauthorized**: No autenticado o token inválido
- **403 Forbidden**: No tiene permisos para acceder al recurso
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error en el servidor 