const pool = require('../config/db');

/** Guarda un token como inválido a partir de este momento (logout real). */
async function blacklistToken(token, usuarioId, expiraEn) {
  await pool.execute(
    'INSERT INTO tokens_invalidados (token, usuario_id, expira_en) VALUES (?, ?, ?)',
    [token, usuarioId, expiraEn]
  );
}

/** Revisa si un token ya fue invalidado (cerró sesión antes de expirar). */
async function isTokenBlacklisted(token) {
  const [rows] = await pool.execute(
    'SELECT id FROM tokens_invalidados WHERE token = ? LIMIT 1',
    [token]
  );
  return rows.length > 0;
}

/** Limpieza opcional: borra de la tabla los tokens ya vencidos. */
async function purgeExpired() {
  await pool.execute('DELETE FROM tokens_invalidados WHERE expira_en < NOW()');
}

module.exports = { blacklistToken, isTokenBlacklisted, purgeExpired };
