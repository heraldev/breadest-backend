const express = require('express');
const { verifyAuth } = require('../middlewares/auth.middleware');
const { requireRole, requirePermission } = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * Rutas de ejemplo que demuestran la Parte 3 (Control de acceso):
 * cada módulo queda restringido por PERMISO, no solo por rol, para que
 * el acceso sea flexible aunque cambie qué rol tiene ese permiso.
 * Reemplázalas por tus controladores reales de productos/pedidos cuando
 * los desarrolles; por ahora solo confirman que la protección funciona.
 */

router.get('/productos', verifyAuth, requirePermission('productos.ver'), (req, res) => {
  res.json({ mensaje: 'Acceso concedido al módulo de productos', usuario: req.user.email });
});

router.post('/productos', verifyAuth, requirePermission('productos.gestionar'), (req, res) => {
  res.json({ mensaje: 'Acceso concedido para gestionar productos', usuario: req.user.email });
});

router.get('/pedidos', verifyAuth, requirePermission('pedidos.ver'), (req, res) => {
  res.json({ mensaje: 'Acceso concedido al módulo de pedidos', usuario: req.user.email });
});

router.patch('/pedidos/:id', verifyAuth, requirePermission('pedidos.gestionar'), (req, res) => {
  res.json({ mensaje: 'Acceso concedido para gestionar pedidos', usuario: req.user.email });
});

// Este módulo se protege por ROL directamente, no por permiso individual
router.get('/reportes', verifyAuth, requireRole('Administrador'), (req, res) => {
  res.json({ mensaje: 'Acceso concedido al módulo de reportes', usuario: req.user.email });
});

module.exports = router;
