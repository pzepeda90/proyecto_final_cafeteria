const express = require('express');
const router = express.Router();
const carritosController = require('../controllers/carritos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

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

module.exports = router; 