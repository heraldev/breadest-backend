const pool = require('../config/db');

async function findByName(nombre) {
  const [rows] = await pool.execute(
    'SELECT * FROM roles WHERE nombre = ? LIMIT 1',
    [nombre]
  );
  return rows[0] || null;
}

async function findAll() {
  const [rows] = await pool.execute('SELECT * FROM roles ORDER BY id');
  return rows;
}

/** Permisos que otorga un rol específico. */
async function getPermissionsByRoleId(rolId) {
  const [rows] = await pool.execute(
    `SELECT p.nombre
     FROM permisos p
     INNER JOIN rol_permiso rp ON rp.permiso_id = p.id
     WHERE rp.rol_id = ?`,
    [rolId]
  );
  return rows.map((r) => r.nombre);
}

async function findAllPermissions() {
  const [rows] = await pool.execute('SELECT * FROM permisos ORDER BY nombre');
  return rows;
}

module.exports = {
  findByName,
  findAll,
  getPermissionsByRoleId,
  findAllPermissions,
};
