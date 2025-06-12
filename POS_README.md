# 🏪 Sistema POS - Cafetería L'Bandito

## 🚀 Inicio Rápido

Para iniciar el sistema completo, ejecuta:

```bash
./start_pos.sh
```

O manualmente:

### Backend
```bash
cd backend
DB_HOST=localhost DB_PORT=5432 DB_NAME=cafeteria_l_bandito DB_USER=patriciozepeda DB_PASS=123456 PORT=3000 JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_123456789 CORS_ORIGIN=http://localhost:5174 NODE_ENV=development node src/index.js
```

### Frontend
```bash
cd frontend
npm run dev
```

## 🔐 Credenciales de Acceso

- **Vendedor**: `vendedor@cafeteria.com` / `password123`
- **Admin**: `admin@cafeteria.com` / `admin123`

## 📱 Funcionalidades del POS

### ✅ Gestión de Productos
- **Catálogo completo**: 21 productos en 5 categorías
- **Búsqueda en tiempo real**: Por nombre y descripción
- **Filtros por categoría**: Café, Postres, Desayunos, Bebidas, Sandwiches
- **Control de stock**: Solo productos disponibles
- **Imágenes de productos**: Visualización atractiva

### 🛒 Carrito de Compras
- **Agregar/quitar productos**: Click directo desde el catálogo
- **Control de cantidades**: Botones + / - intuitivos
- **Validación de stock**: Previene sobreventa
- **Cálculo automático**: Subtotal, impuestos (16%) y total

### 👤 Información del Cliente
- **Nombre del cliente**: Campo obligatorio
- **Teléfono**: Obligatorio para delivery
- **Email**: Campo opcional
- **Número de mesa**: Para pedidos en local
- **Tipo de pedido**: 
  - 🏪 Retiro en Local
  - 🚚 Delivery
  - 📦 Takeaway

### 💳 Procesamiento de Pedidos
- **Métodos de pago**: Efectivo, tarjeta, transferencia
- **Resumen completo**: Cliente, productos, totales
- **Validaciones**: Campos obligatorios según tipo de pedido
- **Confirmación**: Modal con todos los detalles
- **Actualización automática**: Stock se actualiza tras el pedido

## 🎯 Flujo de Trabajo

1. **Seleccionar productos**: Navegar por categorías o buscar
2. **Agregar al carrito**: Click en productos deseados
3. **Información del cliente**: Completar datos en el panel lateral
4. **Procesar pedido**: Click en "Procesar Pedido"
5. **Confirmar detalles**: Revisar resumen en modal
6. **Finalizar**: Seleccionar método de pago y confirmar

## 📊 Categorías Disponibles

### ☕ Café (7 productos)
- Americano - $2,800
- Cappuccino Cremoso - $3,500
- Espresso Doble - $3,000
- Latte Macchiato - $3,800
- Mocha Chocolate - $4,200
- Café Filtrado - $7,500

### 🍰 Postres (4 productos)
- Cheesecake de Fresa - $5,200
- Tiramisú Italiano - $5,000
- Tarta de Limón - $4,800
- Torta de Chocolate - $4,500

### 🥞 Desayunos (4 productos)
- Bowl de Avena - $7,000
- Huevos Benedict - $9,500
- Pancakes Americanos - $7,500
- Tostadas Francesas - $8,500

### 🥤 Bebidas (4 productos)
- Frappé de Café - $4,200
- Limonada de Fresa - $4,500
- Smoothie Verde - $5,000
- Té Chai Latte - $4,000

### 🥪 Sandwiches (3 productos)
- Club Sandwich - $8,000
- Panini de Jamón y Queso - $6,800
- Sandwich Vegetariano - $7,200

## 🔧 Características Técnicas

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT
- **API**: RESTful con documentación Swagger
- **Tiempo real**: Actualización automática de stock
- **Responsive**: Funciona en desktop y móvil

## 🌐 URLs del Sistema

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3000
- **Documentación API**: http://localhost:3000/api-docs
- **POS**: http://localhost:5174/seller/pos (requiere login como vendedor)

## 🛠️ Solución de Problemas

### Puerto en uso
```bash
# Detener procesos en puertos específicos
lsof -ti:3000 | xargs kill -9
lsof -ti:5174 | xargs kill -9
```

### Base de datos no conecta
- Verificar que PostgreSQL esté ejecutándose
- Confirmar credenciales en variables de entorno
- Verificar que la base de datos `cafeteria_l_bandito` exista

### Productos no aparecen
- Verificar conexión backend-frontend
- Revisar logs en consola del navegador
- Confirmar que el backend responda en `/api/productos`

## 📞 Soporte

Para problemas o mejoras, revisar:
1. Logs del backend en terminal
2. Consola del navegador (F12)
3. Network tab para verificar llamadas API
4. Documentación Swagger para endpoints disponibles 