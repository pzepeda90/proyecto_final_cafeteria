/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: API para gestionar roles de usuario
 */

const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const { verificarToken, esAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener todos los roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, esAdmin, rolesController.getAll);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtener un rol por ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del rol
 *     responses:
 *       200:
 *         description: Datos del rol
 *       404:
 *         description: Rol no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verificarToken, esAdmin, rolesController.getById);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear un nuevo rol
 *     tags: [Roles]
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
 *         description: Rol creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/', verificarToken, esAdmin, rolesController.create);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Actualizar un rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del rol
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
 *         description: Rol actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Rol no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verificarToken, esAdmin, rolesController.update);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Eliminar un rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del rol
 *     responses:
 *       200:
 *         description: Rol eliminado exitosamente
 *       404:
 *         description: Rol no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verificarToken, esAdmin, rolesController.delete);

module.exports = router; 