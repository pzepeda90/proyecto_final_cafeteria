# 📚 Documentación de API

Documentación completa de la API REST del Sistema de Gestión de Cafetería L'Bandito.

## 📋 Tabla de Contenidos

- [Información General](#-información-general)
- [Autenticación](#-autenticación)
- [Usuarios](#-usuarios)
- [Productos](#-productos)
- [Categorías](#-categorías)
- [Carrito](#-carrito)
- [Pedidos](#-pedidos)
- [Vendedores](#-vendedores)
- [Administración](#-administración)
- [Códigos de Error](#-códigos-de-error)
- [Rate Limiting](#-rate-limiting)
- [Ejemplos de Uso](#-ejemplos-de-uso)

## 🔧 Información General

### Base URL
```
Desarrollo: http://localhost:3000/api
Producción: https://api.cafeteria-lbandito.com/api
```

### Content-Type
Todas las peticiones deben incluir:
```http
Content-Type: application/json
```

### Autenticación
La mayoría de endpoints requieren autenticación mediante JWT:
```http
Authorization: Bearer <jwt_token>
```

### Formato de Respuesta

#### Respuesta Exitosa
```json
{
  "success": true,
  "data": {
    // Datos específicos del endpoint
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "requestId": "req_123456789"
  }
}
```

#### Respuesta de Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "details": [
      {
        "field": "email",
        "message": "Email es requerido"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### Paginación
Para endpoints que retornan listas:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 🔐 Autenticación

### Registro de Usuario
```http
POST /api/usuarios/registro
```

**Body:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@ejemplo.com",
  "password": "password123",
  "telefono": "+56912345678"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@ejemplo.com",
      "rol": "cliente",
      "activo": true,
      "fechaCreacion": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```http
POST /api/usuarios/login
```

**Body:**
```json
{
  "email": "juan@ejemplo.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@ejemplo.com",
      "rol": "cliente"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### Renovar Token
```http
POST /api/usuarios/refresh-token
Authorization: Bearer <current_token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### Logout
```http
POST /api/usuarios/logout
Authorization: Bearer <token>
```

## 👥 Usuarios

### Obtener Perfil
```http
GET /api/usuarios/perfil
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@ejemplo.com",
      "telefono": "+56912345678",
      "rol": "cliente",
      "activo": true,
      "fechaCreacion": "2024-01-15T10:30:00Z",
      "direcciones": [
        {
          "id": 1,
          "calle": "Av. Principal 123",
          "ciudad": "Santiago",
          "region": "Metropolitana",
          "codigoPostal": "8320000",
          "esPrincipal": true
        }
      ]
    }
  }
}
```

### Actualizar Perfil
```http
PUT /api/usuarios/perfil
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez González",
  "telefono": "+56987654321"
}
```

### Cambiar Contraseña
```http
PUT /api/usuarios/cambiar-password
Authorization: Bearer <token>
```

**Body:**
```json
{
  "passwordActual": "password123",
  "passwordNuevo": "newpassword456"
}
```

### Gestionar Direcciones

#### Listar Direcciones
```http
GET /api/usuarios/direcciones
Authorization: Bearer <token>
```

#### Agregar Dirección
```http
POST /api/usuarios/direcciones
Authorization: Bearer <token>
```

**Body:**
```json
{
  "calle": "Av. Libertador 456",
  "ciudad": "Valparaíso",
  "region": "Valparaíso",
  "codigoPostal": "2340000",
  "esPrincipal": false
}
```

#### Actualizar Dirección
```http
PUT /api/usuarios/direcciones/:id
Authorization: Bearer <token>
```

#### Eliminar Dirección
```http
DELETE /api/usuarios/direcciones/:id
Authorization: Bearer <token>
```

#### Establecer Dirección Principal
```http
PUT /api/usuarios/direcciones/:id/principal
Authorization: Bearer <token>
```

## 🛍️ Productos

### Listar Productos
```http
GET /api/productos
```

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Elementos por página (default: 20, max: 100)
- `categoria` (number): ID de categoría
- `buscar` (string): Término de búsqueda
- `precioMin` (number): Precio mínimo
- `precioMax` (number): Precio máximo
- `ordenar` (string): Campo de ordenamiento (`nombre`, `precio`, `fecha`)
- `direccion` (string): Dirección de ordenamiento (`asc`, `desc`)
- `activo` (boolean): Solo productos activos (default: true)

**Ejemplo:**
```http
GET /api/productos?categoria=1&buscar=café&precioMin=1000&precioMax=5000&ordenar=precio&direccion=asc&page=1&limit=10
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "productos": [
      {
        "id": 1,
        "nombre": "Café Americano",
        "descripcion": "Café negro tradicional",
        "precio": 2500,
        "stock": 50,
        "imagenUrl": "https://ejemplo.com/cafe-americano.jpg",
        "categoria": {
          "id": 1,
          "nombre": "Bebidas Calientes"
        },
        "vendedor": {
          "id": 1,
          "nombre": "Cafetería Central"
        },
        "activo": true,
        "fechaCreacion": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Obtener Producto por ID
```http
GET /api/productos/:id
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "producto": {
      "id": 1,
      "nombre": "Café Americano",
      "descripcion": "Café negro tradicional preparado con granos premium",
      "precio": 2500,
      "stock": 50,
      "imagenUrl": "https://ejemplo.com/cafe-americano.jpg",
      "categoria": {
        "id": 1,
        "nombre": "Bebidas Calientes",
        "descripcion": "Bebidas servidas calientes"
      },
      "vendedor": {
        "id": 1,
        "nombre": "Juan",
        "apellido": "Vendedor",
        "email": "vendedor@cafeteria.com"
      },
      "resenas": [
        {
          "id": 1,
          "calificacion": 5,
          "comentario": "Excelente café",
          "usuario": "María",
          "fecha": "2024-01-14T15:20:00Z"
        }
      ],
      "activo": true,
      "fechaCreacion": "2024-01-15T10:30:00Z",
      "fechaActualizacion": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Crear Producto (Solo Vendedores/Admin)
```http
POST /api/productos
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre": "Cappuccino Premium",
  "descripcion": "Cappuccino con leche vaporizada y arte latte",
  "precio": 3500,
  "stock": 30,
  "categoriaId": 1,
  "imagenUrl": "https://ejemplo.com/cappuccino.jpg"
}
```

### Actualizar Producto
```http
PUT /api/productos/:id
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre": "Cappuccino Premium Deluxe",
  "precio": 3800,
  "stock": 25
}
```

### Eliminar Producto (Soft Delete)
```http
DELETE /api/productos/:id
Authorization: Bearer <token>
```

### Subir Imagen de Producto
```http
POST /api/productos/:id/imagen
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
- `imagen`: Archivo de imagen (JPG, PNG, WebP, max 5MB)

## 📂 Categorías

### Listar Categorías
```http
GET /api/categorias
```

**Query Parameters:**
- `activo` (boolean): Solo categorías activas (default: true)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "categorias": [
      {
        "id": 1,
        "nombre": "Bebidas Calientes",
        "descripcion": "Café, té y otras bebidas servidas calientes",
        "activo": true,
        "cantidadProductos": 15
      },
      {
        "id": 2,
        "nombre": "Bebidas Frías",
        "descripcion": "Jugos, smoothies y bebidas refrescantes",
        "activo": true,
        "cantidadProductos": 8
      }
    ]
  }
}
```

### Crear Categoría (Solo Admin)
```http
POST /api/categorias
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre": "Postres",
  "descripcion": "Dulces y postres artesanales"
}
```

### Actualizar Categoría (Solo Admin)
```http
PUT /api/categorias/:id
Authorization: Bearer <token>
```

### Eliminar Categoría (Solo Admin)
```http
DELETE /api/categorias/:id
Authorization: Bearer <token>
```

## 🛒 Carrito

### Obtener Carrito
```http
GET /api/carritos/mi-carrito
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "carrito": {
      "id": 1,
      "usuarioId": 1,
      "items": [
        {
          "id": 1,
          "producto": {
            "id": 1,
            "nombre": "Café Americano",
            "precio": 2500,
            "imagenUrl": "https://ejemplo.com/cafe.jpg"
          },
          "cantidad": 2,
          "precioUnitario": 2500,
          "subtotal": 5000
        }
      ],
      "cantidadItems": 2,
      "subtotal": 5000,
      "impuestos": 950,
      "total": 5950,
      "fechaCreacion": "2024-01-15T10:30:00Z",
      "fechaActualizacion": "2024-01-15T11:00:00Z"
    }
  }
}
```

### Agregar Producto al Carrito
```http
POST /api/carritos/agregar
Authorization: Bearer <token>
```

**Body:**
```json
{
  "productoId": 1,
  "cantidad": 2
}
```

### Actualizar Cantidad de Producto
```http
PUT /api/carritos/items/:itemId
Authorization: Bearer <token>
```

**Body:**
```json
{
  "cantidad": 3
}
```

### Eliminar Producto del Carrito
```http
DELETE /api/carritos/items/:itemId
Authorization: Bearer <token>
```

### Vaciar Carrito
```http
DELETE /api/carritos/vaciar
Authorization: Bearer <token>
```

## 📦 Pedidos

### Crear Pedido
```http
POST /api/pedidos
Authorization: Bearer <token>
```

**Body:**
```json
{
  "direccionEntrega": {
    "calle": "Av. Principal 123",
    "ciudad": "Santiago",
    "region": "Metropolitana",
    "codigoPostal": "8320000"
  },
  "metodoPagoId": 1,
  "notas": "Tocar timbre, departamento 401",
  "tipoEntrega": "domicilio" // "domicilio" | "retiro"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "pedido": {
      "id": 1,
      "numeroPedido": "PED-20240115-001",
      "usuario": {
        "id": 1,
        "nombre": "Juan Pérez"
      },
      "items": [
        {
          "producto": {
            "id": 1,
            "nombre": "Café Americano"
          },
          "cantidad": 2,
          "precioUnitario": 2500,
          "subtotal": 5000
        }
      ],
      "subtotal": 5000,
      "impuestos": 950,
      "costoEnvio": 1500,
      "total": 7450,
      "estado": "pendiente",
      "tipoEntrega": "domicilio",
      "direccionEntrega": {
        "calle": "Av. Principal 123",
        "ciudad": "Santiago",
        "region": "Metropolitana"
      },
      "metodoPago": {
        "id": 1,
        "nombre": "Tarjeta de Crédito"
      },
      "fechaCreacion": "2024-01-15T10:30:00Z",
      "fechaEstimadaEntrega": "2024-01-15T12:30:00Z"
    }
  }
}
```

### Listar Mis Pedidos
```http
GET /api/pedidos/mis-pedidos
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Página
- `limit` (number): Elementos por página
- `estado` (string): Filtrar por estado
- `desde` (date): Fecha desde (YYYY-MM-DD)
- `hasta` (date): Fecha hasta (YYYY-MM-DD)

### Obtener Pedido por ID
```http
GET /api/pedidos/:id
Authorization: Bearer <token>
```

### Cancelar Pedido
```http
PUT /api/pedidos/:id/cancelar
Authorization: Bearer <token>
```

**Body:**
```json
{
  "motivo": "Cambié de opinión"
}
```

### Estados de Pedido
Los pedidos pueden tener los siguientes estados:
- `pendiente`: Pedido creado, esperando confirmación
- `confirmado`: Pedido confirmado, en preparación
- `preparando`: Pedido en preparación
- `listo`: Pedido listo para entrega/retiro
- `en_camino`: Pedido en camino (solo delivery)
- `entregado`: Pedido entregado exitosamente
- `cancelado`: Pedido cancelado
- `rechazado`: Pedido rechazado

## 🏪 Vendedores

### Registrar Vendedor (Solo Admin)
```http
POST /api/vendedores
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre": "María",
  "apellido": "Vendedora",
  "email": "maria@vendedor.com",
  "password": "password123",
  "telefono": "+56987654321",
  "nombreNegocio": "Cafetería Central"
}
```

### Listar Vendedores (Solo Admin)
```http
GET /api/vendedores
Authorization: Bearer <token>
```

### Dashboard del Vendedor
```http
GET /api/vendedores/dashboard
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "resumen": {
      "ventasHoy": 45600,
      "pedidosHoy": 8,
      "productosActivos": 12,
      "calificacionPromedio": 4.7
    },
    "ventasUltimos30Dias": [
      {
        "fecha": "2024-01-15",
        "ventas": 45600,
        "pedidos": 8
      }
    ],
    "productosMasVendidos": [
      {
        "producto": "Café Americano",
        "cantidadVendida": 25,
        "ingresos": 62500
      }
    ],
    "pedidosRecientes": [
      {
        "id": 1,
        "numeroPedido": "PED-20240115-001",
        "cliente": "Juan Pérez",
        "total": 7450,
        "estado": "preparando",
        "fecha": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Mis Productos (Vendedor)
```http
GET /api/vendedores/mis-productos
Authorization: Bearer <token>
```

### Mis Pedidos (Vendedor)
```http
GET /api/vendedores/mis-pedidos
Authorization: Bearer <token>
```

### Actualizar Estado de Pedido (Vendedor)
```http
PUT /api/vendedores/pedidos/:id/estado
Authorization: Bearer <token>
```

**Body:**
```json
{
  "estado": "preparando",
  "notas": "Comenzó la preparación del pedido"
}
```

## 👑 Administración

### Dashboard Admin
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "metricas": {
      "usuariosTotal": 1250,
      "usuariosNuevosHoy": 15,
      "ventasTotales": 1250000,
      "ventasHoy": 45600,
      "pedidosTotal": 850,
      "pedidosHoy": 25,
      "productosActivos": 120,
      "vendedoresActivos": 8
    },
    "ventasPorMes": [
      {
        "mes": "2024-01",
        "ventas": 1250000,
        "pedidos": 850
      }
    ],
    "topProductos": [
      {
        "nombre": "Café Americano",
        "ventasTotal": 125000,
        "cantidadVendida": 50
      }
    ],
    "topVendedores": [
      {
        "nombre": "María Vendedora",
        "ventasTotal": 250000,
        "pedidos": 120
      }
    ]
  }
}
```

### Gestión de Usuarios (Admin)

#### Listar Todos los Usuarios
```http
GET /api/admin/usuarios
Authorization: Bearer <token>
```

#### Actualizar Usuario
```http
PUT /api/admin/usuarios/:id
Authorization: Bearer <token>
```

#### Activar/Desactivar Usuario
```http
PUT /api/admin/usuarios/:id/estado
Authorization: Bearer <token>
```

**Body:**
```json
{
  "activo": false,
  "motivo": "Violación de términos de servicio"
}
```

### Gestión de Pedidos (Admin)

#### Listar Todos los Pedidos
```http
GET /api/admin/pedidos
Authorization: Bearer <token>
```

#### Reportes de Ventas
```http
GET /api/admin/reportes/ventas
Authorization: Bearer <token>
```

**Query Parameters:**
- `desde` (date): Fecha desde
- `hasta` (date): Fecha hasta
- `vendedor` (number): ID del vendedor
- `categoria` (number): ID de categoría

## ❌ Códigos de Error

### Códigos HTTP Estándar
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

### Códigos de Error Personalizados

| Código | Descripción |
|--------|-------------|
| `VALIDATION_ERROR` | Error de validación de datos |
| `AUTH_TOKEN_MISSING` | Token de autenticación faltante |
| `AUTH_TOKEN_INVALID` | Token de autenticación inválido |
| `AUTH_TOKEN_EXPIRED` | Token de autenticación expirado |
| `USER_NOT_FOUND` | Usuario no encontrado |
| `USER_INACTIVE` | Usuario inactivo |
| `EMAIL_ALREADY_EXISTS` | Email ya registrado |
| `INVALID_CREDENTIALS` | Credenciales inválidas |
| `INSUFFICIENT_PERMISSIONS` | Permisos insuficientes |
| `PRODUCT_NOT_FOUND` | Producto no encontrado |
| `PRODUCT_OUT_OF_STOCK` | Producto sin stock |
| `CART_EMPTY` | Carrito vacío |
| `ORDER_NOT_FOUND` | Pedido no encontrado |
| `ORDER_CANNOT_BE_CANCELLED` | Pedido no puede ser cancelado |
| `PAYMENT_FAILED` | Error en el pago |
| `FILE_TOO_LARGE` | Archivo muy grande |
| `INVALID_FILE_TYPE` | Tipo de archivo inválido |
| `RATE_LIMIT_EXCEEDED` | Límite de solicitudes excedido |

### Ejemplo de Respuesta de Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos proporcionados son inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email debe ser una dirección válida"
      },
      {
        "field": "password",
        "message": "Password debe tener al menos 8 caracteres"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

## 🚦 Rate Limiting

La API implementa rate limiting para prevenir abuso:

### Límites por Endpoint

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `POST /api/usuarios/login` | 5 requests | 15 minutos |
| `POST /api/usuarios/registro` | 3 requests | 60 minutos |
| `GET /api/productos` | 100 requests | 60 minutos |
| `POST /api/productos` | 10 requests | 60 minutos |
| `POST /api/pedidos` | 5 requests | 60 minutos |
| Otros endpoints | 50 requests | 60 minutos |

### Headers de Rate Limiting
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1642234567
```

### Respuesta cuando se excede el límite
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Demasiadas solicitudes. Intenta nuevamente en 15 minutos.",
    "retryAfter": 900
  }
}
```

## 💡 Ejemplos de Uso

### JavaScript (Fetch)
```javascript
// Login
const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/api/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      return data.data.user;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Error de login:', error);
    throw error;
  }
};

// Obtener productos con autenticación
const getProducts = async (filters = {}) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams(filters).toString();
  
  try {
    const response = await fetch(`http://localhost:3000/api/productos?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data.success ? data.data.productos : [];
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
};
```

### Python (Requests)
```python
import requests

class CafeteriaAPI:
    def __init__(self, base_url="http://localhost:3000/api"):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(f"{self.base_url}/usuarios/login", json={
            "email": email,
            "password": password
        })
        
        data = response.json()
        if data["success"]:
            self.token = data["data"]["token"]
            return data["data"]["user"]
        else:
            raise Exception(data["error"]["message"])
    
    def get_products(self, **filters):
        headers = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        
        response = requests.get(f"{self.base_url}/productos", 
                              headers=headers, 
                              params=filters)
        
        data = response.json()
        return data["data"]["productos"] if data["success"] else []

# Uso
api = CafeteriaAPI()
user = api.login("admin@cafeteria.com", "admin123")
products = api.get_products(categoria=1, limit=10)
```

### cURL Examples
```bash
# Login
curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cafeteria.com","password":"admin123"}'

# Obtener productos (con autenticación)
curl -X GET "http://localhost:3000/api/productos?categoria=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Crear producto
curl -X POST http://localhost:3000/api/productos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Nuevo Café",
    "descripcion": "Descripción del café",
    "precio": 3000,
    "stock": 20,
    "categoriaId": 1
  }'

# Subir imagen
curl -X POST http://localhost:3000/api/productos/1/imagen \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "imagen=@/path/to/image.jpg"
```

---

## 📞 Soporte

### Documentación Interactiva
- **Swagger UI**: http://localhost:3000/api-docs
- **Redoc**: http://localhost:3000/redoc

### Postman Collection
Importa nuestra colección de Postman: [Descargar Collection](link-to-postman-collection)

### Contacto
- 📧 **Email**: api-support@cafeteria-lbandito.com
- 📱 **WhatsApp**: +56 9 1234 5678
- 🐛 **Issues**: [GitHub Issues](https://github.com/tu-usuario/proyecto/issues)

---

**¡Gracias por usar nuestra API!** 🚀 