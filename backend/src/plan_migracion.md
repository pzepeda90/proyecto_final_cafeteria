# Plan de Migración a ORM

## Objetivo
Eliminar el código redundante y estandarizar el acceso a datos en la aplicación utilizando solo los modelos ORM con Sequelize.

## Pasos de la Migración

### 1. Creación de Servicios

Crear servicios para cada entidad que encapsulen la lógica de acceso a datos:

- [x] UsuarioService
- [x] ProductoService
- [x] CategoriaService
- [x] VendedorService 
- [x] DireccionService
- [x] CarritoService
- [x] DetalleCarritoService
- [x] PedidoService
- [x] DetallePedidoService
- [x] MetodoPagoService
- [x] EstadoPedidoService
- [x] HistorialEstadoPedidoService
- [x] ImagenProductoService
- [x] ResenaService
- [x] RolService

### 2. Actualización de Controladores

Actualizar todos los controladores para que utilicen los nuevos servicios:

- [x] usuarios.controller.js
- [x] productos.controller.js
- [x] categorias.controller.js
- [x] vendedores.controller.js
- [x] direcciones.controller.js (integrado en usuarios.controller.js)
- [x] carritos.controller.js
- [x] detalles_carrito.controller.js
- [x] pedidos.controller.js
- [x] detalles_pedido.controller.js
- [x] metodos_pago.controller.js
- [x] estados_pedido.controller.js
- [x] historial_estado_pedido.controller.js
- [x] imagenes_producto.controller.js
- [x] resenas.controller.js
- [x] roles.controller.js

### 3. Eliminación de modelos redundantes

Una vez que todos los controladores estén usando los servicios, eliminar los modelos redundantes:

- [x] usuario.model.js
- [x] producto.model.js
- [x] categoria.model.js
- [x] vendedor.model.js
- [x] direccion.model.js
- [x] carrito.model.js
- [x] detalle_carrito.model.js
- [x] pedido.model.js
- [x] detalle_pedido.model.js
- [x] metodo_pago.model.js
- [x] estado_pedido.model.js
- [x] historial_estado_pedido.model.js
- [x] imagen_producto.model.js
- [x] resena.model.js
- [x] rol.model.js

### 4. Actualización de Middleware

- [x] Actualizar auth.middleware.js para usar los nuevos servicios
- [ ] Actualizar otros middlewares según sea necesario

### 5. Pruebas

- [ ] Probar todas las rutas para verificar que funcionan con los nuevos servicios
- [ ] Verificar que la documentación Swagger sigue siendo correcta

## Beneficios de la Migración

1. **Código más limpio y mantenible**: Al estandarizar el acceso a datos con ORM.
2. **Menos duplicación**: Eliminamos modelos redundantes.
3. **Mejor manejo de relaciones**: Sequelize facilita el manejo de relaciones entre entidades.
4. **Seguridad mejorada**: Reducimos el riesgo de inyección SQL al usar ORM.
5. **Consistencia**: Todos los modelos y controladores seguirán el mismo patrón.

## Consideraciones

- La migración debe realizarse de forma incremental, probando cada servicio y controlador.
- Mantener la misma interfaz pública para que el resto de la aplicación no se vea afectada.
- Documentar todos los cambios relevantes en el código. 