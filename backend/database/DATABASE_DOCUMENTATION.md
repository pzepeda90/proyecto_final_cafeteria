# 📊 DOCUMENTACIÓN DE BASE DE DATOS - CAFETERÍA L'BANDITO

## **Información General**
- **Nombre**: `cafeteria_l_bandito`
- **Motor**: PostgreSQL 14.17+
- **Versión del esquema**: 2.0 (Actualizada después de testing)
- **Fecha de actualización**: Diciembre 2024
- **Charset**: UTF8

---

## **🏗️ ARQUITECTURA DE LA BASE DE DATOS**

### **Tipos de Datos Personalizados (ENUM)**

#### `enum_mesas_estado`
Estados posibles para las mesas del local:
- `disponible` - Mesa libre para uso
- `ocupada` - Mesa actualmente en uso
- `reservada` - Mesa reservada para cliente específico
- `fuera_servicio` - Mesa no disponible por mantenimiento

#### `enum_pedidos_tipo_entrega`
Tipos de entrega disponibles:
- `local` - Consumo en el local
- `domicilio` - Entrega a domicilio
- `takeaway` - Para llevar

---

## **📋 TABLAS PRINCIPALES**

### **1. USUARIOS (`usuarios`)**
Tabla central de usuarios del sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `usuario_id` | SERIAL | PRIMARY KEY | ID único del usuario |
| `nombre` | VARCHAR(255) | NOT NULL | Nombre del usuario |
| `apellido` | VARCHAR(255) | NOT NULL | Apellido del usuario |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email único |
| `password_hash` | VARCHAR(255) | NOT NULL | Hash de la contraseña |
| `telefono` | VARCHAR(255) | NULL | Teléfono de contacto |
| `fecha_nacimiento` | TIMESTAMP WITH TIME ZONE | NULL | Fecha de nacimiento |
| `fecha_registro` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de registro |
| `activo` | BOOLEAN | DEFAULT true | Estado del usuario |

**Índices:**
- `usuarios_email` - Índice único en email

---

### **2. VENDEDORES (`vendedores`)**
Tabla de empleados/vendedores de la cafetería.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `vendedor_id` | SERIAL | PRIMARY KEY | ID único del vendedor |
| `usuario_id` | INTEGER | FK usuarios | Referencia a usuario (opcional) |
| `nombre` | VARCHAR(255) | NOT NULL | Nombre del vendedor |
| `apellido` | VARCHAR(255) | NOT NULL | Apellido del vendedor |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email único |
| `password_hash` | VARCHAR(255) | NOT NULL | Hash de la contraseña |
| `telefono` | VARCHAR(255) | NULL | Teléfono de contacto |
| `fecha_contratacion` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de contratación |
| `activo` | BOOLEAN | DEFAULT true | Estado del vendedor |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de actualización |

---

### **3. PRODUCTOS (`productos`)**
Catálogo de productos de la cafetería.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `producto_id` | SERIAL | PRIMARY KEY | ID único del producto |
| `categoria_id` | INTEGER | NOT NULL, FK categorias | Categoría del producto |
| `nombre` | VARCHAR(255) | NOT NULL | Nombre del producto |
| `descripcion` | TEXT | NULL | Descripción detallada |
| `precio` | NUMERIC(10,2) | NOT NULL | Precio del producto |
| `imagen_url` | VARCHAR(255) | NULL | URL de la imagen |
| `stock` | INTEGER | DEFAULT 0 | Cantidad en stock |
| `disponible` | BOOLEAN | DEFAULT true | Disponibilidad |
| `vendedor_id` | INTEGER | NOT NULL, FK vendedores | Vendedor responsable |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `productos_categoria_id` - Búsqueda por categoría
- `productos_nombre` - Búsqueda por nombre
- `productos_vendedor_id` - Productos por vendedor

---

### **4. CATEGORÍAS (`categorias`)**
Categorías de productos.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `categoria_id` | SERIAL | PRIMARY KEY | ID único de la categoría |
| `nombre` | VARCHAR(255) | NOT NULL, UNIQUE | Nombre de la categoría |
| `descripcion` | VARCHAR(255) | NULL | Descripción |
| `imagen_url` | VARCHAR(255) | NULL | URL de imagen |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de actualización |

**Categorías por defecto:**
- `bebidas_calientes` - Café, té, chocolate caliente
- `bebidas_frias` - Jugos, smoothies, bebidas heladas
- `comida_salada` - Sandwiches, ensaladas, platos principales
- `postres` - Pasteles, galletas, dulces
- `snacks` - Aperitivos y bocadillos

---

### **5. MESAS (`mesas`)**
Mesas del local de la cafetería.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `mesa_id` | SERIAL | PRIMARY KEY | ID único de la mesa |
| `numero` | VARCHAR(10) | NOT NULL, UNIQUE | Número de mesa |
| `capacidad` | INTEGER | NOT NULL, DEFAULT 4 | Capacidad de personas |
| `ubicacion` | VARCHAR(100) | NULL | Ubicación en el local |
| `estado` | enum_mesas_estado | NOT NULL, DEFAULT 'disponible' | Estado actual |
| `activa` | BOOLEAN | DEFAULT true | Si está activa |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `mesas_estado` - Búsqueda por estado
- `mesas_activa` - Mesas activas
- `mesas_numero` - Índice único por número

---

### **6. CARRITOS (`carritos`)**
Carritos de compra de los usuarios.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `carrito_id` | SERIAL | PRIMARY KEY | ID único del carrito |
| `usuario_id` | INTEGER | NOT NULL, FK usuarios | Usuario propietario |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de actualización |

---

### **7. DETALLES CARRITO (`detalles_carrito`)**
Items dentro de cada carrito.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `detalle_carrito_id` | SERIAL | PRIMARY KEY | ID único del detalle |
| `carrito_id` | INTEGER | NOT NULL, FK carritos | Carrito al que pertenece |
| `producto_id` | INTEGER | NOT NULL, FK productos | Producto agregado |
| `cantidad` | INTEGER | NOT NULL | Cantidad del producto |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de creación |

---

### **8. PEDIDOS (`pedidos`)**
Pedidos realizados por los usuarios.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `pedido_id` | SERIAL | PRIMARY KEY | ID único del pedido |
| `usuario_id` | INTEGER | NOT NULL, FK usuarios | Usuario que realizó el pedido |
| `direccion_id` | INTEGER | FK direcciones, NULL | Dirección de entrega |
| `metodo_pago_id` | INTEGER | NOT NULL, FK metodos_pago | Método de pago |
| `carrito_id` | INTEGER | FK carritos, NULL | Carrito origen |
| `estado_pedido_id` | INTEGER | NOT NULL, FK estados_pedido, DEFAULT 1 | Estado actual |
| `subtotal` | NUMERIC(10,2) | NOT NULL | Subtotal del pedido |
| `impuestos` | NUMERIC(10,2) | NOT NULL | Impuestos aplicados |
| `total` | NUMERIC(10,2) | NOT NULL | Total a pagar |
| `fecha_pedido` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha del pedido |
| `tipo_entrega` | enum_pedidos_tipo_entrega | DEFAULT 'local' | Tipo de entrega |
| `notas` | TEXT | NULL | Notas adicionales |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `pedidos_usuario_id` - Pedidos por usuario
- `pedidos_estado_pedido_id` - Pedidos por estado
- `pedidos_metodo_pago_id` - Pedidos por método de pago
- `pedidos_direccion_id` - Pedidos por dirección
- `pedidos_carrito_id` - Pedidos por carrito

---

### **9. DETALLES PEDIDO (`detalles_pedido`)**
Items específicos de cada pedido.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `detalle_id` | SERIAL | PRIMARY KEY | ID único del detalle |
| `pedido_id` | INTEGER | NOT NULL, FK pedidos | Pedido al que pertenece |
| `producto_id` | INTEGER | NOT NULL, FK productos | Producto pedido |
| `cantidad` | INTEGER | NOT NULL | Cantidad pedida |
| `precio_unitario` | NUMERIC(10,2) | NOT NULL | Precio unitario al momento |
| `subtotal` | NUMERIC(10,2) | NOT NULL | Subtotal del item |

---

## **🔧 TABLAS DE CONFIGURACIÓN**

### **ROLES (`roles`)**
Roles de usuario en el sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `rol_id` | SERIAL PRIMARY KEY | ID único del rol |
| `nombre` | VARCHAR(255) UNIQUE | Nombre del rol |
| `descripcion` | VARCHAR(255) | Descripción del rol |

**Roles por defecto:**
- `admin` - Administrador del sistema
- `vendedor` - Vendedor de la cafetería  
- `cliente` - Cliente de la cafetería

### **ESTADOS PEDIDO (`estados_pedido`)**
Estados posibles de los pedidos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `estado_pedido_id` | SERIAL PRIMARY KEY | ID único del estado |
| `nombre` | VARCHAR(255) UNIQUE | Nombre del estado |
| `descripcion` | VARCHAR(255) | Descripción del estado |

**Estados por defecto:**
- `pendiente` - Pedido pendiente de preparación
- `preparando` - Pedido en preparación
- `listo` - Pedido listo para entregar
- `entregado` - Pedido entregado al cliente
- `cancelado` - Pedido cancelado

### **MÉTODOS PAGO (`metodos_pago`)**
Métodos de pago disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `metodo_pago_id` | SERIAL PRIMARY KEY | ID único del método |
| `nombre` | VARCHAR(255) UNIQUE | Nombre del método |
| `descripcion` | VARCHAR(255) | Descripción del método |

**Métodos por defecto:**
- `efectivo` - Pago en efectivo
- `tarjeta` - Pago con tarjeta de crédito/débito
- `transferencia` - Transferencia bancaria
- `app_movil` - Pago por aplicación móvil

---

## **🔗 TABLAS DE RELACIÓN**

### **USUARIO ROL (`usuario_rol`)**
Relación muchos a muchos entre usuarios y roles.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `usuario_id` | INTEGER | FK usuarios, parte de PK |
| `rol_id` | INTEGER | FK roles, parte de PK |

**Índices:**
- `usuario_rol_usuario_id` - Roles por usuario
- `usuario_rol_rol_id` - Usuarios por rol
- `usuario_rol_usuario_id_rol_id` - Índice único compuesto

---

## **📍 TABLAS ADICIONALES**

### **DIRECCIONES (`direcciones`)**
Direcciones de entrega de los usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `direccion_id` | SERIAL PRIMARY KEY | ID único |
| `usuario_id` | INTEGER FK usuarios | Usuario propietario |
| `calle` | VARCHAR(255) NOT NULL | Calle |
| `numero` | VARCHAR(10) | Número |
| `comuna` | VARCHAR(100) | Comuna |
| `ciudad` | VARCHAR(100) | Ciudad |
| `region` | VARCHAR(100) | Región |
| `codigo_postal` | VARCHAR(10) | Código postal |
| `referencia` | TEXT | Referencia adicional |
| `activa` | BOOLEAN DEFAULT true | Si está activa |

### **HISTORIAL ESTADO PEDIDO (`historial_estado_pedido`)**
Historial de cambios de estado de pedidos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `historial_id` | SERIAL PRIMARY KEY | ID único |
| `pedido_id` | INTEGER FK pedidos | Pedido |
| `estado_anterior_id` | INTEGER FK estados_pedido | Estado anterior |
| `estado_nuevo_id` | INTEGER FK estados_pedido | Estado nuevo |
| `fecha_cambio` | TIMESTAMP DEFAULT NOW() | Fecha del cambio |
| `observaciones` | TEXT | Observaciones |

### **IMÁGENES PRODUCTO (`imagenes_producto`)**
Imágenes adicionales de productos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `imagen_id` | SERIAL PRIMARY KEY | ID único |
| `producto_id` | INTEGER FK productos | Producto |
| `url` | VARCHAR(255) NOT NULL | URL de la imagen |
| `descripcion` | VARCHAR(255) | Descripción |
| `orden` | INTEGER DEFAULT 1 | Orden de visualización |

### **RESEÑAS (`resenas`)**
Reseñas de productos por usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `resena_id` | SERIAL PRIMARY KEY | ID único |
| `usuario_id` | INTEGER FK usuarios | Usuario |
| `producto_id` | INTEGER FK productos | Producto |
| `calificacion` | INTEGER CHECK (1-5) | Calificación 1-5 |
| `comentario` | TEXT | Comentario |
| `fecha_resena` | TIMESTAMP DEFAULT NOW() | Fecha |

---

## **⚡ OPTIMIZACIONES**

### **Índices Implementados**
- **Usuarios**: email (único)
- **Productos**: categoria_id, nombre, vendedor_id
- **Pedidos**: usuario_id, estado_pedido_id, metodo_pago_id, direccion_id, carrito_id
- **Mesas**: estado, activa, numero (único)
- **Usuario_rol**: usuario_id, rol_id, compuesto único

### **Triggers Automáticos**
- **updated_at**: Se actualiza automáticamente en todas las tablas principales
- **Función**: `update_updated_at_column()`

---

## **🔒 SEGURIDAD**

### **Restricciones de Integridad**
- **Foreign Keys**: Todas las relaciones tienen restricciones FK
- **Unique Constraints**: Emails, números de mesa, nombres únicos
- **Check Constraints**: Calificaciones 1-5, validaciones de datos
- **NOT NULL**: Campos obligatorios protegidos

### **Permisos (Opcional)**
```sql
-- Usuario de aplicación con permisos limitados
CREATE USER cafeteria_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE cafeteria_l_bandito TO cafeteria_app;
GRANT USAGE ON SCHEMA public TO cafeteria_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO cafeteria_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cafeteria_app;
```

---

## **📊 ESTADÍSTICAS DE TESTING**

### **Cobertura de Tests**
- **Tests totales**: 513 implementados
- **Success rate**: 68% (349 pasando, 164 fallando)
- **Cobertura de código**: 32.62% statements

### **Componentes Verificados**
- ✅ **Routes**: 98.66% cobertura
- ✅ **Models/ORM**: 100% cobertura  
- ✅ **App**: 97.77% cobertura
- ✅ **Utils**: 100% cobertura
- ✅ **Middlewares**: 36.05% cobertura
- ✅ **Controllers**: 18.4% cobertura

### **Datos de Prueba**
La base de datos incluye datos de prueba completos:
- 3 Roles, 5 Estados de pedido, 4 Métodos de pago
- 5 Categorías, 6 Mesas, 2 Vendedores
- 6 Usuarios (1 admin, 1 vendedor, 4 clientes)
- 20 Productos variados, 4 Carritos, 5 Pedidos

---

## **🚀 COMANDOS ÚTILES**

### **Crear Base de Datos**
```bash
psql -U postgres -c "CREATE DATABASE cafeteria_l_bandito;"
psql -U postgres -d cafeteria_l_bandito -f database/create_database.sql
```

### **Poblar con Datos de Prueba**
```bash
cd backend
node tests/seed-test-data.js
```

### **Verificar Estructura**
```bash
psql -h localhost -U patriciozepeda -d cafeteria_l_bandito -c "\dt"
psql -h localhost -U patriciozepeda -d cafeteria_l_bandito -c "\d tabla_nombre"
```

### **Backup y Restore**
```bash
# Backup
pg_dump -h localhost -U patriciozepeda cafeteria_l_bandito > backup.sql

# Restore
psql -h localhost -U patriciozepeda -d cafeteria_l_bandito < backup.sql
```

---

## **📝 NOTAS DE VERSIÓN**

### **Versión 2.0 (Actual)**
- ✅ Estructura verificada contra base de datos real
- ✅ Campos obligatorios identificados (`apellido`, `vendedor_id`, etc.)
- ✅ Estados de mesa corregidos (`estado`, `activa`)
- ✅ Campos de pedidos actualizados (`subtotal`, `impuestos`)
- ✅ Carritos sin campo `activo`
- ✅ Detalles_carrito solo con `cantidad`
- ✅ Índices optimizados para rendimiento
- ✅ Triggers automáticos implementados
- ✅ Datos de prueba completos

### **Cambios Principales vs Versión 1.0**
1. **Usuarios**: Campo `apellido` ahora obligatorio
2. **Mesas**: Campos `estado` y `activa` en lugar de `disponible`
3. **Productos**: Campo `vendedor_id` obligatorio
4. **Pedidos**: Campos `subtotal` e `impuestos` obligatorios, sin `mesa_id`
5. **Carritos**: Eliminado campo `activo`
6. **Detalles_carrito**: Solo campo `cantidad`, sin `precio_unitario`

---

**📅 Última actualización**: Diciembre 2024  
**👨‍💻 Mantenido por**: Equipo de Desarrollo Cafetería L'Bandito  
**📧 Contacto**: desarrollo@cafeteria-lbandito.com 