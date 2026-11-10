const express = require('express');
const { verifyAuth } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/role.middleware');
const configController = require('../controllers/config.controller');

const router = express.Router();

// Pública: el Home del sitio la consulta sin necesidad de sesión
router.get('/banner-temporada', configController.obtenerBannerTemporada);

// Protegida: solo quien tenga el permiso "configuracion.gestionar"
// (Administrador y Editor, según el seed)
router.patch(
  '/banner-temporada',
  verifyAuth,
  requirePermission('configuracion.gestionar'),
  configController.actualizarBannerTemporada
);

module.exports = router;