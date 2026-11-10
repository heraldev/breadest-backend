const express = require('express');
const router = express.Router();
const { enviarContacto } = require('../controllers/contact.controller');

// POST /api/contacto
router.post('/', enviarContacto);

module.exports = router;