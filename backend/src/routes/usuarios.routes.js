const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         usuario_id:
 *           type: integer
 *         nombre:
 *           type: string
 *         apellido:
 *           type: string
 *         email:
 *           type: string
 *         telefono:
 *           type: string
 *         fecha_registro:
 *           type: string
 *         activo:
 *           type: boolean
 *     Direccion:
 *       type: object
 *       properties:
 *         direccion_id:
 *           type: integer
 *         usuario_id:
 *           type: integer
 *         calle:
 *           type: string
 *         numero:
 *           type: string
 *         ciudad:
 *           type: string
 *         comuna:
 *           type: string
 *         codigo_postal:
 *           type: string
 *         pais:
 *           type: string
 *         principal:
 *           type: boolean
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/usuarios/registro:
 *   post:
 *     summary: Registro de usuario
 *     tags:
 *       - Usuarios
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
 *               password:
 *                 type: string
 *               telefono:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *             required:
 *               - nombre
 *               - apellido
 *               - email
 *               - password
 *               - telefono
 *               - fecha_nacimiento
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *                 token:
 *                   type: string
 */
router.post('/registro', usuariosController.registro);

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     summary: Login de usuario
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *                 token:
 *                   type: string
 */
router.post('/login', usuariosController.login);

/**
 * @swagger
 * /api/usuarios/verificar:
 *   get:
 *     summary: Verificar token de usuario
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Token inválido
 */
router.get('/verificar', verificarToken, usuariosController.verificarToken);

/**
 * @swagger
 * /api/usuarios/perfil:
 *   get:
 *     summary: Obtener perfil de usuario
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil de usuario obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autenticado o token inválido
 */
router.get('/perfil', verificarToken, usuariosController.getPerfil);

/**
 * @swagger
 * /api/usuarios/perfil:
 *   put:
 *     summary: Actualizar perfil de usuario
 *     tags:
 *       - Usuarios
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
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autenticado o token inválido
 */
router.put('/perfil', verificarToken, usuariosController.updatePerfil);

/**
 * @swagger
 * /api/usuarios/cambiar-password:
 *   put:
 *     summary: Cambiar contraseña
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password_actual:
 *                 type: string
 *               password_nueva:
 *                 type: string
 *               password_confirmacion:
 *                 type: string
 *             required:
 *               - password_actual
 *               - password_nueva
 *               - password_confirmacion
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       401:
 *         description: No autenticado o token inválido
 *       400:
 *         description: Error en la validación
 */
router.put('/cambiar-password', verificarToken, usuariosController.cambiarPassword);

// Rutas protegidas
router.use(verificarToken);

// Direcciones
/**
 * @swagger
 * /api/usuarios/direcciones:
 *   get:
 *     summary: Obtener direcciones del usuario
 *     tags:
 *       - Direcciones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de direcciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Direccion'
 *       401:
 *         description: No autenticado o token inválido
 */
router.get('/direcciones', usuariosController.getDirecciones);

/**
 * @swagger
 * /api/usuarios/direcciones:
 *   post:
 *     summary: Agregar dirección
 *     tags:
 *       - Direcciones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *             required:
 *               - calle
 *               - numero
 *               - ciudad
 *               - comuna
 *               - pais
 *     responses:
 *       201:
 *         description: Dirección agregada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 direccion:
 *                   $ref: '#/components/schemas/Direccion'
 *       401:
 *         description: No autenticado o token inválido
 *       400:
 *         description: Error en la validación
 */
router.post('/direcciones', usuariosController.addDireccion);

/**
 * @swagger
 * /api/usuarios/direcciones/{id}:
 *   put:
 *     summary: Actualizar dirección
 *     tags:
 *       - Direcciones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la dirección
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *     responses:
 *       200:
 *         description: Dirección actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 direccion:
 *                   $ref: '#/components/schemas/Direccion'
 *       401:
 *         description: No autenticado o token inválido
 *       404:
 *         description: Dirección no encontrada
 */
router.put('/direcciones/:id', usuariosController.updateDireccion);

/**
 * @swagger
 * /api/usuarios/direcciones/{id}:
 *   delete:
 *     summary: Eliminar dirección
 *     tags:
 *       - Direcciones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la dirección
 *     responses:
 *       200:
 *         description: Dirección eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       401:
 *         description: No autenticado o token inválido
 *       404:
 *         description: Dirección no encontrada
 */
router.delete('/direcciones/:id', usuariosController.deleteDireccion);

/**
 * @swagger
 * /api/usuarios/direcciones/{id}/principal:
 *   put:
 *     summary: Establecer dirección como principal
 *     tags:
 *       - Direcciones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la dirección
 *     responses:
 *       200:
 *         description: Dirección establecida como principal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       401:
 *         description: No autenticado o token inválido
 *       404:
 *         description: Dirección no encontrada
 */
router.put('/direcciones/:id/principal', usuariosController.setDireccionPrincipal);

module.exports = router; 