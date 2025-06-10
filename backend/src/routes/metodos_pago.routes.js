/**
 * @swagger
 * tags:
 *   name: Métodos de Pago
 *   description: API para gestionar métodos de pago
 */

const express = require('express');
const router = express.Router();
const metodosPagoController = require('../controllers/metodos_pago.controller');
const { verificarToken, esAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/metodos-pago:
 *   get:
 *     summary: Obtener todos los métodos de pago
 *     tags: [Métodos de Pago]
 *     responses:
 *       200:
 *         description: Lista de métodos de pago
 *       500:
 *         description: Error del servidor
 */
router.get('/', metodosPagoController.getAll);

/**
 * @swagger
 * /api/metodos-pago/{id}:
 *   get:
 *     summary: Obtener un método de pago por ID
 *     tags: [Métodos de Pago]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del método de pago
 *     responses:
 *       200:
 *         description: Datos del método de pago
 *       404:
 *         description: Método de pago no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', metodosPagoController.getById);

/**
 * @swagger
 * /api/metodos-pago:
 *   post:
 *     summary: Crear un nuevo método de pago
 *     tags: [Métodos de Pago]
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
 *               activo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Método de pago creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/', verificarToken, esAdmin, metodosPagoController.create);

/**
 * @swagger
 * /api/metodos-pago/{id}:
 *   put:
 *     summary: Actualizar un método de pago
 *     tags: [Métodos de Pago]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del método de pago
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
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Método de pago actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Método de pago no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verificarToken, esAdmin, metodosPagoController.update);

/**
 * @swagger
 * /api/metodos-pago/{id}:
 *   delete:
 *     summary: Eliminar un método de pago
 *     tags: [Métodos de Pago]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del método de pago
 *     responses:
 *       200:
 *         description: Método de pago eliminado exitosamente
 *       404:
 *         description: Método de pago no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verificarToken, esAdmin, metodosPagoController.delete);

module.exports = router; 