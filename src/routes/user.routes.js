const express = require('express');
const userController = require('../controllers/user.controller');
const { verifyAuth } = require('../middlewares/auth.middleware');
const { requireRole, requirePermission } = require('../middlewares/role.middleware');

const router = express.Router();

// Todas las rutas de este módulo exigen sesión válida (protección contra
// acceso directo por URL: sin token, ninguna de estas responde datos).
router.use(verifyAuth);

router.get('/', requireRole('Administrador'), userController.listarUsuarios);
router.get('/:id', requireRole('Administrador'), userController.obtenerUsuario);
router.patch('/:id/rol', requirePermission('usuarios.gestionar'), userController.asignarRol);
router.patch('/:id/estado', requirePermission('usuarios.gestionar'), userController.cambiarEstado);

module.exports = router;