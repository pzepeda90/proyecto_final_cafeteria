/**
 * @swagger
 * tags:
 *   name: Estados de Pedido
 *   description: API para gestionar estados de pedido
 */

const express = require('express');
const router = express.Router();
const estadosPedidoController = require('../controllers/estados_pedido.controller');
const { verificarToken, esAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/estados-pedido:
 *   get:
 *     summary: Obtener todos los estados de pedido
 *     tags: [Estados de Pedido]
 *     responses:
 *       200:
 *         description: Lista de estados de pedido
 *       500:
 *         description: Error del servidor
 */
router.get('/', estadosPedidoController.getAll);

/**
 * @swagger
 * /api/estados-pedido/{id}:
 *   get:
 *     summary: Obtener un estado de pedido por ID
 *     tags: [Estados de Pedido]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del estado de pedido
 *     responses:
 *       200:
 *         description: Datos del estado de pedido
 *       404:
 *         description: Estado de pedido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', estadosPedidoController.getById);

/**
 * @swagger
 * /api/estados-pedido:
 *   post:
 *     summary: Crear un nuevo estado de pedido
 *     tags: [Estados de Pedido]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Estado de pedido creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/', verificarToken, esAdmin, estadosPedidoController.create);

/**
 * @swagger
 * /api/estados-pedido/{id}:
 *   put:
 *     summary: Actualizar un estado de pedido
 *     tags: [Estados de Pedido]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del estado de pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado de pedido actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Estado de pedido no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verificarToken, esAdmin, estadosPedidoController.update);

/**
 * @swagger
 * /api/estados-pedido/{id}:
 *   delete:
 *     summary: Eliminar un estado de pedido
 *     tags: [Estados de Pedido]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del estado de pedido
 *     responses:
 *       200:
 *         description: Estado de pedido eliminado exitosamente
 *       404:
 *         description: Estado de pedido no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verificarToken, esAdmin, estadosPedidoController.delete);

module.exports = router; 