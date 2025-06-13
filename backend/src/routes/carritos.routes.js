const express = require('express');
const router = express.Router();
const carritosController = require('../controllers/carritos.controller');
const { verificarToken, requireRole } = require('../middlewares/auth.middleware');
const { cacheMiddleware } = require('../config/performance');

/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleCarrito:
 *       type: object
 *       properties:
 *         detalle_carrito_id:
 *           type: integer
 *         carrito_id:
 *           type: integer
 *         producto_id:
 *           type: integer
 *         nombre_producto:
 *           type: string
 *         precio:
 *           type: number
 *           format: float
 *         cantidad:
 *           type: integer
 *         subtotal:
 *           type: number
 *           format: float
 *         imagen_url:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *     Carrito:
 *       type: object
 *       properties:
 *         carrito_id:
 *           type: integer
 *         usuario_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         total:
 *           type: number
 *           format: float
 *         detalles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DetalleCarrito'
 */

/**
 * @swagger
 * /api/carritos:
 *   get:
 *     summary: Obtener carrito del usuario
 *     tags:
 *       - Carritos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Carrito'
 *       401:
 *         description: No autenticado o token inválido
 */
router.get('/', verificarToken, carritosController.obtenerCarrito);

/**
 * @swagger
 * /api/carritos/all:
 *   get:
 *     summary: Obtener todos los carritos (Admin/Vendedor)
 *     tags:
 *       - Carritos
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: integer
 *         description: Filtrar por usuario
 *     responses:
 *       200:
 *         description: Lista de carritos
 *       403:
 *         description: Sin permisos
 */
router.get('/all', 
  verificarToken, 
  requireRole(['admin', 'vendedor']),
  cacheMiddleware(60), // Cache 1 minuto
  carritosController.obtenerTodosCarritos
);

/**
 * @swagger
 * /api/carritos/user/{userId}:
 *   get:
 *     summary: Obtener carrito por ID de usuario (Admin/Vendedor)
 *     tags:
 *       - Carritos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Carrito del usuario
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/user/:userId', 
  verificarToken, 
  requireRole(['admin', 'vendedor']),
  carritosController.obtenerCarritoPorUsuario
);

/**
 * @swagger
 * /api/carritos/stats:
 *   get:
 *     summary: Obtener estadísticas de carritos (Admin)
 *     tags:
 *       - Carritos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de carritos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_carritos:
 *                   type: integer
 *                 carritos_activos:
 *                   type: integer
 *                 valor_total:
 *                   type: number
 *                 promedio_items:
 *                   type: number
 *       403:
 *         description: Sin permisos
 */
router.get('/stats', 
  verificarToken, 
  requireRole(['admin']),
  cacheMiddleware(300), // Cache 5 minutos
  carritosController.obtenerEstadisticas
);

/**
 * @swagger
 * /api/carritos/agregar:
 *   post:
 *     summary: Agregar producto al carrito
 *     tags:
 *       - Carritos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               producto_id:
 *                 type: integer
 *               cantidad:
 *                 type: integer
 *             required:
 *               - producto_id
 *               - cantidad
 *     responses:
 *       200:
 *         description: Producto agregado al carrito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 carrito:
 *                   $ref: '#/components/schemas/Carrito'
 *       401:
 *         description: No autenticado o token inválido
 *       404:
 *         description: Producto no encontrado
 */
router.post('/agregar', verificarToken, carritosController.agregarProducto);

/**
 * @swagger
 * /api/carritos/bulk-add:
 *   post:
 *     summary: Agregar múltiples productos al carrito
 *     tags:
 *       - Carritos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     producto_id:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *             required:
 *               - productos
 *     responses:
 *       200:
 *         description: Productos agregados al carrito
 *       400:
 *         description: Error en validación
 */
router.post('/bulk-add', verificarToken, carritosController.agregarMultiplesProductos);

/**
 * @swagger
 * /api/carritos/actualizar:
 *   put:
 *     summary: Actualizar cantidad de producto
 *     tags:
 *       - Carritos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               producto_id:
 *                 type: integer
 *               cantidad:
 *                 type: integer
 *             required:
 *               - producto_id
 *               - cantidad
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 carrito:
 *                   $ref: '#/components/schemas/Carrito'
 *       401:
 *         description: No autenticado o token inválido
 *       404:
 *         description: Producto no encontrado en el carrito
 */
router.put('/actualizar', verificarToken, carritosController.actualizarCantidad);

/**
 * @swagger
 * /api/carritos/sync:
 *   put:
 *     summary: Sincronizar carrito completo
 *     tags:
 *       - Carritos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     producto_id:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *             required:
 *               - productos
 *     responses:
 *       200:
 *         description: Carrito sincronizado
 *       400:
 *         description: Error en validación
 */
router.put('/sync', verificarToken, carritosController.sincronizarCarrito);

/**
 * @swagger
 * /api/carritos/producto/{producto_id}:
 *   delete:
 *     summary: Eliminar producto del carrito
 *     tags:
 *       - Carritos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: producto_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 carrito:
 *                   $ref: '#/components/schemas/Carrito'
 *       401:
 *         description: No autenticado o token inválido
 *       404:
 *         description: Producto no encontrado en el carrito
 */
router.delete('/producto/:producto_id', verificarToken, carritosController.eliminarProducto);

/**
 * @swagger
 * /api/carritos/vaciar:
 *   delete:
 *     summary: Vaciar el carrito
 *     tags:
 *       - Carritos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 carrito:
 *                   $ref: '#/components/schemas/Carrito'
 *       401:
 *         description: No autenticado o token inválido
 */
router.delete('/vaciar', verificarToken, carritosController.vaciarCarrito);

/**
 * @swagger
 * /api/carritos/abandoned:
 *   delete:
 *     summary: Limpiar carritos abandonados (Admin)
 *     tags:
 *       - Carritos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Días de inactividad
 *     responses:
 *       200:
 *         description: Carritos abandonados eliminados
 *       403:
 *         description: Sin permisos
 */
router.delete('/abandoned', 
  verificarToken, 
  requireRole(['admin']),
  carritosController.limpiarCarritosAbandonados
);

module.exports = router; 