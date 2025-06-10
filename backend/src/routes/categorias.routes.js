const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categorias.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Categoria:
 *       type: object
 *       properties:
 *         categoria_id:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         imagen_url:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags:
 *       - Categorias
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 */
router.get('/', categoriasController.obtenerCategorias);

/**
 * @swagger
 * /api/categorias/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     tags:
 *       - Categorias
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Categoria'
 *                 - type: object
 *                   properties:
 *                     productos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           producto_id:
 *                             type: integer
 *                           nombre:
 *                             type: string
 *                           precio:
 *                             type: number
 *                           imagen_url:
 *                             type: string
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/:id', categoriasController.obtenerCategoriaPorId);

/**
 * @swagger
 * /api/categorias:
 *   post:
 *     summary: Crear categoría (admin)
 *     tags:
 *       - Categorias
 *     security:
 *       - bearerAuth: []
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
 *               imagen_url:
 *                 type: string
 *             required:
 *               - nombre
 *               - descripcion
 *     responses:
 *       201:
 *         description: Categoría creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       401:
 *         description: No autenticado o token inválido
 *       400:
 *         description: Error en la validación
 */
router.post('/', categoriasController.crearCategoria);

/**
 * @swagger
 * /api/categorias/{id}:
 *   put:
 *     summary: Actualizar categoría (admin)
 *     tags:
 *       - Categorias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
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
 *               imagen_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoría actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       401:
 *         description: No autenticado o token inválido
 *       404:
 *         description: Categoría no encontrada
 */
router.put('/:id', categoriasController.actualizarCategoria);

/**
 * @swagger
 * /api/categorias/{id}:
 *   delete:
 *     summary: Eliminar categoría (admin)
 *     tags:
 *       - Categorias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 categoria:
 *                   $ref: '#/components/schemas/Categoria'
 *       401:
 *         description: No autenticado o token inválido
 *       404:
 *         description: Categoría no encontrada
 */
router.delete('/:id', categoriasController.eliminarCategoria);

module.exports = router; 