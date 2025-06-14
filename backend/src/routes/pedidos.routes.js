const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');
const { verificarToken, esAdmin, requireRole } = require('../middlewares/auth.middleware');
const { cacheMiddleware } = require('../config/performance');

/**
 * @swagger
 * components:
 *   schemas:
 *     DetallePedido:
 *       type: object
 *       properties:
 *         detalle_id:
 *           type: integer
 *         pedido_id:
 *           type: integer
 *         producto_id:
 *           type: integer
 *         nombre_producto:
 *           type: string
 *         cantidad:
 *           type: integer
 *         precio_unitario:
 *           type: number
 *           format: float
 *         subtotal:
 *           type: number
 *           format: float
 *     HistorialEstadoPedido:
 *       type: object
 *       properties:
 *         historial_id:
 *           type: integer
 *         pedido_id:
 *           type: integer
 *         estado_pedido_id:
 *           type: integer
 *         estado_pedido_nombre:
 *           type: string
 *         fecha_cambio:
 *           type: string
 *           format: date-time
 *         comentario:
 *           type: string
 *     Pedido:
 *       type: object
 *       properties:
 *         pedido_id:
 *           type: integer
 *         usuario_id:
 *           type: integer
 *         nombre_usuario:
 *           type: string
 *         apellido_usuario:
 *           type: string
 *         direccion_id:
 *           type: integer
 *         metodo_pago_id:
 *           type: integer
 *         metodo_pago_nombre:
 *           type: string
 *         estado_pedido_id:
 *           type: integer
 *         estado_pedido_nombre:
 *           type: string
 *         subtotal:
 *           type: number
 *           format: float
 *         impuestos:
 *           type: number
 *           format: float
 *         total:
 *           type: number
 *           format: float
 *         fecha_pedido:
 *           type: string
 *           format: date-time
 *         carrito_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         detalles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DetallePedido'
 */

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Obtener todos los pedidos
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado_pedido_id
 *         schema:
 *           type: integer
 *         description: Filtrar por estado
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha de inicio
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha de fin
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 *       401:
 *         description: No autenticado o token inválido
 */
router.get('/', verificarToken, pedidosController.obtenerPedidos);

/**
 * @swagger
 * /api/pedidos/mis-pedidos:
 *   get:
 *     summary: Obtener pedidos del usuario autenticado
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Filtrar por estado
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Pedidos del usuario
 */
router.get('/mis-pedidos', verificarToken, pedidosController.obtenerMisPedidos);

/**
 * @swagger
 * /api/pedidos/stats:
 *   get:
 *     summary: Obtener estadísticas de pedidos (Admin/Vendedor)
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           enum: [dia, semana, mes, año]
 *           default: mes
 *         description: Período de estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas de pedidos
 *       403:
 *         description: Sin permisos
 */
router.get('/stats', 
  verificarToken, 
  requireRole(['admin', 'vendedor']),
  cacheMiddleware(300), // Cache 5 minutos
  pedidosController.obtenerEstadisticas
);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   get:
 *     summary: Obtener pedido por ID
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       401:
 *         description: No autenticado o token inválido
 *       404:
 *         description: Pedido no encontrado
 */
router.get('/:id', verificarToken, pedidosController.obtenerPedidoPorId);

/**
 * @swagger
 * /api/pedidos/{id}/historial:
 *   get:
 *     summary: Obtener historial de estados de un pedido
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Historial de estados del pedido
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistorialEstadoPedido'
 *       401:
 *         description: No autenticado o token inválido
 *       404:
 *         description: Pedido no encontrado
 */
router.get('/:id/historial', verificarToken, pedidosController.obtenerHistorialEstados);

/**
 * @swagger
 * /api/pedidos/directo:
 *   post:
 *     summary: Crear pedido directo (POS)
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metodo_pago_id:
 *                 type: integer
 *               direccion_id:
 *                 type: integer
 *               tipo_entrega:
 *                 type: string
 *                 enum: [local, domicilio, takeaway, dine_in]
 *               notas:
 *                 type: string
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     producto_id:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *                     precio_unitario:
 *                       type: number
 *             required:
 *               - metodo_pago_id
 *               - productos
 *     responses:
 *       201:
 *         description: Pedido directo creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 pedido:
 *                   $ref: '#/components/schemas/Pedido'
 *       401:
 *         description: No autenticado o token inválido
 *       400:
 *         description: Error en la validación
 */
router.post('/directo', verificarToken, pedidosController.crearPedidoDirecto);

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Crear nuevo pedido desde carrito
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metodo_pago_id:
 *                 type: integer
 *               direccion_id:
 *                 type: integer
 *               carrito_id:
 *                 type: integer
 *               tipo_entrega:
 *                 type: string
 *                 enum: [local, domicilio, takeaway, dine_in]
 *               notas:
 *                 type: string
 *             required:
 *               - metodo_pago_id
 *     responses:
 *       201:
 *         description: Pedido creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 pedido:
 *                   $ref: '#/components/schemas/Pedido'
 *       401:
 *         description: No autenticado o token inválido
 *       400:
 *         description: Error en la validación
 */
router.post('/', verificarToken, pedidosController.crearPedido);

/**
 * @swagger
 * /api/pedidos/{id}/estado:
 *   put:
 *     summary: Actualizar estado de pedido (Admin/Vendedor)
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado_pedido_id:
 *                 type: integer
 *               comentario:
 *                 type: string
 *             required:
 *               - estado_pedido_id
 *     responses:
 *       200:
 *         description: Estado de pedido actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 pedido:
 *                   $ref: '#/components/schemas/Pedido'
 *       401:
 *         description: No autenticado o token inválido
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Pedido no encontrado
 */
router.put('/:id/estado', 
  verificarToken, 
  requireRole(['admin', 'vendedor']), 
  pedidosController.actualizarEstadoPedido
);

/**
 * @swagger
 * /api/pedidos/{id}/cancelar:
 *   put:
 *     summary: Cancelar pedido (Cliente o Admin)
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *                 description: Motivo de cancelación
 *     responses:
 *       200:
 *         description: Pedido cancelado correctamente
 *       400:
 *         description: No se puede cancelar el pedido
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Pedido no encontrado
 */
router.put('/:id/cancelar', verificarToken, pedidosController.cancelarPedido);

/**
 * @swagger
 * /api/pedidos/bulk-update:
 *   put:
 *     summary: Actualizar múltiples pedidos (Admin/Vendedor)
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pedidos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pedido_id:
 *                       type: integer
 *                     estado_pedido_id:
 *                       type: integer
 *                     comentario:
 *                       type: string
 *             required:
 *               - pedidos
 *     responses:
 *       200:
 *         description: Pedidos actualizados
 *       403:
 *         description: Sin permisos
 */
router.put('/bulk-update', 
  verificarToken, 
  requireRole(['admin', 'vendedor']), 
  pedidosController.actualizarMultiplesPedidos
);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   delete:
 *     summary: Eliminar pedido (Solo Admin)
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido eliminado correctamente
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Pedido no encontrado
 */
router.delete('/:id', 
  verificarToken, 
  requireRole(['admin']), 
  pedidosController.eliminarPedido
);

module.exports = router; 