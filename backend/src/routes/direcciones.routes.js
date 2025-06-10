/**
 * @swagger
 * tags:
 *   name: Direcciones
 *   description: API para gestionar direcciones de usuarios
 */

const express = require('express');
const router = express.Router();
const direccionesController = require('../controllers/direcciones.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/direcciones:
 *   get:
 *     summary: Obtener direcciones del usuario autenticado
 *     tags: [Direcciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de direcciones del usuario
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, direccionesController.getAll);

/**
 * @swagger
 * /api/direcciones/{id}:
 *   get:
 *     summary: Obtener una dirección específica
 *     tags: [Direcciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la dirección
 *     responses:
 *       200:
 *         description: Datos de la dirección
 *       404:
 *         description: Dirección no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verificarToken, direccionesController.getById);

/**
 * @swagger
 * /api/direcciones:
 *   post:
 *     summary: Crear una nueva dirección
 *     tags: [Direcciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - calle
 *               - ciudad
 *               - comuna
 *               - codigo_postal
 *               - pais
 *             properties:
 *               calle:
 *                 type: string
 *               numero:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               comuna:
 *                 type: string
 *               codigo_postal:
 *                 type: string
 *               pais:
 *                 type: string
 *               principal:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Dirección creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/', verificarToken, direccionesController.create);

/**
 * @swagger
 * /api/direcciones/{id}:
 *   put:
 *     summary: Actualizar una dirección
 *     tags: [Direcciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la dirección
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - calle
 *               - ciudad
 *               - comuna
 *               - codigo_postal
 *               - pais
 *             properties:
 *               calle:
 *                 type: string
 *               numero:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               comuna:
 *                 type: string
 *               codigo_postal:
 *                 type: string
 *               pais:
 *                 type: string
 *               principal:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Dirección actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Dirección no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verificarToken, direccionesController.update);

/**
 * @swagger
 * /api/direcciones/{id}:
 *   delete:
 *     summary: Eliminar una dirección
 *     tags: [Direcciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la dirección
 *     responses:
 *       200:
 *         description: Dirección eliminada exitosamente
 *       404:
 *         description: Dirección no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verificarToken, direccionesController.delete);

/**
 * @swagger
 * /api/direcciones/{id}/principal:
 *   put:
 *     summary: Establecer dirección como principal
 *     tags: [Direcciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la dirección
 *     responses:
 *       200:
 *         description: Dirección establecida como principal
 *       404:
 *         description: Dirección no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/principal', verificarToken, direccionesController.setPrincipal);

module.exports = router; 