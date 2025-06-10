const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');
const { verificarToken, esAdmin, verificarTokenVendedor } = require('../middlewares/auth.middleware');
const { esProductoDelVendedor } = require('../middlewares/vendedor.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       properties:
 *         producto_id:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         precio:
 *           type: number
 *           format: float
 *         imagen_url:
 *           type: string
 *         categoria_id:
 *           type: integer
 *         categoria_nombre:
 *           type: string
 *         vendedor_id:
 *           type: integer
 *         vendedor_nombre:
 *           type: string
 *         stock:
 *           type: integer
 *         disponible:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         imagenes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ImagenProducto'
 *     ImagenProducto:
 *       type: object
 *       properties:
 *         imagen_id:
 *           type: integer
 *         url:
 *           type: string
 *         descripcion:
 *           type: string
 *         orden:
 *           type: integer
 */

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtener todos los productos
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *       - in: query
 *         name: disponible
 *         schema:
 *           type: boolean
 *         description: Filtrar por disponibilidad (true/false)
 *       - in: query
 *         name: vendedor_id
 *         schema:
 *           type: integer
 *         description: Filtrar por vendedor
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 */
router.get('/', productosController.obtenerProductos);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', productosController.obtenerProductoPorId);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear producto (admin)
 *     tags:
 *       - Productos
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
 *               precio:
 *                 type: number
 *               imagen_url:
 *                 type: string
 *               categoria_id:
 *                 type: integer
 *               stock:
 *                 type: integer
 *               disponible:
 *                 type: boolean
 *               vendedor_id:
 *                 type: integer
 *               imagenes_adicionales:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     descripcion:
 *                       type: string
 *                     orden:
 *                       type: integer
 *             required:
 *               - nombre
 *               - descripcion
 *               - precio
 *               - categoria_id
 *               - stock
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       401:
 *         description: No autenticado o token inválido
 *       403:
 *         description: No autorizado
 */
router.post('/', verificarToken, esAdmin, productosController.crearProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar producto (admin)
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
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
 *               precio:
 *                 type: number
 *               imagen_url:
 *                 type: string
 *               categoria_id:
 *                 type: integer
 *               stock:
 *                 type: integer
 *               disponible:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       401:
 *         description: No autenticado o token inválido
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:id', verificarToken, esAdmin, productosController.actualizarProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar producto (admin)
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 producto:
 *                   $ref: '#/components/schemas/Producto'
 *       401:
 *         description: No autenticado o token inválido
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/:id', verificarToken, esAdmin, productosController.eliminarProducto);

/**
 * @swagger
 * /api/productos/{id}/imagenes:
 *   post:
 *     summary: Agregar imagen a producto (admin)
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               orden:
 *                 type: integer
 *             required:
 *               - url
 *     responses:
 *       201:
 *         description: Imagen agregada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 imagen:
 *                   $ref: '#/components/schemas/ImagenProducto'
 *       401:
 *         description: No autenticado o token inválido
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */
router.post('/:id/imagenes', verificarToken, esAdmin, productosController.agregarImagen);

// Rutas de vendedores (protegidas con verificarTokenVendedor)
router.post('/vendedor', verificarTokenVendedor, productosController.crearProducto);
router.put('/:id/vendedor', verificarTokenVendedor, esProductoDelVendedor, productosController.actualizarProducto);
router.delete('/:id/vendedor', verificarTokenVendedor, esProductoDelVendedor, productosController.eliminarProducto);

module.exports = router; 