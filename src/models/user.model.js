const pool = require('../config/db');

/** Crea un usuario nuevo. La contraseña ya debe venir cifrada (hash). */
async function createUser({ nombre, email, passwordHash }) {
  const [result] = await pool.execute(
    'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)',
    [nombre, email, passwordHash]
  );
  return result.insertId;
}

/** Busca un usuario por correo, incluyendo el hash (para validar login). */
async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT * FROM usuarios WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

/** Busca un usuario por id, SIN el hash de contraseña (para exponerlo). */
async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, nombre, email, activo, creado_en FROM usuarios WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

/** Lista todos los usuarios (uso administrativo). */
async function findAll() {
  const [rows] = await pool.execute(
    'SELECT id, nombre, email, activo, creado_en FROM usuarios ORDER BY id DESC'
  );
  return rows;
}

/** Asigna un rol a un usuario (idempotente: no falla si ya lo tenía). */
async function assignRole(usuarioId, rolId) {
  await pool.execute(
    'INSERT IGNORE INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)',
    [usuarioId, rolId]
  );
}

/** Quita un rol a un usuario. */
async function removeRole(usuarioId, rolId) {
  await pool.execute(
    'DELETE FROM usuario_rol WHERE usuario_id = ? AND rol_id = ?',
    [usuarioId, rolId]
  );
}

/** Obtiene los roles asignados a un usuario. */
async function getRolesByUserId(usuarioId) {
  const [rows] = await pool.execute(
    `SELECT r.id, r.nombre
     FROM roles r
     INNER JOIN usuario_rol ur ON ur.rol_id = r.id
     WHERE ur.usuario_id = ?`,
    [usuarioId]
  );
  return rows;
}

/**
 * Obtiene el conjunto de permisos "efectivos" de un usuario: la unión de
 * todos los permisos de todos los roles que tenga asignados.
 */
async function getPermissionsByUserId(usuarioId) {
  const [rows] = await pool.execute(
    `SELECT DISTINCT p.nombre
     FROM permisos p
     INNER JOIN rol_permiso rp ON rp.permiso_id = p.id
     INNER JOIN usuario_rol ur ON ur.rol_id = rp.rol_id
     WHERE ur.usuario_id = ?`,
    [usuarioId]
  );
  return rows.map((r) => r.nombre);
}

/** Lista usuarios que tienen un rol específico (ej. todos los "Editor"). */
async function findAllByRole(rolNombre) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.nombre, u.email, u.activo, u.creado_en
     FROM usuarios u
     INNER JOIN usuario_rol ur ON ur.usuario_id = u.id
     INNER JOIN roles r ON r.id = ur.rol_id
     WHERE r.nombre = ?
     ORDER BY u.id DESC`,
    [rolNombre]
  );
  return rows;
}

/** Activa (true) o desactiva (false) el acceso de un usuario. */
async function setActivo(usuarioId, activo) {
  await pool.execute('UPDATE usuarios SET activo = ? WHERE id = ?', [activo ? 1 : 0, usuarioId]);
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  findAll,
  findAllByRole,
  setActivo,
  assignRole,
  removeRole,
  getRolesByUserId,
  getPermissionsByUserId,
};