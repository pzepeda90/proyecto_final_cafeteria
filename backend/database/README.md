# 🗄️ BASE DE DATOS - CAFETERÍA L'BANDITO

## **📋 Descripción**
Sistema de base de datos PostgreSQL para la gestión completa de una cafetería, incluyendo usuarios, productos, pedidos, carritos de compra y administración de mesas.

## **🔧 Requisitos Previos**
- PostgreSQL 14.17 o superior
- Node.js 16+ (para scripts de datos de prueba)
- Cliente psql instalado

## **🚀 Instalación Rápida**

### **1. Crear Base de Datos**
```bash
# Opción 1: Usando psql directamente
psql -U postgres -c "CREATE DATABASE cafeteria_l_bandito;"

# Opción 2: Desde línea de comandos
createdb -U postgres cafeteria_l_bandito
```

### **2. Ejecutar Script de Creación**
```bash
# Navegar al directorio de la base de datos
cd backend/database

# Ejecutar script de creación
psql -U postgres -d cafeteria_l_bandito -f create_database.sql
```

### **3. Poblar con Datos de Prueba**
```bash
# Navegar al directorio backend
cd ../

# Ejecutar script de datos de prueba
node tests/seed-test-data.js
```

## **📊 Verificación de Instalación**

### **Verificar Tablas Creadas**
```bash
psql -h localhost -U patriciozepeda -d cafeteria_l_bandito -c "\dt"
```

### **Verificar Datos de Prueba**
```bash
# Contar registros en tablas principales
psql -h localhost -U patriciozepeda -d cafeteria_l_bandito -c "
SELECT 
    'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'productos', COUNT(*) FROM productos
UNION ALL
SELECT 'pedidos', COUNT(*) FROM pedidos
UNION ALL
SELECT 'carritos', COUNT(*) FROM carritos;
"
```

## **🏗️ Estructura de Archivos**

```
backend/database/
├── README.md                    # Este archivo
├── create_database.sql          # Script principal de creación
├── DATABASE_DOCUMENTATION.md    # Documentación completa
└── database_schema_real.sql     # Esquema exportado de BD real
```

## **📋 Datos Incluidos por Defecto**

### **Configuración Básica**
- **3 Roles**: admin, vendedor, cliente
- **5 Estados de pedido**: pendiente, preparando, listo, entregado, cancelado
- **4 Métodos de pago**: efectivo, tarjeta, transferencia, app_movil
- **5 Categorías**: bebidas_calientes, bebidas_frias, comida_salada, postres, snacks

### **Datos de Prueba (con seed-test-data.js)**
- **6 Usuarios**: 1 admin, 1 vendedor, 4 clientes
- **2 Vendedores**: Personal de la cafetería
- **6 Mesas**: Diferentes capacidades y ubicaciones
- **20 Productos**: Variedad por categorías
- **4 Carritos**: Con productos agregados
- **5 Pedidos**: En diferentes estados

## **🔍 Comandos Útiles**

### **Exploración de Datos**
```bash
# Ver estructura de una tabla específica
psql -h localhost -U patriciozepeda -d cafeteria_l_bandito -c "\d usuarios"

# Ver todos los productos
psql -h localhost -U patriciozepeda -d cafeteria_l_bandito -c "SELECT * FROM productos LIMIT 5;"

# Ver pedidos con estado
psql -h localhost -U patriciozepeda -d cafeteria_l_bandito -c "
SELECT p.pedido_id, u.nombre, ep.nombre as estado, p.total 
FROM pedidos p 
JOIN usuarios u ON p.usuario_id = u.usuario_id 
JOIN estados_pedido ep ON p.estado_pedido_id = ep.estado_pedido_id 
LIMIT 5;
"
```

### **Backup y Restore**
```bash
# Crear backup completo
pg_dump -h localhost -U patriciozepeda cafeteria_l_bandito > backup_$(date +%Y%m%d).sql

# Crear backup solo de datos
pg_dump -h localhost -U patriciozepeda --data-only cafeteria_l_bandito > datos_$(date +%Y%m%d).sql

# Restaurar desde backup
psql -h localhost -U patriciozepeda -d cafeteria_l_bandito < backup_20241201.sql
```

### **Mantenimiento**
```bash
# Limpiar datos de prueba (mantener estructura)
psql -h localhost -U patriciozepeda -d cafeteria_l_bandito -c "
TRUNCATE TABLE detalles_pedido, detalles_carrito, pedidos, carritos, 
productos, imagenes_producto, resenas, direcciones, usuario_rol, 
usuarios, vendedores RESTART IDENTITY CASCADE;
"

# Reinsertar datos básicos
psql -h localhost -U patriciozepeda -d cafeteria_l_bandito -f create_database.sql
```

## **🧪 Testing**

### **Ejecutar Tests de Producción**
```bash
# Desde el directorio backend
npm test -- tests/production-quality.test.js
```

### **Verificar Cobertura**
```bash
# Ejecutar todos los tests con cobertura
npm run test:coverage
```

## **🔒 Seguridad**

### **Crear Usuario de Aplicación**
```sql
-- Crear usuario específico para la aplicación
CREATE USER cafeteria_app WITH PASSWORD 'tu_password_seguro_aqui';

-- Otorgar permisos necesarios
GRANT CONNECT ON DATABASE cafeteria_l_bandito TO cafeteria_app;
GRANT USAGE ON SCHEMA public TO cafeteria_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO cafeteria_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cafeteria_app;
```

### **Variables de Entorno**
```bash
# Agregar a tu .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cafeteria_l_bandito
DB_USER=cafeteria_app
DB_PASSWORD=tu_password_seguro_aqui
```

## **🚨 Solución de Problemas**

### **Error: Base de datos no existe**
```bash
# Verificar que PostgreSQL esté corriendo
brew services list | grep postgresql

# Crear la base de datos manualmente
createdb -U postgres cafeteria_l_bandito
```

### **Error: Permisos insuficientes**
```bash
# Verificar usuario actual
psql -c "SELECT current_user;"

# Otorgar permisos de superusuario temporalmente
psql -U postgres -c "ALTER USER patriciozepeda CREATEDB;"
```

### **Error: Tablas ya existen**
```bash
# Eliminar base de datos y recrear
dropdb -U postgres cafeteria_l_bandito
createdb -U postgres cafeteria_l_bandito
psql -U postgres -d cafeteria_l_bandito -f create_database.sql
```

### **Error en datos de prueba**
```bash
# Limpiar y repoblar
node tests/seed-test-data.js --clean
node tests/seed-test-data.js
```

## **📈 Monitoreo**

### **Verificar Rendimiento**
```sql
-- Ver consultas lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Ver tamaño de tablas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## **🔄 Actualizaciones**

### **Migrar a Nueva Versión**
1. Hacer backup de la base de datos actual
2. Ejecutar script de migración (si existe)
3. Verificar integridad de datos
4. Actualizar datos de prueba si es necesario

### **Control de Versiones**
- **Versión actual**: 2.0
- **Última actualización**: Diciembre 2024
- **Cambios principales**: Estructura verificada contra BD real

## **📞 Soporte**

### **Logs Útiles**
```bash
# Ver logs de PostgreSQL
tail -f /usr/local/var/log/postgresql@14.log

# Ver conexiones activas
psql -c "SELECT * FROM pg_stat_activity WHERE datname = 'cafeteria_l_bandito';"
```

### **Contacto**
- **Equipo**: Desarrollo Cafetería L'Bandito
- **Email**: desarrollo@cafeteria-lbandito.com
- **Documentación**: `DATABASE_DOCUMENTATION.md`

---

**✅ ¡Base de datos lista para producción!** 🚀 