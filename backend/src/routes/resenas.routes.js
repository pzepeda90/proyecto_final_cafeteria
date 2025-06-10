/**
 * @swagger
 * tags:
 *   name: Reseñas
 *   description: API para gestionar reseñas de productos
 */

const express = require('express');
const router = express.Router();
const resenasController = require('../controllers/resenas.controller');
const { verificarToken, esAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/productos/{producto_id}/resenas:
 *   get:
 *     summary: Obtener todas las reseñas de un producto
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: producto_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Lista de reseñas
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/productos/:producto_id/resenas', resenasController.getByProductoId);

/**
 * @swagger
 * /api/productos/{producto_id}/resenas:
 *   post:
 *     summary: Crear una nueva reseña para un producto
 *     tags: [Reseñas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: producto_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - calificacion
 *             properties:
 *               calificacion:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comentario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/productos/:producto_id/resenas', verificarToken, resenasController.create);

/**
 * @swagger
 * /api/resenas/{id}:
 *   put:
 *     summary: Actualizar una reseña
 *     tags: [Reseñas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               calificacion:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comentario:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reseña actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reseña no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/resenas/:id', verificarToken, resenasController.update);

/**
 * @swagger
 * /api/resenas/{id}:
 *   delete:
 *     summary: Eliminar una reseña
 *     tags: [Reseñas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reseña
 *     responses:
 *       200:
 *         description: Reseña eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reseña no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/resenas/:id', verificarToken, resenasController.delete);

module.exports = router; 