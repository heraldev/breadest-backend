const userModel = require('../models/user.model');
const roleModel = require('../models/role.model');
const tokenModel = require('../models/token.model');
const authService = require('../services/auth.service');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /api/auth/register — Registro de usuarios */
async function register(req, res, next) {
  try {
    const { nombre, email, password } = req.body;

    // Validación de credenciales / datos de entrada
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'El correo no tiene un formato válido' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const existente = await userModel.findByEmail(email);
    if (existente) {
      return res.status(409).json({ error: 'Ya existe una cuenta registrada con ese correo' });
    }

    // Cifrado de contraseña antes de guardar (nunca texto plano)
    const passwordHash = await authService.hashPassword(password);
    const usuarioId = await userModel.createUser({ nombre, email, passwordHash });

    // Todo registro público entra con el rol base "Usuario"
    const rolUsuario = await roleModel.findByName('Usuario');
    if (rolUsuario) {
      await userModel.assignRole(usuarioId, rolUsuario.id);
    }

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: { id: usuarioId, nombre, email },
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/login — Inicio de sesión */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const usuario = await userModel.findByEmail(email);

    // Mensaje genérico a propósito: no revelamos si el correo existe o no
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValida = await authService.comparePassword(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const roles = await userModel.getRolesByUserId(usuario.id);
    const permisos = await userModel.getPermissionsByUserId(usuario.id);

    const token = authService.generateToken({
      sub: usuario.id,
      email: usuario.email,
      roles: roles.map((r) => r.nombre),
      permisos,
    });

    return res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        roles: roles.map((r) => r.nombre),
        permisos,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/logout — Cierre de sesión (invalida el token actual) */
async function logout(req, res, next) {
  try {
    const decoded = authService.decodeToken(req.token);
    const expiraEn = new Date(decoded.exp * 1000);

    await tokenModel.blacklistToken(req.token, req.user.id, expiraEn);

    return res.json({ mensaje: 'Sesión cerrada correctamente' });
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me — Perfil del usuario autenticado (roles y permisos) */
async function me(req, res, next) {
  try {
    const usuario = await userModel.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json({
      usuario: {
        ...usuario,
        roles: req.user.roles,
        permisos: req.user.permisos,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };
