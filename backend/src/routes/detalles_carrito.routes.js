/**
 * @swagger
 * tags:
 *   name: DetallesCarrito
 *   description: API para gestionar detalles de carrito
 */

const express = require('express');
const router = express.Router();
const detallesCarritoController = require('../controllers/detalles_carrito.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { validateId } = require('../middlewares/validation.middleware');

/**
 * @swagger
 * /api/carritos/{carrito_id}/items:
 *   get:
 *     summary: Obtener todos los ítems de un carrito
 *     tags: [DetallesCarrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carrito_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del carrito
 *     responses:
 *       200:
 *         description: Lista de ítems del carrito
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/:carrito_id/items', verificarToken, detallesCarritoController.getByCarritoId);

/**
 * @swagger
 * /api/carritos/items/{id}:
 *   get:
 *     summary: Obtener un ítem del carrito por ID
 *     tags: [DetallesCarrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del ítem del carrito
 *     responses:
 *       200:
 *         description: Ítem del carrito encontrado
 *       404:
 *         description: Ítem no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/items/:id', verificarToken, validateId, detallesCarritoController.getById);

/**
 * @swagger
 * /api/carritos/{carrito_id}/items:
 *   post:
 *     summary: Añadir un ítem al carrito
 *     tags: [DetallesCarrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carrito_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del carrito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - producto_id
 *               - cantidad
 *             properties:
 *               producto_id:
 *                 type: integer
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Ítem añadido al carrito exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/:carrito_id/items', verificarToken, (req, res, next) => {
  req.body.carrito_id = parseInt(req.params.carrito_id);
  next();
}, detallesCarritoController.create);

/**
 * @swagger
 * /api/carritos/items/{id}:
 *   put:
 *     summary: Actualizar un ítem del carrito
 *     tags: [DetallesCarrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del ítem del carrito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cantidad
 *             properties:
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Ítem del carrito actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Ítem no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put('/items/:id', verificarToken, validateId, detallesCarritoController.update);

/**
 * @swagger
 * /api/carritos/items/{id}:
 *   delete:
 *     summary: Eliminar un ítem del carrito
 *     tags: [DetallesCarrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del ítem del carrito
 *     responses:
 *       200:
 *         description: Ítem del carrito eliminado exitosamente
 *       404:
 *         description: Ítem no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.delete('/items/:id', verificarToken, validateId, detallesCarritoController.delete);

module.exports = router; 