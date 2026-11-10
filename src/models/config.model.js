const pool = require('../config/db');

/** Lee el valor de una configuración (o null si no existe). */
async function getValor(clave) {
  const [rows] = await pool.execute(
    'SELECT valor FROM configuraciones WHERE clave = ? LIMIT 1',
    [clave]
  );
  return rows[0]?.valor ?? null;
}

/** Crea o actualiza el valor de una configuración. */
async function setValor(clave, valor) {
  await pool.execute(
    `INSERT INTO configuraciones (clave, valor) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE valor = VALUES(valor), actualizado_en = CURRENT_TIMESTAMP`,
    [clave, valor]
  );
}

module.exports = { getValor, setValor };