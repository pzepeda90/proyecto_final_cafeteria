# Tipos de Entrega - Sistema POS Cafetería L'Bandito

## Descripción General

El sistema maneja 4 tipos diferentes de entrega para los pedidos, cada uno con características y flujos específicos:

## Tipos Disponibles

### 1. 🏪 **Local** (`local`)
- **Descripción**: Retiro en local - El cliente viene a buscar su pedido
- **Características**:
  - **NO requiere mesa** (cliente solo retira)
  - No requiere dirección de entrega
  - Tiempo de preparación estándar
  - Cliente recoge personalmente
  - Puede esperar de pie o en área de espera

### 2. 🚚 **Domicilio** (`domicilio`)
- **Descripción**: Delivery - Se entrega en la dirección del cliente
- **Características**:
  - Requiere dirección de entrega válida
  - Requiere teléfono del cliente
  - **NO requiere mesa**
  - Tiempo adicional por traslado
  - Se cobra costo de envío (si aplica)

### 3. 📦 **Para Llevar** (`takeaway`)
- **Descripción**: Preparado para llevar - Similar a local pero optimizado para llevar
- **Características**:
  - **NO requiere mesa**
  - No requiere dirección de entrega
  - Empaque especial para llevar
  - Preparación rápida
  - Cliente recoge inmediatamente

### 4. 🍽️ **Consumo en el Local** (`dine_in`) - **NUEVO**
- **Descripción**: El cliente consume en el restaurante
- **Características**:
  - **⚠️ REQUIERE MESA ASIGNADA OBLIGATORIAMENTE**
  - No requiere dirección de entrega
  - Servicio en mesa
  - Vajilla reutilizable
  - Experiencia completa de restaurante
  - Mesa se marca como ocupada automáticamente

## Lógica de Validación

### Validaciones por Tipo:

```javascript
// Validaciones en el frontend (POS.jsx)
if (orderType === 'dine_in' && !selectedMesa) {
  showError('Para consumo en el local debe seleccionar una mesa');
  return;
}

if (orderType === 'delivery' && !selectedCliente.telefono) {
  showError('Para delivery es necesario el teléfono del cliente');
  return;
}
```

### Selector de Mesa:

```javascript
// Solo se muestra el selector de mesa para 'dine_in'
{orderType === 'dine_in' && (
  <MesaSelector
    selectedMesa={selectedMesa}
    onMesaSelect={setSelectedMesa}
    compact={true}
    externalRefresh={mesasRefreshTrigger}
  />
)}
```

### Mapeo Frontend ↔ Backend:

```javascript
// Frontend usa nombres amigables, backend usa nombres técnicos
const mapping = {
  'local': 'local',        // Sin cambios - NO requiere mesa
  'delivery': 'domicilio', // Mapeo necesario - NO requiere mesa
  'takeaway': 'takeaway',  // Sin cambios - NO requiere mesa
  'dine_in': 'dine_in'     // Sin cambios - SÍ requiere mesa
};
```

## Implementación Técnica

### Base de Datos
```sql
-- ENUM en PostgreSQL
CREATE TYPE enum_pedidos_tipo_entrega AS ENUM (
    'local',
    'domicilio', 
    'takeaway',
    'dine_in'
);
```

### Backend (Sequelize)
```javascript
tipo_entrega: {
  type: DataTypes.ENUM('local', 'domicilio', 'takeaway', 'dine_in'),
  allowNull: true,
  defaultValue: 'local'
}
```

### Frontend (React)
```jsx
// Botones de selección
<button onClick={() => handleOrderTypeChange('local')} title="Retiro en Local">🏪</button>
<button onClick={() => handleOrderTypeChange('delivery')} title="Delivery">🚚</button>
<button onClick={() => handleOrderTypeChange('takeaway')} title="Para Llevar">📦</button>
<button onClick={() => handleOrderTypeChange('dine_in')} title="Consumo en el Local">🍽️</button>

// Función que limpia mesa cuando no es necesaria
const handleOrderTypeChange = (newOrderType) => {
  setOrderType(newOrderType);
  if (newOrderType !== 'dine_in') {
    setSelectedMesa(null); // Limpiar mesa si no es dine_in
  }
};
```

## Flujo de Trabajo

### Para `dine_in` (Consumo en el Local):
1. Vendedor selecciona tipo "🍽️ Consumo en el Local"
2. **Sistema muestra selector de mesas**
3. **Sistema obliga a seleccionar una mesa**
4. Mesa se marca como ocupada automáticamente
5. Pedido se asocia a la mesa
6. Cocina prepara para servir en mesa
7. Mesero sirve en la mesa asignada
8. Al completar pedido, mesa se libera automáticamente

### Para otros tipos:
- `local`: **Sin mesa**, cliente retira en mostrador
- `domicilio`: **Sin mesa**, se entrega en dirección
- `takeaway`: **Sin mesa**, retiro inmediato

## Diferencias Clave

| Tipo | Requiere Mesa | Selector Visible | Validación |
|------|---------------|------------------|------------|
| 🏪 Local | ❌ NO | ❌ NO | Ninguna especial |
| 🚚 Domicilio | ❌ NO | ❌ NO | Requiere teléfono |
| 📦 Takeaway | ❌ NO | ❌ NO | Ninguna especial |
| 🍽️ Dine-in | ✅ SÍ | ✅ SÍ | Mesa obligatoria |

## Migración Aplicada

```sql
-- Migración ejecutada el 2025-06-13
ALTER TYPE enum_pedidos_tipo_entrega ADD VALUE 'dine_in';
```

## Archivos Modificados

### Backend:
- `src/models/orm/pedido.orm.js` - Modelo actualizado
- `src/controllers/pedidos.controller.js` - Validación actualizada
- `src/routes/api.swagger.js` - Documentación API
- `src/routes/pedidos.routes.js` - Documentación rutas

### Frontend:
- `src/pages/seller/POS.jsx` - Interfaz y lógica actualizada
- `src/services/ordersService.js` - Mapeo de datos

### Base de Datos:
- `migration_tipos_entrega.sql` - Script de migración (ejecutado)

## Notas Importantes

1. **Mesa Solo para Dine-in**: Solo el tipo `dine_in` requiere y muestra selector de mesa
2. **Limpieza Automática**: Al cambiar de `dine_in` a otro tipo, la mesa se limpia automáticamente
3. **Consistencia**: El backend usa `domicilio` pero el frontend muestra `delivery` al usuario
4. **Validación Específica**: Cada tipo tiene sus propias validaciones
5. **Migración**: El nuevo tipo se agregó sin afectar datos existentes
6. **Compatibilidad**: Todos los tipos anteriores siguen funcionando normalmente

## Casos de Uso

- **🏪 Local**: Cliente llama, hace pedido, viene a retirar
- **🚚 Domicilio**: Cliente llama, hace pedido, se entrega en su casa
- **📦 Takeaway**: Cliente viene al local, hace pedido, se lleva inmediatamente
- **🍽️ Dine-in**: Cliente viene al local, se sienta en mesa, consume en el lugar 