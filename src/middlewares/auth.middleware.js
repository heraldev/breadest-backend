const authService = require('../services/auth.service');
const tokenModel = require('../models/token.model');
const userModel = require('../models/user.model');

/**
 * Middleware de autenticación (validación de sesión).
 * Se coloca en CUALQUIER ruta que no deba ser accesible por URL directa
 * sin haber iniciado sesión: exige un header "Authorization: Bearer <token>",
 * valida su firma/vigencia, revisa que no esté en la lista negra (logout)
 * y confirma que el usuario siga existiendo y activo.
 */
async function verifyAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No se proporcionó un token de autenticación' });
    }

    const token = header.split(' ')[1];

    const enListaNegra = await tokenModel.isTokenBlacklisted(token);
    if (enListaNegra) {
      return res.status(401).json({ error: 'La sesión fue cerrada, inicia sesión de nuevo' });
    }

    let payload;
    try {
      payload = authService.verifyToken(token);
    } catch (err) {
      const mensaje =
        err.name === 'TokenExpiredError'
          ? 'El token expiró, inicia sesión de nuevo'
          : 'Token inválido';
      return res.status(401).json({ error: mensaje });
    }

    const usuario = await userModel.findById(payload.sub);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'El usuario no existe o está inactivo' });
    }

    // A partir de aquí, cualquier controlador puede confiar en req.user
    req.user = {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
      permisos: payload.permisos || [],
    };
    req.token = token;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyAuth };
