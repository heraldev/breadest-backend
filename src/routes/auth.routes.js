const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { verifyAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protección contra fuerza bruta en el login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 10 intentos por IP en esa ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos.' },
});

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', verifyAuth, authController.logout);
router.get('/me', verifyAuth, authController.me);

module.exports = router;
