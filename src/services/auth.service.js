const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 12;

/**
 * Cifra una contraseña en texto plano usando bcrypt (hash + salt).
 * Nunca se guarda ni se compara la contraseña en texto plano.
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compara una contraseña en texto plano contra su hash almacenado.
 */
async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Genera un JWT firmado con los datos mínimos necesarios para autorizar
 * al usuario en las siguientes peticiones (id, email, roles, permisos).
 */
function generateToken(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

/**
 * Verifica la firma y la vigencia de un token. Lanza error si es
 * inválido o si ya expiró (jsonwebtoken distingue el tipo de error).
 */
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

/**
 * Decodifica el token sin validar (solo para leer su expiración al
 * momento de invalidarlo en logout, cuando ya sabemos que es válido).
 */
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  decodeToken,
};
