const express = require('express');
const router = express.Router();
const mesasController = require('../controllers/mesas.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Mesa:
 *       type: object
 *       properties:
 *         mesa_id:
 *           type: integer
 *         numero:
 *           type: string
 *         capacidad:
 *           type: integer
 *         ubicacion:
 *           type: string
 *         estado:
 *           type: string
 *           enum: [disponible, ocupada, reservada, fuera_servicio]
 *         activa:
 *           type: boolean
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 */

/**
 * @swagger
 * /api/mesas:
 *   get:
 *     summary: Obtener todas las mesas
 *     tags:
 *       - Mesas
 *     responses:
 *       200:
 *         description: Lista de mesas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mesa'
 */
router.get('/', mesasController.getAll);

/**
 * @swagger
 * /api/mesas/disponibles:
 *   get:
 *     summary: Obtener mesas disponibles
 *     tags:
 *       - Mesas
 *     responses:
 *       200:
 *         description: Lista de mesas disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mesa'
 */
router.get('/disponibles', mesasController.getAvailable);

/**
 * @swagger
 * /api/mesas/con-pedidos:
 *   get:
 *     summary: Obtener mesas con pedidos activos
 *     tags:
 *       - Mesas
 *     responses:
 *       200:
 *         description: Lista de mesas con información de pedidos activos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mesa'
 */
router.get('/con-pedidos', mesasController.getAllWithOrders);

/**
 * @swagger
 * /api/mesas/{id}:
 *   get:
 *     summary: Obtener mesa por ID
 *     tags:
 *       - Mesas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mesa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mesa'
 *       404:
 *         description: Mesa no encontrada
 */
router.get('/:id', mesasController.getById);

/**
 * @swagger
 * /api/mesas:
 *   post:
 *     summary: Crear nueva mesa
 *     tags:
 *       - Mesas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *               ubicacion:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [disponible, ocupada, reservada, fuera_servicio]
 *             required:
 *               - numero
 *               - capacidad
 *     responses:
 *       201:
 *         description: Mesa creada exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', verificarToken, mesasController.create);

/**
 * @swagger
 * /api/mesas/{id}:
 *   put:
 *     summary: Actualizar mesa
 *     tags:
 *       - Mesas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *               ubicacion:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [disponible, ocupada, reservada, fuera_servicio]
 *               activa:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Mesa actualizada exitosamente
 *       404:
 *         description: Mesa no encontrada
 */
router.put('/:id', verificarToken, mesasController.update);

/**
 * @swagger
 * /api/mesas/{id}/estado:
 *   patch:
 *     summary: Actualizar estado de mesa
 *     tags:
 *       - Mesas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [disponible, ocupada, reservada, fuera_servicio]
 *             required:
 *               - estado
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       404:
 *         description: Mesa no encontrada
 */
router.patch('/:id/estado', verificarToken, mesasController.updateStatus);

/**
 * @swagger
 * /api/mesas/{id}:
 *   delete:
 *     summary: Eliminar mesa
 *     tags:
 *       - Mesas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mesa eliminada exitosamente
 *       404:
 *         description: Mesa no encontrada
 */
router.delete('/:id', verificarToken, mesasController.delete);

module.exports = router; 