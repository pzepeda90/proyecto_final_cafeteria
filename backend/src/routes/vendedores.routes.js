/**
 * @swagger
 * tags:
 *   name: Vendedores
 *   description: API para gestionar vendedores
 */

const express = require('express');
const router = express.Router();
const vendedoresController = require('../controllers/vendedores.controller');
const { verificarTokenVendedor, verificarToken, esAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/vendedores/login:
 *   post:
 *     summary: Login de vendedor
 *     tags: [Vendedores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */
router.post('/login', vendedoresController.login);

/**
 * @swagger
 * /api/vendedores:
 *   get:
 *     summary: Obtener todos los vendedores
 *     tags: [Vendedores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vendedores
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, esAdmin, vendedoresController.getAll);

/**
 * @swagger
 * /api/vendedores/{id}:
 *   get:
 *     summary: Obtener un vendedor por ID
 *     tags: [Vendedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del vendedor
 *     responses:
 *       200:
 *         description: Datos del vendedor
 *       404:
 *         description: Vendedor no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verificarTokenVendedor, vendedoresController.getById);

/**
 * @swagger
 * /api/vendedores:
 *   post:
 *     summary: Crear un nuevo vendedor (admin)
 *     tags: [Vendedores]
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
 *               - apellido
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vendedor creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error del servidor
 */
router.post('/', verificarToken, esAdmin, vendedoresController.create);

/**
 * @swagger
 * /api/vendedores/{id}:
 *   put:
 *     summary: Actualizar un vendedor
 *     tags: [Vendedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del vendedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Vendedor actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Vendedor no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verificarToken, esAdmin, vendedoresController.update);

/**
 * @swagger
 * /api/vendedores/{id}/cambiar-password:
 *   put:
 *     summary: Cambiar contraseña de vendedor
 *     tags: [Vendedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del vendedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password_actual
 *               - password_nueva
 *             properties:
 *               password_actual:
 *                 type: string
 *               password_nueva:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Contraseña actual incorrecta
 *       404:
 *         description: Vendedor no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/cambiar-password', verificarTokenVendedor, vendedoresController.cambiarPassword);

/**
 * @swagger
 * /api/vendedores/{id}:
 *   delete:
 *     summary: Eliminar un vendedor
 *     tags: [Vendedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del vendedor
 *     responses:
 *       200:
 *         description: Vendedor eliminado exitosamente
 *       404:
 *         description: Vendedor no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verificarToken, esAdmin, vendedoresController.delete);

module.exports = router; 